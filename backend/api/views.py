from datetime import datetime

from rest_framework import viewsets
from rest_framework import views
from rest_framework.response import Response
from rest_framework.status import *

from django.core.exceptions import ValidationError

import pandas as pd

from .models import Rule, Category, BudgetEdit
from .serializers import RuleSerializer, CategorySerializer, BudgetSerializer, BudgetEditSerializer
from .filters import RuleFilter, CategoryFilter


class RuleViewset(viewsets.ModelViewSet):
    queryset = Rule.objects.all()
    serializer_class = RuleSerializer
    filterset_class = RuleFilter
    search_fields = "__all__"
    ordering_fields = "__all__"


class CategoryViewset(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    search_fields = "__all__"
    ordering_fields = "__all__"

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        data = serializer.data

        has_rule = Rule.objects.filter(category=instance).exists()

        data["rule"] = RuleSerializer(
            Rule.objects.get(category=instance)
        ).data if has_rule else None

        data["repeat"] = "Yes" if has_rule else "No"

        return Response(data, HTTP_200_OK)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)

        data = serializer.data

        for i in range(len(data)):
            has_rule = Rule.objects.filter(
                category=Category.objects.get(name=data[i]["name"])).exists()

            data[i]["rule"] = RuleSerializer(
                Rule.objects.get(
                    category=Category.objects.get(name=data[i]["name"]))
            ).data if has_rule else None

            data[i]["repeat"] = "Yes" if has_rule else "No"

        return Response(data, HTTP_200_OK)


class BudgetEditViewset(viewsets.ModelViewSet):
    queryset = BudgetEdit.objects.all()
    serializer_class = BudgetEditSerializer
    search_fields = "__all__"
    ordering_fields = "__all__"

    def create(self, request, *args, **kwargs):
        category = request.data.get("category", None)
        date = request.data.get("date", None)
        amount = request.data.get("amount", None)

        if category is None or date is None or amount is None:
            return Response(
                {"error": "category, date, and amount are required"},
                HTTP_400_BAD_REQUEST
            )

        try:
            category = Category.objects.get(id=category)
        except Category.DoesNotExist:
            return Response(
                {"error": "category does not exist"},
                HTTP_400_BAD_REQUEST
            )

        try:
            date = pd.to_datetime(date).date()
        except ValueError:
            return Response(
                {"error": "date must be in YYYY-MM-DD format"},
                HTTP_400_BAD_REQUEST
            )

        try:
            amount = float(amount)
        except ValueError:
            return Response(
                {"error": "amount must be a number"},
                HTTP_400_BAD_REQUEST
            )

        # unique together validation, update if exists
        try:
            budget_edit = BudgetEdit.objects.get(category=category, date=date)
            budget_edit.amount = amount
            budget_edit.save()

        except BudgetEdit.DoesNotExist:  # create if does not exist
            try:
                budget_edit = BudgetEdit.objects.create(
                    category=category,
                    date=date,
                    amount=amount
                )
            except ValidationError as e:
                return Response(
                    {"error": e.messages},
                    HTTP_400_BAD_REQUEST
                )

        serializer = BudgetEditSerializer(budget_edit)

        return Response(serializer.data, HTTP_201_CREATED)


class BudgetView(views.APIView):
    def get(self, request, *args, **kwargs):
        """
        This will return a dataframe with the following columns:

        date: date of occurrence
        categories: list of categories that occurred on that date
        group_totals: dictionary of group totals for that date
        row_total: total amount for that date
        balance: cumulative sum of row_total

        The categories will be modified with BudgetEdits if they exist. The budget_edits will 
        either change the amount of the category if or add/remove the category from the 
        list of categories.

        The group_totals, row_total, and balance will be modified with BudgetEdits if they exist
        based on the category(s) that were edited.

        """
        end_date = request.query_params.get("end_date", None)

        # validate end_date
        if end_date is None:
            return Response(
                {"error": "end_date is required"},
                HTTP_400_BAD_REQUEST
            )

        try:
            # get earliest date among rules and budget_edits
            earliest_date = None
            try:
                earliest_date = BudgetEdit.objects.earliest("date").date
            except BudgetEdit.DoesNotExist:
                earliest_date = datetime.today().date()

            start_date = pd.to_datetime(
                min(
                    [
                        Rule.objects.earliest("start_date").start_date,
                        earliest_date
                    ]
                )
            )
            end_date = pd.to_datetime(end_date)

        except ValueError:
            return Response(
                {"error": "end_date must be in YYYY-MM-DD format"},
                HTTP_400_BAD_REQUEST
            )

        if start_date > end_date:
            return Response(
                {"error": f"end_date must be after {start_date}"},
                HTTP_400_BAD_REQUEST
            )

        # get categories
        all_categories = Category.objects.all()
        fixed_categories = Category.objects.filter(group="Fixed")
        variable_categories = Category.objects.filter(group="Variable")
        discretionary_categories = Category.objects.filter(
            group="Discretionary")
        income_categories = Category.objects.filter(group="Income")
        savings_categories = Category.objects.filter(group="Savings")

        category_dict = {
            "all": all_categories,
            "Fixed": fixed_categories,
            "Variable": variable_categories,
            "Discretionary": discretionary_categories,
            "Income": income_categories,
            "Savings": savings_categories,
        }

        # get all occurrences for each category between start_date and end_date
        all_occurrences = pd.Series([])
        individual_occurrences = {}

        # categories that have a rule
        for category in all_categories:
            if Rule.objects.filter(category=category).exists():

                rule_occurrences = Rule.objects.get(
                    category=category).get_occurrences(start_date, end_date)

                category_occurrences = pd.Series(
                    [occurrence.date() for occurrence in rule_occurrences])

                non_rule_occurrences = BudgetEdit.objects.filter(
                    category=category, date__gte=start_date, date__lte=end_date).values_list("date", flat=True)

                category_occurrences = pd.concat(
                    [category_occurrences, pd.Series(
                        [occurrence for occurrence in non_rule_occurrences]
                    )])

                all_occurrences = pd.concat(
                    [all_occurrences, category_occurrences])

                individual_occurrences[category.name] = rule_occurrences

        # categories that have a rule but a budget edit exists for a date that is not in the rule occurrences
        for budget_edit in BudgetEdit.objects.filter(date__gte=start_date, date__lte=end_date, category__rule__isnull=True):
            # add date to all_occurrences if it does not exist
            if budget_edit.date not in all_occurrences.values:
                all_occurrences = pd.concat(
                    [all_occurrences, pd.Series([budget_edit.date])])

                individual_occurrences[budget_edit.category.name] = [
                    datetime(budget_edit.date.year,
                             budget_edit.date.month, budget_edit.date.day),
                ]

        # categories that do not have a rule but have a budget edit
        for budget_edit in BudgetEdit.objects.filter(date__gte=start_date, date__lte=end_date, category__rule__isnull=True):
            # add date to all_occurrences if it does not exist
            if budget_edit.date not in all_occurrences.values:
                all_occurrences = pd.concat(
                    [all_occurrences, pd.Series([budget_edit.date])])

                individual_occurrences[budget_edit.category.name] = [
                    datetime(budget_edit.date.year,
                             budget_edit.date.month, budget_edit.date.day),
                ]

        # categories with no rule and no budget edit
        for category in all_categories:
            if category.name not in individual_occurrences.keys():
                individual_occurrences[category.name] = []

        # remove duplicates and sort
        all_occurrences = all_occurrences.drop_duplicates().sort_values()

        # create dataframe with columns for date, categories, group_totals, row_total, and balance
        categories_data = all_occurrences.map(
            lambda date: [
                category.name
                for category in all_categories
                if date in [
                    date.date()
                    for date in individual_occurrences[category.name]
                ]
            ]
        )

        group_totals_data = all_occurrences.map(
            lambda date: {
                category.group: sum(
                    [
                        # if date is in occurrences for category and no budget edit exists, use category adjusted_amount
                        # if date is in occurrences for category and budget edit exists, use budget edit adjusted_amount
                        # if date is NOT in occurrences for category, use 0

                        category.adjusted_amount

                        if (date in [
                            date.date()
                            for date in individual_occurrences[category.name]
                        ]) and not (
                            BudgetEdit.objects.filter(
                                category=category, date=date).exists()
                        ) else BudgetEdit.objects.get(category=category, date=date).adjusted_amount if (
                            BudgetEdit.objects.filter(
                                category=category, date=date).exists()
                        ) else 0

                        for category in category_dict[category.group]
                    ]
                )
                for category in all_categories
            }
        )

        row_total_data = all_occurrences.map(
            lambda date: sum(
                [
                    # if date is in occurrences for category and no budget edit exists, use category adjusted_amount
                    # if date is in occurrences for category and budget edit exists, use budget edit adjusted_amount
                    # if date is NOT in occurrences for category, use 0

                    category.adjusted_amount

                    if (date in [
                        date.date()
                        for date in individual_occurrences[category.name]
                    ]) and not (
                        BudgetEdit.objects.filter(
                            category=category, date=date).exists()

                    ) else BudgetEdit.objects.get(category=category, date=date).adjusted_amount if (
                        BudgetEdit.objects.filter(
                            category=category, date=date).exists()
                    ) else 0

                    for category in all_categories
                ]
            )
        )

        # note: data keys are column names, data values are column values for each row
        data = {
            "date": all_occurrences,
            "categories": categories_data,
            "budget_edits": all_occurrences.map(
                lambda date: [
                    budget_edit.id
                    for budget_edit in BudgetEdit.objects.filter(date=date)
                ]),
            "group_totals": group_totals_data,
            "row_total": row_total_data,
            "balance": row_total_data.cumsum(),
        }

        df = pd.DataFrame(data)
        df.index = range(0, len(df))

        serializer = BudgetSerializer(df)

        return Response(serializer.data, HTTP_200_OK)


class CategoryBatchView(views.APIView):
    def delete(self, request, *args, **kwargs):
        categories = request.data

        if categories is None:
            return Response(
                {"error": "categories is required"},
                HTTP_400_BAD_REQUEST
            )

        try:
            categories = [Category.objects.get(id=category["id"])
                          for category in categories]
        except Category.DoesNotExist:
            return Response(
                {"error": "one or more categories do not exist"},
                HTTP_400_BAD_REQUEST
            )

        for category in categories:
            category.delete()

        return Response({"success": "categories deleted"}, HTTP_200_OK)


class BudgetEditBatch(views.APIView):
    def delete(self, request, *args, **kwargs):
        budget_edits = request.data

        if budget_edits is None or budget_edits[0] is None:
            # Okay to have budget_edits[0] is None
            # budget_edits[0] happens when the user sends delete request for category with rule
            # and the category has no budget_edits, the budget row is then reverted to the
            # original category amount
            return Response({"success": "no budget_edits to delete"}, HTTP_200_OK)

        try:
            budget_edits = [BudgetEdit.objects.get(id=budget_edit["id"])
                            for budget_edit in budget_edits]
        except BudgetEdit.DoesNotExist:
            return Response(
                {"error": "one or more budget_edits do not exist"},
                HTTP_400_BAD_REQUEST
            )

        for budget_edit in budget_edits:
            budget_edit.delete()

        return Response({"success": "budget_edits deleted"}, HTTP_200_OK)

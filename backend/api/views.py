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


class BudgetView(views.APIView):
    def get(self, request, *args, **kwargs):
        end_date = request.query_params.get("end_date", None)

        # validate end_date
        if end_date is None:
            return Response(
                {"error": "end_date is required"},
                HTTP_400_BAD_REQUEST
            )

        try:
            start_date = pd.to_datetime(
                Rule.objects.earliest("start_date").start_date)
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
        all_categories = Category.objects.filter(rule__isnull=False)
        fixed_categories = Category.objects.filter(group="Fixed").filter(
            rule__isnull=False)
        variable_categories = Category.objects.filter(group="Variable").filter(
            rule__isnull=False)
        discretionary_categories = Category.objects.filter(
            group="Discretionary").filter(rule__isnull=False)
        income_categories = Category.objects.filter(group="Income").filter(
            rule__isnull=False)
        savings_categories = Category.objects.filter(group="Savings").filter(
            rule__isnull=False)

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

        for category in all_categories:
            if Rule.objects.filter(category=category).exists():
                rule_occurrences = Rule.objects.get(
                    category=category).get_occurrences(start_date, end_date)
                category_occurrences = pd.Series(
                    [occurrence.date() for occurrence in rule_occurrences])
                all_occurrences = pd.concat(
                    [all_occurrences, category_occurrences])
                individual_occurrences[category.name] = rule_occurrences

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
                        category.adjusted_amount
                        for category in category_dict[category.group]
                        if date in [
                            date.date()
                            for date in individual_occurrences[category.name]
                        ]
                    ]
                )
                for category in all_categories
            }
        )

        row_total_data = all_occurrences.map(
            lambda date: sum(
                [
                    category.adjusted_amount
                    for category in all_categories
                    if date in [
                        date.date()
                        for date in individual_occurrences[category.name]
                    ]
                ]
            )
        )

        data = {
            "date": all_occurrences,
            "categories": categories_data,
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


class BudgetEditView(views.APIView):
    def post(self, request, *args, **kwargs):
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
            date = pd.to_datetime(date)
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

        return Response(serializer.data, HTTP_200_OK)

    def delete(self, request, *args, **kwargs):
        budget_edit = request.data.get("budget_edit", None)

        if budget_edit is None:
            return Response(
                {"error": "budget_edit is required"},
                HTTP_400_BAD_REQUEST
            )

        try:
            budget_edit = BudgetEdit.objects.get(id=budget_edit)
        except BudgetEdit.DoesNotExist:
            return Response(
                {"error": "budget_edit does not exist"},
                HTTP_400_BAD_REQUEST
            )

        budget_edit.delete()

        return Response({"success": "budget_edit deleted"}, HTTP_200_OK)

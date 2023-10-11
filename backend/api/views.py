from rest_framework import viewsets
from rest_framework import views
from rest_framework.response import Response
from rest_framework.status import *

from django.core.exceptions import ValidationError

import pandas as pd

from .models import Rule, Category
from .serializers import RuleSerializer, CategorySerializer, BudgetSerializer
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
        
        start_date = request.query_params.get("start_date", None)
        end_date = request.query_params.get("end_date", None)

        # validate start_date and end_date
        if start_date is None or end_date is None:
            return Response(
                {"error": "start_date and end_date are required"},
                HTTP_400_BAD_REQUEST
            )

        try:
            start_date = pd.to_datetime(start_date)
            end_date = pd.to_datetime(end_date)
        except ValueError:
            return Response(
                {"error": "start_date and end_date must be in YYYY-MM-DD format"},
                HTTP_400_BAD_REQUEST
            )

        if start_date > end_date:
            return Response(
                {"error": "start_date must be before end_date"},
                HTTP_400_BAD_REQUEST
            )

        # get categories
        # all_categories = Category.objects.all()
        rules_categories = Category.objects.filter(rule__isnull=False)
        fixed_categories = Category.objects.filter(group="Fixed")
        variable_categories = Category.objects.filter(group="Variable")
        discretionary_categories = Category.objects.filter(
            group="Discretionary")
        income_categories = Category.objects.filter(group="Income")
        savings_categories = Category.objects.filter(group="Savings")

        category_dict = {
            # "all": all_categories,
            "Rules": rules_categories,
            "Fixed": fixed_categories,
            "Variable": variable_categories,
            "Discretionary": discretionary_categories,
            "Income": income_categories,
            "Savings": savings_categories,
        }

        # get all occurrences for each category between start_date and end_date
        all_occurrences = pd.Series([])
        individual_occurrences = {}

        for category in rules_categories:
            rule = Rule.objects.get(category=category)
            rule_occurrences = rule.get_occurrences(start_date, end_date)
            category_occurrences = pd.Series(
                [occurrence.date()
                    for occurrence in rule_occurrences]
            )
            all_occurrences = pd.concat(
                [all_occurrences, category_occurrences])
            individual_occurrences[category.name] = rule_occurrences

        all_occurrences = all_occurrences.drop_duplicates().sort_values()

        # get prior occurrences for each category between earliest_start_date and start_date
        earliest_start_date = pd.to_datetime(
            Rule.objects.earliest("start_date").start_date)

        prior_occurrences = pd.Series([])
        prior_individual_occurrences = {}

        for category in rules_categories:
            rule = Rule.objects.get(category=category)
            rule_occurrences = rule.get_occurrences(
                earliest_start_date, start_date)
            category_occurrences = pd.Series(
                [occurrence.date()
                    for occurrence in rule_occurrences]
            )
            prior_occurrences = pd.concat(
                [prior_occurrences, category_occurrences])
            prior_individual_occurrences[category.name] = rule_occurrences

        prior_occurrences = prior_occurrences.drop_duplicates().sort_values()

        # get prior balance (sum total of all prior occurrences)
        prior_balance = prior_occurrences.map(
            lambda date: sum(
                [
                    category.adjusted_amount
                    for category in rules_categories
                    if date in [
                        date.date()
                        for date in prior_individual_occurrences.get(category.name, [])
                    ]
                ]
            )
        ).sum()

        # create dataframe with columns for date, categories, group_totals, row_total, and balance
        categories_data = all_occurrences.map(
            lambda date: [
                category.name
                for category in rules_categories
                if date in [
                    date.date()
                    for date in individual_occurrences.get(category.name, [])
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
                            for date in individual_occurrences.get(category.name, [])
                        ]
                    ]
                )
                for category in rules_categories
            }
        )

        row_total_data = all_occurrences.map(
            lambda date: sum(
                [
                    category.adjusted_amount
                    for category in rules_categories
                    if date in [
                        date.date()
                        for date in individual_occurrences.get(category.name, [])
                    ]
                ]
            )
        )

        data = {
            "date": all_occurrences,
            "categories": categories_data,
            "group_totals": group_totals_data,
            "row_total": row_total_data,
            "balance": prior_balance + row_total_data.cumsum(),
        }

        df = pd.DataFrame(data)
        df.index = range(0, len(df))

        serializer = BudgetSerializer(df)

        return Response(serializer.data, HTTP_200_OK)

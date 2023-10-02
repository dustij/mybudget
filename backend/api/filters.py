from django_filters import rest_framework as filters

from .models import Rule, Category


class RuleFilter(filters.FilterSet):
    class Meta:
        model = Rule
        fields = "__all__"


class CategoryFilter(filters.FilterSet):
    class Meta:
        model = Category
        fields = "__all__"

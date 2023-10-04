from rest_framework import viewsets
from rest_framework import views
from rest_framework.response import Response
from rest_framework.status import *

from django.core.exceptions import ValidationError

from .models import Rule, Category
from .serializers import RuleSerializer, CategorySerializer
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


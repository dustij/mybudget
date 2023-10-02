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

    def create(self, request, *args, **kwargs):
        try:
            return super().create(request, *args, **kwargs)
        except ValidationError as err:
            return Response({"detail": err.message_dict["__all__"][0]}, HTTP_400_BAD_REQUEST)


class CategoryViewset(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filterset_class = CategoryFilter
    search_fields = "__all__"
    ordering_fields = "__all__"


class EnumChoices(views.APIView):
    def get(self, request):
        frequency_choices = []
        for key, display_name in Rule.Frequency.choices:
            frequency_choices.append(
                {'key': key, 'display_name': display_name})

        weekday_choices = []
        for key, display_name in Rule.Weekday.choices:
            weekday_choices.append({'key': key, 'display_name': display_name})

        return Response({
            "frequency_choices": frequency_choices,
            "weekday_choices": weekday_choices
        }, HTTP_200_OK)

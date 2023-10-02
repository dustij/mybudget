from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter(trailing_slash=False)
router.register("rule", views.RuleViewset)
router.register("category", views.CategoryViewset)

urlpatterns = [
    path("", include(router.urls)),
    path("enum_choices", views.EnumChoices.as_view())
]

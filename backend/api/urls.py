from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter(trailing_slash=False)
router.register("rule", views.RuleViewset)
router.register("category", views.CategoryViewset)
router.register("budget-edit", views.BudgetEditViewset)

urlpatterns = [
    path("", include(router.urls)),
    path("budget", views.BudgetView.as_view(), name="budget"),
    path("category-batch-delete", views.CategoryBatchView.as_view(), name="category-batch-delete"),
    path("budget-edit-batch-delete", views.BudgetEditBatch.as_view(), name="budget-edit-batch-delete"),
]

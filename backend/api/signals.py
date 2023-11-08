from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from .models import Category, Rule, BudgetEdit

@receiver(pre_delete, sender=Category)
def delete_rule_on_delete_category(sender, instance, **kwargs):
    rule = instance.rule
    if rule is not None:
        rule.delete()

@receiver(post_save, sender=Category)
def delete_rule_on_update_category(sender, instance, **kwargs):
    categoryless_rules = Rule.objects.filter(category=None)
    for rule in categoryless_rules:
        rule.delete()

# TODO: clean up any $0 budget_edits for categories with rules but have dates other than their rule occurnces
#     (i.e. if a rule is set to occur on the 1st of every month, but the category has a budget_edit for the 15th of the month,
#     if this category has a budet_edit set to $0, it will be shown as $0 edit on the 1st, so the user knows this is a normal occurence but the amount has been change,
#     but will not be shown on the 15th becuase it is not a normal occurrence and the amount is $0 anyways,
#     so we should clean up the $0 edit on the 15th and remove it from the database)
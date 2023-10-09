from django.db.models.signals import pre_delete, post_save
from django.dispatch import receiver
from .models import Category, Rule

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
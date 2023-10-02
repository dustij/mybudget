from rest_framework import serializers

from .models import Rule, Category


class RuleSerializer(serializers.ModelSerializer):
    frequency_display = serializers.SerializerMethodField()
    weekday_display = serializers.SerializerMethodField()

    class Meta:
        model = Rule
        fields = "__all__"

    def get_frequency_display(self, obj):
        return obj.get_frequency_display()

    def get_weekday_display(self, obj):
        return obj.get_weekday_display()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"

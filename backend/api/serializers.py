from rest_framework import serializers

from .models import Rule, Category


class RuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rule
        fields = "__all__"


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class BudgetSerializer(serializers.Serializer):
    # serialize pandas dataframe
    dataframe = serializers.SerializerMethodField()

    def get_dataframe(self, instance):
        # convert dataframe occurence column to date string format YYYY-MM-DD
        instance["date"] = instance["date"].map(
            lambda x: x.strftime("%Y-%m-%d"))

        data = instance.to_dict(orient="records")

        # transform data['categories'] from list of names to list of serialized Category objects
        for row in data:
            row["categories"] = map(
                lambda category: CategorySerializer(
                    Category.objects.get(name=category)).data,
                row["categories"]
            )

        return data

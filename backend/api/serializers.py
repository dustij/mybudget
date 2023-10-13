from rest_framework import serializers

from .models import Rule, Category, BudgetEdit


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

        # convert categories and budget_edits to nested objects
        data = instance.to_dict(orient="records")
        for row in data:

            row["categories"] = map(
                lambda category: CategorySerializer(
                    Category.objects.get(name=category)).data,
                row["categories"]
            )

            row["budget_edits"] = map(
                lambda budget_edit: BudgetEditSerializer(
                    BudgetEdit.objects.get(id=budget_edit)).data,
                row["budget_edits"])


            # row["budget_edits"] = map(
            #     lambda budget_edit: BudgetEditSerializer(
            #         BudgetEdit.objects.get(id=budget_edit["id"])).data,
            #     BudgetEdit.objects.filter(date=row["date"]).values())

        # update group_totals, row_total, and balance by replacing category
        # adjusted_amounts with their respective budget_edits adjusted_amounts
        # change only rows with budget_edits
        


        #     print(data[data.index(row)])
        #     row["group_totals"] = {
        #         group: 0
        #         for group in ["Fixed", "Variable", "Discretionary", "Income", "Savings"]
        #     }
        #     for category in row["categories"]:
        #         for budget_edit in row["budget_edits"]:
        #             if category["id"] == budget_edit["category"]["id"]:
        #                 category["adjusted_amount"] = budget_edit["adjusted_amount"]


        #     row["group_totals"] = {
        #         group: sum(map(
        #             lambda category:
        #             category["adjusted_amount"],
        #             filter(lambda category: category["group"] == group, row["categories"])))
        #         for group in ["Fixed", "Variable", "Discretionary", "Income", "Savings"]
        #     }
            

        # for row in data:
        #     row["group_totals"] = {
        #         group: sum(map(
        #             lambda category:
        #             category["adjusted_amount"],
        #             filter(lambda category: category["group"] == group, row["categories"])))
        #         for group in ["Fixed", "Variable", "Discretionary", "Income", "Savings"]
        #     }
        #     row["row_total"] = sum(
        #         map(lambda category: category["adjusted_amount"], row["categories"]))
            # row["balance"] = row["row_total"] + row["group_totals"]["Income"]

        return data


class BudgetEditSerializer(serializers.ModelSerializer):
    class Meta:
        model = BudgetEdit
        fields = "__all__"
        depth = 1

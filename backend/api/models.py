from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from dateutil.rrule import rrule, WEEKLY, DAILY, MONTHLY, YEARLY, SU, MO, TU, WE, TH, FR, SA


class Rule(models.Model):
    frequency = models.CharField(max_length=100, choices=[
        ("Yearly", "Yearly"),
        ("Monthly", "Monthly"),
        ("Biweekly", "Biweekly"),
        ("Weekly", "Weekly"),
        ("Daily", "Daily"),
    ])
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    weekday = models.CharField(max_length=100, null=True, blank=True, choices=[
        ("Monday", "Monday"),
        ("Tuesday", "Tuesday"),
        ("Wednesday", "Wednesday"),
        ("Thursday", "Thursday"),
        ("Friday", "Friday"),
        ("Saturday", "Saturday"),
        ("Sunday", "Sunday")
    ])
    day_of_month = models.PositiveIntegerField(null=True, blank=True, validators=[
        MinValueValidator(1), MaxValueValidator(31)])
    month_of_year = models.PositiveIntegerField(null=True, blank=True, validators=[
        MinValueValidator(1), MaxValueValidator(12)])

    def __str__(self):
        return f"{self.frequency}"

    def get_rrule(self):
        """
        Generates and returns an rrule based on the rule's settings.
        """
        params = {
            "interval": self.interval,
            "dtstart": self.start_date,
            "until": self.end_date,
        }

        if self.frequency == "Daily":
            return rrule(DAILY, **params)

        if self.frequency == "Weekly":
            params["byweekday"] = self.weekday
            return rrule(WEEKLY, **params)

        if self.frequency == "Biweekly":
            params["byweekday"] = self.weekday
            params["interval"] = 2
            return rrule(WEEKLY, **params)

        if self.frequency == "Monthly":
            params["bymonthday"] = self.day_of_month
            return rrule(MONTHLY, **params)

        if self.frequency == "Yearly":
            params["bymonth"] = self.month_of_year
            params["bymonthday"] = self.day_of_month
            return rrule(YEARLY, **params)

        return None

    def clean(self):
        """
        Validate fields based on the selected frequency.
        """
        super().clean()

        if self.frequency == "Weekly" or self.frequency == "Biweekly":
            if self.weekday is None:
                raise ValidationError(
                    "Weekly and biweekly frequencies should have weekday.")

        if self.frequency == "Monthly":
            if self.day_of_month is None:
                raise ValidationError(
                    "Monthly frequency should have day_of_month.")

        if self.frequency == "Yearly":
            if self.month_of_year is None or self.day_of_month is None:
                raise ValidationError(
                    "Yearly frequency should have month_of_year and day_of_month.")

    def get_occurrences(self, start_date, end_date):
        """
        Returns a list of occurrences between start and end.
        """
        return self.get_rrule().between(start_date, end_date, inc=True)

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)


class Category(models.Model):
    """
    This model represents a budget category, which can be used to track various financial aspects.
    It includes fields for the category name, amount, adjusted amount, category group, and an optional recurrence rule.

    Fields:
    - name (str): The name of the category (primary key).
    - amount (Decimal): The initial amount allocated to the category.
    - adjusted_amount (Decimal): The adjusted amount, which is calculated based on the category group.
    - group (str): The category group, such as "Fixed," "Variable," "Discretionary," "Income," or "Savings."
    - rule (Rule): An optional recurrence rule associated with the category.

    The adjusted_amount is automatically calculated based on the category group:
    - For "Income" categories, adjusted_amount equals the amount.
    - For other categories, adjusted_amount equals the negative of the amount, representing expenses.

    Example usage:

    # Creating a new budget category
    groceries = Category.objects.create(
        name="Groceries",
        amount=500.00,
        group="Variable"
    )

    # Associating a recurrence rule with the category
    groceries.rule = my_rule  # Assuming my_rule is a Rule instance
    groceries.save()

    """
    name = models.CharField(unique=True, max_length=100)
    amount = models.DecimalField(max_digits=9, decimal_places=2)
    adjusted_amount = models.DecimalField(
        max_digits=9, decimal_places=2, editable=False)
    group = models.CharField(max_length=50, choices=[
        ("Fixed", "Fixed"),
        ("Variable", "Variable"),
        ("Discretionary", "Discretionary"),
        ("Income", "Income"),
        ("Savings", "Savings"),
    ])
    # TODO may need to put foreign key on rule
    rule = models.OneToOneField(
        Rule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text=("Leave blank for a one time only event."))

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        self.adjusted_amount = self.amount if self.group == "Income" else self.amount * -1
        return super().save(*args, **kwargs)

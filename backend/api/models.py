from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from dateutil.rrule import rrule, WEEKLY, DAILY, MONTHLY, YEARLY, SU, MO, TU, WE, TH, FR, SA


class Rule(models.Model):
    """
    This model defines a rule for recurring events. It allows you to specify the recurrence frequency, interval,
    and optional start and end dates. You can also set frequency-specific details like the day of the week,
    day of the month, or month of the year.

    Fields:
    - frequency (str): The frequency of recurrence, such as "Daily," "Weekly," "Monthly," or "Yearly."
    - interval (int): The number of units between each recurrence (e.g., days, weeks, months).
    - start_date (date): An optional start date for the recurrence rule.
    - end_date (date): An optional end date for the recurrence rule.
    - weekday (int): For weekly recurrence, specifies the day of the week (0 for Monday, 1 for Tuesday, etc.).
    - day_of_month (int): For monthly recurrence, specifies the day of the month (1 to 31).
    - month_of_year (int): For yearly recurrence, specifies the month of the year (1 for January, 2 for February, etc.).

    Example usage:

    # Creating a rule for a weekly recurrence, every two weeks, starting on January 1, 2023, and ending on March 31, 2023,
    # occurring on Mondays (0).
    weekly_rule = Rule.objects.create(
        frequency=WEEKLY,
        interval=2,
        start_date=date(2023, 1, 1),
        end_date=date(2023, 3, 31),
        weekday=0
    )

    # Generating a list of dates based on the rule within a specific date range
    start_date = date(2023, 1, 1)
    end_date = date(2023, 3, 31)
    rrule_object = weekly_rule.get_rrule()
    dates = [dt.date() for dt in rrule_object.between(start_date, end_date)]

    """

    class Frequency(models.IntegerChoices):
        YEARLY = YEARLY, "Yearly"
        MONTHLY = MONTHLY, "Monthly"
        WEEKLY = WEEKLY, "Weekly"
        DAILY = DAILY, "Daily"

    class Weekday(models.IntegerChoices):
        MO = MO.weekday, "Monday"
        TU = TU.weekday, "Tuesday"
        WE = WE.weekday, "Wednesday"
        TH = TH.weekday, "Thursday"
        FR = FR.weekday, "Friday"
        SA = SA.weekday, "Saturday"
        SU = SU.weekday, "Sunday"

    frequency = models.IntegerField(choices=Frequency.choices)
    interval = models.PositiveIntegerField(default=1)

    # Optional start and end dates
    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    # Additional fields for frequency-specific details
    weekday = models.IntegerField(
        null=True, blank=True, choices=Weekday.choices)
    day_of_month = models.IntegerField(
        null=True, blank=True, validators=[
            MinValueValidator(1), MaxValueValidator(31)])
    month_of_year = models.IntegerField(
        null=True, blank=True, validators=[
            MinValueValidator(1), MaxValueValidator(12)])

    def __str__(self):
        return f"{self.get_frequency_display()} - every {self.interval}"

    def get_rrule(self):
        """
        Generates and returns an rrule based on the rule's settings.
        """
        params = {
            "interval": self.interval,
            "dtstart": self.start_date,
            "until": self.end_date,
        }

        if self.frequency == DAILY:
            return rrule(DAILY, **params)

        if self.frequency == WEEKLY:
            params["byweekday"] = self.weekday
            return rrule(WEEKLY, **params)

        if self.frequency == MONTHLY:
            params["bymonthday"] = self.day_of_month
            return rrule(MONTHLY, **params)

        if self.frequency == YEARLY:
            params["bymonth"] = self.month_of_year
            params["bymonthday"] = self.day_of_month
            return rrule(YEARLY, **params)

        return None

    def clean(self):
        """
        Validate fields based on the selected frequency.
        """
        super().clean()

        if self.frequency == Rule.Frequency.DAILY:
            if self.weekday is not None or self.day_of_month is not None or self.month_of_year is not None:
                raise ValidationError(
                    "Daily frequency should not have weekday, day_of_month, or month_of_year.")

        if self.frequency == Rule.Frequency.WEEKLY:
            if self.day_of_month is not None or self.month_of_year is not None:
                raise ValidationError(
                    "Weekly frequency should not have day_of_month or month_of_year.")

            if self.weekday is None:
                raise ValidationError(
                    "Weekly frequency should have weekday.")

        if self.frequency == Rule.Frequency.MONTHLY:
            if self.weekday is not None or self.month_of_year is not None:
                raise ValidationError(
                    "Monthly frequency should not have weekday or month_of_year.")

            if self.day_of_month is None:
                raise ValidationError(
                    "Monthly frequency should have day_of_month.")

        if self.frequency == Rule.Frequency.YEARLY:
            if self.weekday is not None:
                raise ValidationError(
                    "Yearly frequency should not have weekday.")

            if self.month_of_year is None or self.day_of_month is None:
                raise ValidationError(
                    "Yearly frequency should have month_of_year and day_of_month.")

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
    name = models.CharField(primary_key=True, max_length=100)
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
    rule = models.ForeignKey(
        Rule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text=("Leave blank for a one time only event."))

    def __str__(self) -> str:
        return self.name

    def save(self, *args, **kwargs) -> None:
        self.name = self.name.title()
        self.adjusted_amount = self.amount if self.group == "Income" else self.amount * -1
        return super().save(*args, **kwargs)

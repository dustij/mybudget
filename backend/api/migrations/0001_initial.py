# Generated by Django 4.2.5 on 2023-10-07 13:02

import django.core.validators
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Rule',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('frequency', models.CharField(choices=[('Yearly', 'Yearly'), ('Monthly', 'Monthly'), ('Biweekly', 'Biweekly'), ('Weekly', 'Weekly'), ('Daily', 'Daily')], max_length=100)),
                ('start_date', models.DateField()),
                ('end_date', models.DateField(blank=True, null=True)),
                ('weekday', models.CharField(blank=True, choices=[('Monday', 'Monday'), ('Tuesday', 'Tuesday'), ('Wednesday', 'Wednesday'), ('Thursday', 'Thursday'), ('Friday', 'Friday'), ('Saturday', 'Saturday'), ('Sunday', 'Sunday')], max_length=100, null=True)),
                ('day_of_month', models.PositiveIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(31)])),
                ('month_of_year', models.PositiveIntegerField(blank=True, null=True, validators=[django.core.validators.MinValueValidator(1), django.core.validators.MaxValueValidator(12)])),
            ],
        ),
        migrations.CreateModel(
            name='Category',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True)),
                ('amount', models.DecimalField(decimal_places=2, max_digits=9)),
                ('adjusted_amount', models.DecimalField(decimal_places=2, editable=False, max_digits=9)),
                ('group', models.CharField(choices=[('Fixed', 'Fixed'), ('Variable', 'Variable'), ('Discretionary', 'Discretionary'), ('Income', 'Income'), ('Savings', 'Savings')], max_length=50)),
                ('rule', models.OneToOneField(blank=True, help_text='Leave blank for a one time only event.', null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.rule')),
            ],
        ),
    ]

# Generated by Django 4.2.6 on 2023-10-13 14:10

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_budgetedit'),
    ]

    operations = [
        migrations.AddField(
            model_name='budgetedit',
            name='adjusted_amount',
            field=models.DecimalField(decimal_places=2, default=0, editable=False, max_digits=9),
            preserve_default=False,
        ),
    ]

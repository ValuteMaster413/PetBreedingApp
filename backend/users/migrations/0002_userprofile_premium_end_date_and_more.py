# Generated by Django 5.1.7 on 2025-03-11 16:23

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='userprofile',
            name='premium_end_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='userprofile',
            name='premium_start_date',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]

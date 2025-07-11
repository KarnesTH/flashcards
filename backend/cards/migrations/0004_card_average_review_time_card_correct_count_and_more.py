# Generated by Django 5.2.3 on 2025-06-23 11:47

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cards', '0003_user_avatar'),
    ]

    operations = [
        migrations.AddField(
            model_name='card',
            name='average_review_time',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='card',
            name='correct_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='card',
            name='ease_factor',
            field=models.FloatField(default=2.5),
        ),
        migrations.AddField(
            model_name='card',
            name='incorrect_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='card',
            name='interval',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='card',
            name='last_reviewed',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='card',
            name='next_review',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='card',
            name='repetition_count',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='card',
            name='total_review_time',
            field=models.IntegerField(default=0),
        ),
    ]

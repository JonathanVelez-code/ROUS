# Generated by Django 4.2.2 on 2024-09-30 15:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('ROUSApp', '0003_remove_partmaintenance_scheduled_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Deployed',
            fields=[
                ('start', models.DateField()),
                ('end', models.DateField()),
                ('DeployedID', models.AutoField(primary_key=True, serialize=False)),
                ('JulianDate', models.IntegerField(default=0)),
                ('TailNumber', models.CharField(max_length=10)),
                ('title', models.TextField(blank=True)),
                ('GeoLoc', models.CharField(max_length=10)),
            ],
        ),
    ]

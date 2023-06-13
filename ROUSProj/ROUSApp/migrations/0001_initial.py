# Generated by Django 4.2.2 on 2023-06-13 14:42

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Calendar',
            fields=[
                ('StartDate', models.DateField()),
                ('EndDate', models.DateField()),
                ('Aircraft', models.CharField(max_length=20, primary_key=True, serialize=False)),
                ('Reason', models.TextField(blank=True)),
                ('EHours', models.FloatField(blank=True, default=0.0, null=True)),
                ('FHours', models.FloatField(blank=True, default=0.0, null=True)),
                ('GeoLoc', models.CharField(max_length=10)),
            ],
        ),
        migrations.CreateModel(
            name='PlaneMaintenance',
            fields=[
                ('PlaneSN', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('MDS', models.CharField(max_length=10)),
                ('Narrative', models.TextField(default='')),
                ('CrntTime', models.FloatField(blank=True, default=0.0, null=True)),
                ('TimeRemain', models.FloatField(blank=True, default=0.0, null=True)),
                ('DueTime', models.FloatField(blank=True, default=0.0, null=True)),
                ('DueDate', models.DateField(null=True)),
                ('Freq', models.SmallIntegerField(default=0)),
                ('Type', models.CharField(max_length=1)),
                ('JST', models.IntegerField(default=0)),
                ('TFrame', models.SmallIntegerField(default=0)),
                ('E_F', models.CharField(max_length=1)),
            ],
            options={
                'unique_together': {('PlaneSN', 'MDS')},
            },
        ),
        migrations.CreateModel(
            name='PlaneData',
            fields=[
                ('PlaneSN', models.CharField(max_length=10, primary_key=True, serialize=False)),
                ('GeoLoc', models.CharField(max_length=10)),
                ('MDS', models.CharField(max_length=10)),
                ('WUC_LCN', models.CharField(max_length=14)),
                ('EQP_ID', models.CharField(max_length=5)),
                ('TailNumber', models.CharField(max_length=10)),
            ],
            options={
                'unique_together': {('PlaneSN', 'MDS')},
            },
        ),
        migrations.CreateModel(
            name='PartMaintenance',
            fields=[
                ('PlaneSN', models.CharField(max_length=10)),
                ('MDS', models.CharField(max_length=10)),
                ('EQP_ID', models.CharField(max_length=5, primary_key=True, serialize=False)),
                ('PartSN', models.CharField(max_length=10)),
                ('PartNum', models.CharField(max_length=10)),
                ('Narrative', models.TextField(blank=True, default='')),
                ('WUC_LCN', models.CharField(max_length=14)),
                ('CatNum', models.SmallIntegerField(default=0)),
                ('CrntTime', models.FloatField(default=0)),
                ('TimeRemain', models.FloatField(default=0)),
                ('DueTime', models.FloatField(default=0)),
                ('DueDate', models.DateField()),
                ('Freq', models.SmallIntegerField(default=0)),
                ('Type', models.CharField(max_length=1)),
                ('JST', models.IntegerField(default=0)),
                ('TFrame', models.SmallIntegerField(default=0)),
                ('E_F', models.CharField(max_length=1)),
            ],
            options={
                'unique_together': {('PlaneSN', 'MDS', 'EQP_ID', 'PartSN', 'PartNum')},
            },
        ),
    ]

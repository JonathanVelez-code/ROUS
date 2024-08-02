# we have a Location, PlaneMaintenance, PartMaintenance, PlaneData and Calendar model
from django.db import models

class Location(models.Model):
    GeoLoc = models.CharField(primary_key=True, max_length=10)

class Resource(models.Model):
    ResourceID = models.AutoField(primary_key=True)
    TailNumber = models.CharField(max_length=10)
    GeoLoc = models.CharField(max_length=10)

class PlaneMaintenance(models.Model):
    # class Meta:
    #     unique_together = (('PlaneSN', 'MDS', 'JST'),)
    PlaneMaintenanceID = models.AutoField(primary_key=True)
    PlaneSN = models.CharField(max_length=10)
    MDS = models.CharField(max_length=10)
    Narrative = models.TextField(default="", blank=False)
    CrntTime = models.FloatField(null=True, blank=True, default=0.0)
    TimeRemain = models.FloatField(null=True, blank=True, default=0.0)
    DueTime = models.FloatField(null=True, blank=True, default=0.0)
    #DueDate = models.DateField(null=True)
    Freq = models.SmallIntegerField(default=0)
    Type = models.CharField(max_length=1)
    JST = models.IntegerField(default=0)
    TFrame = models.SmallIntegerField(default=0)
    E_F = models.CharField(max_length=10)
    title = models.TextField(blank=True)
    # Scheduled = models.BooleanField(default=True)

    class Meta:
        unique_together = (('PlaneSN', 'MDS', 'title'),)
    # objects = models.Manager()

class PartMaintenance(models.Model):
    # class Meta:
    #     unique_together = (('PlaneSN', 'MDS', 'EQP_ID', 'PartSN', 'PartNum'),)
    PartMaintenanceID = models.AutoField(primary_key=True)
    PlaneSN = models.CharField(max_length=10)
    MDS = models.CharField(max_length=10)
    EQP_ID = models.CharField(max_length=10)
    PartSN = models.CharField(max_length=10)
    PartNum = models.CharField(max_length=10)
    Narrative = models.TextField(default="", blank=True)
    WUC_LCN = models.CharField(max_length=14)
    CatNum = models.SmallIntegerField(default=0)
    CrntTime = models.FloatField(default=0.0)
    TimeRemain = models.FloatField(default=0.0)
    DueTime = models.FloatField(default=0.0)
    # DueDate = models.DateField()
    Freq = models.SmallIntegerField(default=0)
    Type = models.CharField(max_length=1)
    JST = models.IntegerField(default=0)
    TFrame = models.SmallIntegerField(default=0)
    E_F = models.CharField(max_length=10)
    title = models.TextField(blank=True)
    # Scheduled = models.BooleanField(default=True)
    class Meta:
        unique_together = (('PlaneSN', 'MDS', 'title'),)

# multiple maintenances in plane_maintenance and part_maintenance
class PlaneData(models.Model):
    class Meta:
        unique_together = (('PlaneSN', 'MDS'),)

    PlaneSN = models.CharField(max_length=10, primary_key=True)
    GeoLoc = models.CharField(max_length=10)
    MDS = models.CharField(max_length=10)
    #WUC_LCN = models.CharField(max_length=14)
    #EQP_ID = models.CharField(max_length=5)
    TailNumber = models.CharField(max_length=10)


# a single maintenance that matches the title
class Calendar(models.Model):
    start = models.DateField()
    end = models.DateField()
    CalendarID = models.AutoField(primary_key=True)
    JulianDate = models.IntegerField(default=0)
    # Aircraft = models.CharField(max_length=20)
    MDS = models.CharField(max_length=10)
    TailNumber = models.CharField(max_length=10)
    title = models.TextField(blank=True)
    EHours = models.FloatField(null=True, blank=True, default=0.0)
    FHours = models.FloatField(null=True, blank=True, default=0.0)
    GeoLoc = models.CharField(max_length=10)
    PlaneMaintenanceID = models.IntegerField(default=0)
    PartMaintenanceID = models.IntegerField(default=0)
    ResourceID = models.IntegerField(default=0)
    Completed = models.BooleanField(default=False)

from rest_framework import serializers
from .models import *

class ResourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Resource
        fields = '__all__'

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = '__all__'

class PlaneMaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PlaneMaintenance
        fields = '__all__'

class PartMaintenanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = PartMaintenance
        fields = '__all__'

class PlaneDataSerializer(serializers.ModelSerializer):
    maintenances = serializers.SerializerMethodField()
    def get_maintenances(self, obj):
        plane_maintenances = PlaneMaintenance.objects.filter(PlaneSN=obj.PlaneSN, MDS=obj.MDS)
        part_maintenances = PartMaintenance.objects.filter(PlaneSN=obj.PlaneSN, MDS=obj.MDS)

        maintenances_combined = list(plane_maintenances) + list(part_maintenances)
        maintenances_combined.sort(key=lambda x: x.TimeRemain)

        maintenances_data = []
        for maintenance in maintenances_combined:
            if isinstance(maintenance, PlaneMaintenance):
                maintenances_data.append(PlaneMaintenanceSerializer(maintenance).data)
            elif isinstance(maintenance, PartMaintenance):
                maintenances_data.append(PartMaintenanceSerializer(maintenance).data)
        return maintenances_data

    def __init__(self, *args, **kwargs):
        exclude_maintenances = kwargs.pop('exclude_maintenances', False)
        super().__init__(*args, **kwargs)
        if exclude_maintenances:
            self.fields.pop('maintenances')

    class Meta:
        model = PlaneData
        fields = '__all__'



class CalendarSerializer(serializers.ModelSerializer):
    maintenance = serializers.SerializerMethodField()
    plane_data = serializers.SerializerMethodField()
    def get_maintenance(self, obj):
        PlaneMaintenanceID = obj.PlaneMaintenanceID
        PartMaintenanceID = obj.PartMaintenanceID
        plane_maintenance_instance = PlaneMaintenance.objects.filter(PlaneMaintenanceID=PlaneMaintenanceID).first()
        part_maintenance_instance = PartMaintenance.objects.filter(PartMaintenanceID=PartMaintenanceID).first()
        if plane_maintenance_instance is not None:
            return PlaneMaintenanceSerializer(plane_maintenance_instance).data
        else:
            if part_maintenance_instance is not None:
                return PartMaintenanceSerializer(part_maintenance_instance).data
            else:
                return {}

    def get_plane_data(self, obj):
        # aircraft = obj.Aircraft
        # mds = aircraft[:4]
        # tail_number = aircraft[4:]
        mds = obj.MDS
        tail_number = obj.TailNumber
        geoloc= obj.GeoLoc
        plane_data_instance = PlaneData.objects.filter(MDS=mds, TailNumber=tail_number, GeoLoc=geoloc).first()
        if plane_data_instance is not None:
            return PlaneDataSerializer(plane_data_instance, exclude_maintenances=True).data
        else:
            return {}
    class Meta:
        model = Calendar
        fields = '__all__'
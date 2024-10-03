import os
from django.conf import settings
from django.shortcuts import render, redirect
from rest_framework.response import Response
from .serializers import *
from .models import *
from rest_framework import status, generics
from rest_framework.views import APIView
from .models import Location

# views.py

def home(request):
    # Fetch locations from the database
    locations = Location.objects.all()  # Adjust based on your model structure
    context = {
        'locations': locations,
    }
    return render(request, 'home.html', context)

def fileupload(request):
    geoloc = request.GET.get('geoloc')
    return render(request, 'fileupload.html', {'geoloc': geoloc})

def calendar(request):
    license_key = os.getenv('LICENSE_KEY')
    geoloc = request.GET.get('geoloc')  # Get the 'geoloc' query parameter
    resources = Resource.objects.filter(GeoLoc=geoloc)
    return render(request, 'calendar.html', {'license_key': license_key, 'geoloc': geoloc, 'resources': resources})

def location(request):
    return render(request, 'location.html')

def ScheduleHelper(request):
    geoloc = request.GET.get('geoloc')
    
    # Filter resources by GeoLoc
    filtered_resources = Resource.objects.filter(GeoLoc=geoloc) if geoloc else Resource.objects.none()
    filtered_inventorys = Inventory.objects.filter(GeoLoc=geoloc) if geoloc else Inventory.objects.none()
    # Create a list to store resources with corresponding plane data
    resource_plane_data_list = []
    
    for resource in filtered_resources:
        try:
            # Fetch the PlaneData using TailNumber from the resource
            plane_data = PlaneData.objects.get(TailNumber=resource.TailNumber)
            plane_data_serialized = PlaneDataSerializer(plane_data).data
        except PlaneData.DoesNotExist:
            plane_data_serialized = {"msg": "Plane data not found"}
        
        # Append both the resource and its plane data to the list
        resource_plane_data_list.append({
            'resource': resource,
            'plane_data': plane_data_serialized
        })
    
    # Create a list to store inventory data
    inventory_data_list = []
    
    for inventory in filtered_inventorys:
        inventory_data_list.append({
            'inventory': inventory
        })
    
    # Pass the combined list to the template
    return render(request, 'ScheduleHelper.html', {'geoloc': geoloc, 'resource_plane_data_list': resource_plane_data_list, 'inventory_data_list': inventory_data_list})

def inventory(request):
    geoloc = request.GET.get('geoloc')
    
    filtered_inventorys = Inventory.objects.filter(GeoLoc=geoloc) if geoloc else Inventory.objects.none()
    
    # Create a list to store inventory data
    inventory_data_list = []
    
    for inventory in filtered_inventorys:
        inventory_data_list.append({
            'inventory': inventory
        })
    
    # Pass the combined list to the template
    return render(request, 'inventory.html', {'geoloc': geoloc, 'inventory_data_list': inventory_data_list})

class PlaneListView(APIView):
    def get(self, request):
        obj = PlaneData.objects.all()
        serializer = PlaneDataSerializer(obj, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PlaneDataSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IndividualPlaneData(APIView):
    def get(self, request, pk1, pk2):
        try:
            obj = PlaneData.objects.get(PlaneSN=pk1, MDS=pk2)
        except PlaneData.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = PlaneDataSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk1, pk2):
        try:
            obj = PlaneData.objects.get(PlaneSN=pk1, MDS=pk2)
        except PlaneData.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)

        serializer = PlaneDataSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_205_RESET_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk1, pk2):
        try:
            obj = PlaneData.objects.get(PlaneSN=pk1, MDS=pk2)
        except PlaneData.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({"msg": "it's deleted"}, status=status.HTTP_204_NO_CONTENT)

class IndividualPlaneDataByTailNumber(APIView):
    def get(self, request, pk1):
        try:
            obj = PlaneData.objects.get(TailNumber=pk1)
        except PlaneData.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = PlaneDataSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CalendarListView(APIView):
    def get(self, request):
        obj = Calendar.objects.all()
        serializer = CalendarSerializer(obj, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CalendarSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class DeployedListView(APIView):
    def get(self, request):
        # Fetch all Deployed objects
        obj = Deployed.objects.all()
        # Serialize the data
        serializer = DeployedSerializer(obj, many=True)
        # Return serialized data with 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Deserialize the request data
        serializer = DeployedSerializer(data=request.data)
        # Check if data is valid
        if serializer.is_valid():
            # Save the data if valid
            serializer.save()
            # Return serialized data with 201 Created status
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # Return errors with 400 Bad Request status if validation fails
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class InventoryListView(APIView):
    def get(self, request):
        # Fetch all Inventory objects
        obj = Inventory.objects.all()
        # Serialize the data
        serializer = InventorySerializer(obj, many=True)
        # Return serialized data with 200 OK status
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        # Deserialize the request data
        serializer = InventorySerializer(data=request.data)
        # Check if data is valid
        if serializer.is_valid():
            # Save the data if valid
            serializer.save()
            # Return serialized data with 201 Created status
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        # Return errors with 400 Bad Request status if validation fails
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IndividualAircraftCalendar(APIView):
    def get(self, request, pk1, pk2):
        try:
            obj = Calendar.objects.get(MDS=pk1, TailNumber=pk2)
        except Calendar.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = CalendarSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def delete(self, request, pk1, pk2):
        try:
            obj = Calendar.objects.get(MDS=pk1, TailNumber=pk2)
        except Calendar.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({"msg": "it's deleted"}, status=status.HTTP_204_NO_CONTENT)

class IndividualDateCalendarEdit(APIView):
    def get(self, request, pk1):
        try:
            obj = Calendar.objects.get(CalendarID=pk1)
        except Calendar.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = CalendarSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def patch(self, request, pk1):
        try:
            obj = Calendar.objects.get(CalendarID=pk1)
        except PlaneMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)

        serializer = CalendarSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_205_RESET_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class IndividualDeployEdit(APIView):
    def get(self, request, pk1):
        try:
            obj = Deployed.objects.get(DeployedID=pk1)
        except Deployed.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = DeployedSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def patch(self, request, pk1):
        try:
            obj = Deployed.objects.get(DeployedID=pk1)
        except Deployed.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)

        serializer = DeployedSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_205_RESET_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IndividualInventoryEdit(APIView):
    def get(self, request, pk1):
        try:
            obj = Inventory.objects.get(inventoryId=pk1)
        except Inventory.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = InventorySerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk1):
        try:
            obj = Inventory.objects.get(inventoryId=pk1)
        except Inventory.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)

        serializer = InventorySerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_205_RESET_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PlaneMaintenanceListView(APIView):
    def get(self, request):
        obj = PlaneMaintenance.objects.all()
        serializer = PlaneMaintenanceSerializer(obj, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = PlaneMaintenanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IndividualPlaneMaintenanceView(APIView):
    def get(self, request, pk1, pk2, pk3):
        try:
            obj = PlaneMaintenance.objects.get(PlaneSN=pk1, MDS=pk2, JST=pk3)
        except PlaneMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = PlaneMaintenanceSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk1, pk2, pk3):
        try:
            obj = PlaneMaintenance.objects.get(PlaneSN=pk1, MDS=pk2, JST=pk3)
        except PlaneMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)

        serializer = PlaneMaintenanceSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_205_RESET_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CalendarPlaneMaintenanceView(APIView):
    def get(self, request, pk1):
        try:
            obj = PlaneMaintenance.objects.get(PlaneMaintenanceID=pk1)
        except PlaneMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = PlaneMaintenanceSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk1):
        try:
            obj = PlaneMaintenance.objects.get(PlaneMaintenanceID=pk1)
        except PlaneMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)

        serializer = PlaneMaintenanceSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_205_RESET_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk1):
        try:
            obj = PlaneMaintenance.objects.get(PlaneMaintenanceID=pk1)
        except PlaneMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({"msg": "it's deleted"}, status=status.HTTP_204_NO_CONTENT)

# class PlaneMaintenanceAircraftView(APIView):
#     def delete(self, request, pk1, pk2):
#         try:
#             obj = PlaneMaintenance.objects.get(PlaneSN=pk1, MDS=pk2)
#         except PlaneMaintenance.DoesNotExist:
#             msg = {"msg": "not found"}
#             return Response(msg, status=status.HTTP_404_NOT_FOUND)
#         obj.delete()
#         return Response({"msg": "it's deleted"}, status=status.HTTP_204_NO_CONTENT)
#
#     def get(self, request, pk1, pk2):
#         objs = PlaneMaintenance.objects.filter(PlaneSN=pk1, MDS=pk2)
#         if not objs:
#             msg = {"msg": "not found"}
#             return Response(msg, status=status.HTTP_404_NOT_FOUND)
#         objs = objs.order_by('TimeRemain')
#         serializer = PlaneMaintenanceSerializer(objs, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

class PartMaintenanceListView(APIView):
    def get(self, request):
        obj = PartMaintenance.objects.all()
        serializer = PartMaintenanceSerializer(obj, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def post(self, request):
        serializer = PartMaintenanceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class IndividualPartMaintenanceView(APIView):
    def get(self, request, pk1, pk2, pk3, pk4, pk5):
        try:
            obj = PartMaintenance.objects.get(PlaneSN=pk1, MDS=pk2, EQP_ID=pk3, PartSN=pk4, PartNum=pk5)
        except PartMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = PartMaintenanceSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk1, pk2, pk3, pk4, pk5):
        try:
            obj = PartMaintenance.objects.get(PlaneSN=pk1, MDS=pk2, EQP_ID=pk3, PartSN=pk4, PartNum=pk5)
        except PartMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)

        serializer = PartMaintenanceSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_205_RESET_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk1, pk2, pk3, pk4, pk5):
        try:
            obj = PartMaintenance.objects.get(PlaneSN=pk1, MDS=pk2, EQP_ID=pk3, PartSN=pk4, PartNum=pk5)
        except PartMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({"msg": "it's deleted"}, status=status.HTTP_204_NO_CONTENT)

class AircraftPartMaintenanceListView(generics.ListAPIView):
    serializer_class = PartMaintenanceSerializer

    def get_queryset(self):
        planesn = self.kwargs['PlaneSN']
        mds = self.kwargs['MDS']
        return PartMaintenance.objects.filter(PlaneSN=planesn, MDS=mds).order_by('TimeRemain')

class AircraftPlaneMaintenanceListView(generics.ListAPIView):
    serializer_class = PlaneMaintenanceSerializer

    def get_queryset(self):
        planesn = self.kwargs['PlaneSN']
        mds = self.kwargs['MDS']
        return PlaneMaintenance.objects.filter(PlaneSN=planesn, MDS=mds).order_by('TimeRemain')

class CalendarPartMaintenanceView(APIView):
    def get(self, request, pk1):
        try:
            obj = PartMaintenance.objects.get(PartMaintenanceID=pk1)
        except PartMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = PartMaintenanceSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request, pk1):
        try:
            obj = PartMaintenance.objects.get(PartMaintenanceID=pk1)
        except PartMaintenance.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        print(request.data)

        serializer = PartMaintenanceSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_205_RESET_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# class PartMaintenanceAircraftView(APIView):
#     def delete(self, request, pk1, pk2):
#         try:
#             obj = PartMaintenance.objects.get(PlaneSN=pk1, MDS=pk2)
#         except PartMaintenance.DoesNotExist:
#             msg = {"msg": "not found"}
#             return Response(msg, status=status.HTTP_404_NOT_FOUND)
#         obj.delete()
#         return Response({"msg": "it's deleted"}, status=status.HTTP_204_NO_CONTENT)
#
#     def get(self, request, pk1, pk2):
#         objs = PartMaintenance.objects.filter(PlaneSN=pk1, MDS=pk2)
#         if not objs:
#             msg = {"msg": "not found"}
#             return Response(msg, status=status.HTTP_404_NOT_FOUND)
#         objs = objs.order_by('TimeRemain')
#         serializer = PartMaintenanceSerializer(objs, many=True)
#         return Response(serializer.data, status=status.HTTP_200_OK)

class LocationList(APIView):
    def get(self, request):
        obj = Location.objects.all()
        serializer = LocationSerializer(obj, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def post(self, request):
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            if request.headers.get('X-No-Redirect'):
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return redirect(home)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LocationDetail(APIView):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    lookup_field = 'GeoLoc'
    def delete(self, request, pk):
        try:
            obj = Location.objects.get(GeoLoc=pk)
        except Location.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        obj.delete()
        return Response({"msg": "it's deleted"}, status=status.HTTP_204_NO_CONTENT)

class CalendarListByGeoLoc(generics.ListAPIView):
    serializer_class = CalendarSerializer

    def get_queryset(self):
        geoloc = self.kwargs['GeoLoc']
        return Calendar.objects.filter(GeoLoc=geoloc)
    
class DeployedListByGeoLoc(generics.ListAPIView):
    serializer_class = DeployedSerializer

    def get_queryset(self):
        # Get the GeoLoc parameter from the URL
        geoloc = self.kwargs['GeoLoc']
        # Return the filtered queryset
        return Deployed.objects.filter(GeoLoc=geoloc)
    
class InventoryListByGeoLoc(generics.ListAPIView):
    serializer_class = InventorySerializer

    def get_queryset(self):
        # Get the GeoLoc parameter from the URL
        geoloc = self.kwargs['GeoLoc']
        # Return the filtered queryset
        return Inventory.objects.filter(GeoLoc=geoloc)

class IndividualResourceView(APIView):
    def get(self, request, pk1):
        try:
            obj = Resource.objects.get(TailNumber=pk1)
        except Resource.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = ResourceSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def patch(self, request, pk1):
        try:
            obj = Resource.objects.get(TailNumber=pk1)
        except Resource.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)

        serializer = ResourceSerializer(obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_205_RESET_CONTENT)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
class PostResourceView(APIView):
    def get(self, request):
        obj = Resource.objects.all()
        serializer = ResourceSerializer(obj, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def post(self, request):
        serializer = ResourceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        print(serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class IndividualLocationResourceView(generics.ListAPIView):
    serializer_class = ResourceSerializer
    def get_queryset(self):
        geoloc = self.kwargs['GeoLoc']
        return Resource.objects.filter(GeoLoc=geoloc)

class IndividualResourceViewByGeoLoc(APIView):
    def get(self, request, pk1, pk2):
        try:
            obj = Resource.objects.get(TailNumber=pk1, GeoLoc=pk2)
        except Resource.DoesNotExist:
            msg = {"msg": "not found"}
            return Response(msg, status=status.HTTP_404_NOT_FOUND)
        serializer = ResourceSerializer(obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
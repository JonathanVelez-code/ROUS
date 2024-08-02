from django.urls import path
from ROUSApp import views
from . import views

from django.urls import path, register_converter
from datetime import date
from django.conf import settings
from django.conf.urls.static import static

class DateConverter:
    regex = r'\d{4}-\d{2}-\d{2}'
    def to_python(self, value):
        return date.fromisoformat(value)

    def to_url(self, value):
        return value.isoformat()

register_converter(DateConverter, 'date')

urlpatterns = [
    path('', views.home, name='home'),
    path('location.html', views.location, name='location'),
    path('calendar.html', views.calendar, name='calendar'),
    path('fileupload.html', views.fileupload, name='fileupload'),
    path('ScheduleHelper.html', views.ScheduleHelper, name='ScheduleHelper'),

    # get and post plane data list
    path("plane-data/", views.PlaneListView.as_view(), name='planes'),
    # get and post to calendar list
    path("calendar/", views.CalendarListView.as_view(), name='calendars'),
    # get and post to plane maintenance list
    path("plane-maintenance/", views.PlaneMaintenanceListView.as_view(), name='plane maintenance'),
    # get and post to part maintenance list
    path("part-maintenance/", views.PartMaintenanceListView.as_view(), name='part maintenance'),
    # get and post to location list
    path('loc/', views.LocationList.as_view(), name='location-list'),
    # get and post to resource list
    path('resource/', views.PostResourceView.as_view(), name='resource-list'),


    # allows get, patch and delete based on PlaneSN and MDS in plane data
    path("plane-data/<str:pk1>/<str:pk2>/", views.IndividualPlaneData.as_view(), name='plane details'),

    # allows get, patch and delete based on PlaneSN and MDS in plane data
    path("plane-data/<str:pk1>/", views.IndividualPlaneDataByTailNumber.as_view(), name='plane tailnumber details'),

    # allows get and patch based on CalendarID in Calendar
    path("calendar/<str:pk1>/", views.IndividualDateCalendarEdit.as_view(), name='calendar date details'),

    # allows get and delete based on MDS and TailNumber str, in Calendar
    path("calendar/aircraft/<str:pk1>/<str:pk2>/", views.IndividualAircraftCalendar.as_view(), name='calendar-edit-details'),

    # allows get, patch and delete based on PlaneSN, MDS and JST, in plane maintenance
    path("plane-maintenance/<str:pk1>/<str:pk2>/<int:pk3>/", views.IndividualPlaneMaintenanceView.as_view(), name='plane main details'),

    # allows delete and get based on PlaneSN and MDS, in plane maintenance
    # path("plane-maintenance/<str:pk1>/<str:pk2>/", views.PlaneMaintenanceAircraftView.as_view(), name='plane main aircraft detail'),

    # allows get, patch and delete based on PlaneSN, MDS, EQP_ID, PartSN and PartNum,in part maintenance
    path("part-maintenance/<str:pk1>/<str:pk2>/<str:pk3>/<str:pk4>/<str:pk5>/", views.IndividualPartMaintenanceView.as_view(), name='part main details'),

    # allows get based on PlaneSN and MDS in part maintenance
    path("part-maintenance/<str:PlaneSN>/<str:MDS>/", views.AircraftPartMaintenanceListView.as_view(), name='aircraft part main details'),

    # allows get based on PlaneSN and MDS in plane maintenance
    path("plane-maintenance/<str:PlaneSN>/<str:MDS>/", views.AircraftPlaneMaintenanceListView.as_view(), name='aircraft plane main details'),

    # allows get and delete based on PlaneSN and MDS, in part maintenance
    # path("part-maintenance/<str:pk1>/<str:pk2>/", views.PartMaintenanceAircraftView.as_view(), name='part main aircraft details'),

    # allows get based on PlaneSN and MDS in part and plane maintenance
    # path("maintenance/<str:pk1>/<str:pk2>/", views.MaintenanceAircraftView.as_view(), name='maintenance details'),

    # allows delete based on GeoLoc in Location
    path('loc/<str:pk>/', views.LocationDetail.as_view(), name='location-detail'),

    # allows get based on GeoLoc in Calendar
    path('calendar/geoloc/<str:GeoLoc>/', views.CalendarListByGeoLoc.as_view(), name='calendar-list-by-geoloc'),

    path('resource/geoloc/<str:GeoLoc>/', views.IndividualLocationResourceView.as_view(), name='resource-geo-tail'),

    path('calendar/planemaintenance/<int:pk1>/', views.CalendarPlaneMaintenanceView.as_view(), name='calendar-plane-maintenance'),

    path('calendar/partmaintenance/<int:pk1>/', views.CalendarPartMaintenanceView.as_view(), name='calendar-part-maintenance'),

    path('resource/<str:pk1>/', views.IndividualResourceView.as_view(), name='resource-tail'),

    path('resource/<str:pk1>/<str:pk2>/', views.IndividualResourceViewByGeoLoc.as_view(), name='resource-tail-loc'),

]+ static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
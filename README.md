# ROUS: Aircraft Logistics Management System

A Django web app built for a US Air Force logistics team to plan aircraft maintenance. It tracks each aircraft's
maintenance and parts, schedules work on a calendar, follows deployments by location, and manages parts inventory.

This was a three-person team project, and this repository is my copy of the team's repo. I led the team and built
the import that reads the Air Force's old maintenance logs and loads them into the database.

More screenshots and the project write-up are on my portfolio:
[jonathanwvelez.com/project1.html](https://jonathanwvelez.com/project1.html)

![Maintenance calendar](https://jonathanwvelez.com/assets/img/calendar_page.jpg)

## Features

- **Maintenance calendar:** schedules aircraft and part maintenance for each location, using FullCalendar Scheduler.
- **Log import:** uploads old maintenance logs as Excel spreadsheets and parses them into aircraft, aircraft maintenance and part maintenance records.
- **Schedule helper:** lists each aircraft's upcoming maintenance with its time remaining and due time, and adds it to the calendar.
- **Inventory:** tracks parts inventory for each location.
- **REST API:** Django REST Framework endpoints for every table, used by the front end.

![Importing maintenance logs](https://jonathanwvelez.com/assets/img/import_page.jpg)

## Tech stack

| Layer | Tools |
|---|---|
| Back end | Python 3.10, Django 4.2, Django REST Framework |
| Front end | Django templates, JavaScript, jQuery, Bootstrap 5, FullCalendar Scheduler, SweetAlert2 |
| Database | SQLite for local development (MySQL and PostgreSQL drivers are included) |
| Deployment | Gunicorn and WhiteNoise. It was hosted on Heroku, and that demo is no longer online |

## API

All endpoints accept GET and POST on the list, and GET, PATCH or DELETE on a single record.

| Endpoint | Data |
|---|---|
| `/plane-data/` | Aircraft, by serial number and MDS (aircraft type) |
| `/plane-maintenance/` | Scheduled maintenance for each aircraft |
| `/part-maintenance/` | Scheduled maintenance for each part |
| `/calendar/` | Calendar entries, also filterable by location (`/calendar/geoloc/<GeoLoc>/`) |
| `/loc/` | Locations |
| `/resource/` | Aircraft assigned to each location |
| `/deployed/` | Deployed aircraft |
| `/inventory/` | Parts inventory |

## Run it locally

1. Create and activate a virtual environment:

   ```powershell
   python -m venv env
   env\Scripts\Activate.ps1
   ```

   On macOS or Linux, run `source env/bin/activate` instead.

2. Install the dependencies:

   ```powershell
   pip install -r requirements.txt
   ```

3. Set the environment variables:

   | Variable | Purpose |
   |---|---|
   | `SECRET_KEY` | Django's secret key (any long random string for local use) |
   | `LICENSE_KEY` | FullCalendar Scheduler license key. The calendar shows a license warning without it |

4. Start the server, then open http://127.0.0.1:8000:

   ```powershell
   python manage.py migrate
   python manage.py runserver
   ```

![Maintenance scheduling table](https://jonathanwvelez.com/assets/img/schedule_page.jpg)

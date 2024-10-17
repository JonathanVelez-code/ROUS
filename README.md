# ROUS

## Demo

Online demo: https://rousapp-a8a46816adf1.herokuapp.com/

## Install

1. create virtual environment

```bash
python -m venv env
```

2. activate on environment Windows (PS: check env file because Scrips folder can be named as bin instead of Scrips)

```bash
env\Scripts\Activate.ps1   (PowerShell- used in VS Code)
env\Scripts\activate.bat    (cmd)
```

3. install Django in the virtual environment.

```bash
pip install django
```

4. install all the packages and used to update to new packages installed.

```bash
pip install -r requirements.txt
```
other: after installing new packages please update the requirements.txt shown below.
```bash
pip freeze > requirements.txt
```

## API

First, in the my_django_app, activate the virtual environment with the command:
```bash
 env\Scripts\activate
```
Next, go into the ROUS directory, and then to run the server, do the command:
```bash
python manage.py runserver
```

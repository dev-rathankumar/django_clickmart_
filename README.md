
# 🚀 Django Production Deployment (Step-by-Step)
### Docker + PostgreSQL + GitHub Actions (CI/CD) + Linode + Nginx + Gunicorn + Custom Domain + SSL

This repository demonstrates how to deploy a **Django application** from local development to **production** using:
- Django  
- Docker & Docker Compose  
- PostgreSQL  
- GitHub Actions (CI/CD)  
- Linode VPS  
- Nginx
- Gunicorn
- Custom Domain
- SSL (Let’s Encrypt)


You will go step-by-step from:

**Local → Docker → GitHub → Linode → Domain → HTTPS**

---

## 🧰 Prerequisites

Install the following on your system:

- Git
- Python 3.10+  
- pip  
- Docker Desktop  
- VS Code (recommended)

## 📦 Step 1 — Clone the Project
```sh
git clone https://github.com/dev-rathankumar/django_clickmart_
cd django_clickmart_
```

## Step 2 - Remove Git history
```sh
rm -rf .git
```
This wipes your commit history & remote. Now it is just files in your local computer, not a repo.

## Create your own GitHub repository
Go to GitHub → Click New Repository → Name: django-clickmart

## Re-initialize Git
```sh
git init
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/<REPOSITORY-NAME>.git
git push -u origin main
```
Now you have the full source code in your own repo.

## Run Django Locally (Without Docker)
Create virtual environment
```sh
cd backend-drf
python3 -m venv env
source env/bin/activate     # Mac / Linux
# OR
env\Scripts\activate        # Windows
```

Install dependencies
```sh
pip install -r requirements.txt
```

Create ```.env``` file
```sh
DEBUG=True
SECRET_KEY=<YOUR-SECRET-KEY>

# Database Settings
DB_NAME=<DATABASE-NAME>
DB_USER=<POSTGRES-USERNAME> # Default 'postgres'
DB_PASSWORD=<YOUR-PASSWORD>
DB_HOST=localhost
DB_PORT=5432

# Email Configuration
EMAIL_HOST_USER=<YOUR-EMAIL-ADDRESS>
EMAIL_HOST_PASSWORD=<PASSWORD> # USE APP PASSWORD IF YOU ARE USING GMAIL
```

Create database tables and run the Django server
```sh
python manage.py migrate
python manage.py runserver
```

Create ```.env``` file inside /frontend/ directory and write:
```sh
VITE_SERVER_BASE_URL=http://127.0.0.1:8000/api/v1
```
And run the frontend - React
```sh
npm install
npm run dev
```

Go to http://localhost:5173/

Optional: You can now create superuser and add some products.

To learn about deployment, continue to next step...

## Install and verify Docker and Docker Compose
```sh
docker --version
docker compose version
```

## Create Dockerfile for backend
Create a new file "Dockerfile" inside /backend-drf/ folder
```sh
# Purpose: A Dockerfile is a step-by-step instruction file that tells Docker how to build and run our application.
FROM python:3.10-slim

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

# gunicorn = production server, clickmart_main.wsgi:application = Django entry point, --bind 0.0.0.0:8000 = external traffic. Reminaing: tuning options
# A worker is just one instance of your Django app running inside Gunicorn.
CMD ["gunicorn", "clickmart_main.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3" , "--timeout", "180"]
```

## Create Dockerfile for frontend
Create a new file "Dockerfile" inside /frontend/ folder
```sh
# Stage 1: Build
FROM node:18 AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build arguments for environment variables
ARG VITE_SERVER_BASE_URL

# This line passes an environment variable into the Docker container so the React app knows the backend API URL.
ENV VITE_SERVER_BASE_URL=$VITE_SERVER_BASE_URL

RUN npm run build

# Stage 2: Nginx, alpine means the lighter version of Nginx
FROM nginx:alpine

# Copy build output to Nginx html directory
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## On the root directory, create a file "docker-compose.yml"
```sh
services:
  db:
    image: postgres:16-alpine
    env_file:
      - .env.production
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend-drf
    ports:
      - "8000:8000"
    env_file:
      - ./backend-drf/.env.docker
    depends_on:
      - db
    volumes:
      - ./backend-drf/static:/app/static
      - ./backend-drf/media:/app/media
    command: >
      sh -c "python manage.py collectstatic --noinput &&
             python manage.py migrate &&
             python manage.py runserver 0.0.0.0:8000"

  frontend:
    build:
      context: ./frontend
      args:
        VITE_SERVER_BASE_URL: "http://backend:8000/api/v1"
    ports:
      - "5173:80"
    depends_on:
      - backend


# This creates a named Docker volume to permanently store PostgreSQL data.
# Without this:
  # Database data is stored inside the container
  # If container is deleted → data is lost
# With this:
  # Data is stored in a Docker-managed volume
  # Data persists even if container stops or restarts
volumes:
  postgres_data:
```

Make sure to create a copy of ```.env``` and name it as ```.env.docker```
```sh
SECRET_KEY=<YOUR-DJANGO-SECRETKEY>
DEBUG=True

# Database Settings
DB_NAME=<YOUR_DOCKER-DB>
DB_USER=postgres
DB_PASSWORD=<PASSWORD>
DB_HOST=db
DB_PORT=5432


EMAIL_HOST_USER=<YOUR-EMAIL-ADDRESS>
EMAIL_HOST_PASSWORD=<YOUR-PASSWORD> # app password if you're using Gmail account
```

Run this command to Dockerize your project:
```sh
docker compose up --build
```
Your project is now Dockerized ✅

See the docker container health:
```sh
docker compose ps
```

You can try creating superuser inside Docker container.
```sh
docker compose exec backend python manage.py createsuperuser
```

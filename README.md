
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
DB_USER=<POSTGRES-USERNAME>
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

## Create Linode Server & SSH Key

👉 [Create a Linode account](https://rathank.com/linode/)

##### Create SSH Key
On your local machine:
```bash
ls ~/.ssh
ssh-keygen -t ed25519 -C "clickmart-linode"
```

Copy the public key and add it to Linode UI:
```ssh
cat ~/.ssh/linode.pub
```

## SSH into Linode (Passwordless)
```sh
ssh root@<LINODE_IP>
```

Update the server:
```sh
apt update && apt upgrade -y
```

## Install Required Software
Install Docker:
```sh
curl -fsSL https://get.docker.com | sh
docker --version
```

Install Docker Compose:
```sh
apt install docker-compose-plugin -y
```

Install Git:
```sh
apt install git -y
git --version
```

✅ Docker, Docker Compose, and Git installed successfully.

## Clone Project into /opt
Reconnect to SSH (if disconnected):
```sh
cd /opt
mkdir clickmart
cd clickmart
git clone https://github.com/your-repo.git .
```
Repo is now cloned inside /opt/clickmart

## Update Frontend Environment Variable
In docker-compose.yml:
```sh
VITE_SERVER_BASE_URL="http://<LINODE_IP>:8000/api/v1"
```

Push changes:
```sh
git push origin main
```

## Create Environment Files on Linode
```sh
nano backend-drf/.env.production
nano backend-drf/.env.docker
```
Add required environment variables inside it.

## Open Firewall Ports on Linode
⚠️ If ports are not opened, the app will run but won’t be accessible.

Required Ports (Initial Setup)
```sh
SSH: 22
Django Backend: 8000
React Frontend: 5173
```

```sh
Inbound Rules:

Allow TCP 22
Allow TCP 8000
Allow TCP 5173
```

## Build & Run Docker Containers
```sh
docker compose up --build -d
docker compose ps
```

Test in browser:

Backend: http://<LINODE_IP>:8000/

Frontend: http://<LINODE_IP>:5173/

## Fix Django ALLOWED_HOSTS
In local settings.py:
```sh
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://<LINODE_IP>:5173'
]
```

In local .env.docker:
```sh
ALLOWED_HOSTS=<LINODE_IP>,localhost,127.0.0.1
```

In linode .env.docker:
```sh
ALLOWED_HOSTS=<LINODE_IP>,localhost,127.0.0.1
```

In docker-compose.yml:
```sh
VITE_SERVER_BASE_URL: "http://<LINODE_IP>/api/v1"
```

Push to GitHub:
```sh
git add .
git commit -m "Allowed host & environments added"
git push origin main
```
This will push the changes to GitHub.

### 🎯 Goal - Whenever I push code to GitHub, my Linode server should automatically update.

But first...

### Manually pull the code from GitHub to Linode.
While logged-in to Linode:
```sh
git pull origin main
```

Rebuild containers:
```sh
docker compose down -v
docker compose up --build -d
```

## Rule Before Automation
❗Never automate something you haven’t done manually.


## Setup CI/CD (GitHub Actions)
In local project:

Create a new file:  

```sh
.github/workflows/automate.yml
```
```sh
name: Auto Deploy to Linode

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.0.3
        with:
          host: ${{ secrets.LINODE_HOST }}
          username: ${{ secrets.LINODE_USER }}
          key: ${{ secrets.LINODE_SSH_KEY }}
          script: |
            cd /opt/clickmart
            git pull origin main
            docker compose up --build -d
```

Add GitHub Secrets:
GitHub → Your Repository → Settings → Secrets and variables → Actions → New repository secret

```
LINODE_HOST → <LINODE_IP>
LINODE_USER → root
LINODE_SSH_KEY → Private SSH Key
```

## Push automation file:
```sh
git add .
git commit -m "CI/CD Setup"
git push origin main
```

Check GitHub Actions tab.

Make a small frontend change and confirm auto-deploy.

✅ Auto deploy successful.

## Nginx Config
From local project, create file:
```sh
nginx/default.conf
```
```
server {
    listen 80;

    # Frontend (React)
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend (Django)
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Django admin & static
    location /admin/ {
        proxy_pass http://backend:8000;
    }

    location /static/ {
        proxy_pass http://backend:8000;
    }

    location /media/ {
        proxy_pass http://backend:8000;
    }
}
```
### Docker Compose Changes
- Add nginx service
- Remove ports from backend & frontend
- Update frontend API URL: ``` VITE_SERVER_BASE_URL="/api/v1" ```

```
nginx:
  image: nginx:alpine
  ports:
    - "80:80"
  volumes:
    - ./nginx/default.conf:/etc/nginx/conf.d/default.conf
  depends_on:
    - frontend
    - backend
```

Push changes:
```sh
git add .
git commit -m "Nginx Setup"
git push origin main
```

## Update Firewall (Production)
Keep:
- ```22``` (SSH)
- ```80``` (HTTP)

Remove:
- ```8000``` (Backend)
- ```5173``` (Frontend)

## Final Test
http://<LINODE_IP>/

If you get error: Add ```backend``` to allowed host in linode server manually.

Restart docker:
```sh
docker compose down -v
docker compose up --build -d
```

## Gunicorn Setup (Production WSGI Server)

### 1. Add Gunicorn Dependency
Add `gunicorn` inside `requirements.txt`:


#### Update Backend Dockerfile

No special change is required other than ensuring requirements.txt is installed.
Gunicorn will be installed automatically via dependencies.

#### Update docker-compose.yml
Replace the Django run command with Gunicorn:
```
command: >
  gunicorn clickmart_main.wsgi:application --bind 0.0.0.0:8000 --workers 3
```
- clickmart_main.wsgi:application → Django entry point
- --bind 0.0.0.0:8000 → Listen on all interfaces
- --workers 3 → Run 3 Python worker processes

```
git add .
git commit -m "Deploy Gunicorn"
git push origin main
```

#### Important Note
✅ We did not change the application code.

✅ We only changed how Python code is executed in production.

### Verify Gunicorn Is Running
SSH into the Linode server:
```
ssh root@<LINODE_IP>
cd /opt/clickmart
docker compose logs backend
```

## Purchase a Domain

Purchase a domain from any provider (GoDaddy, Namecheap, etc.).

Connect Domain to Linode (DNS)
Add the following A records in your domain DNS:
| Type | Host | Value              |
| ---- | ---- | ------------------ |
| A    | @    | `<YOUR_LINODE_IP>` |
| A    | www  | `<YOUR_LINODE_IP>` |

Wait for DNS propagation (usually a few minutes to a few hours).

### Nginx Config as Server-Managed File
Certbot modifies the Nginx config directly on the server,
so we must remove it from Git tracking.
```
git rm --cached nginx/default.conf
```
- Removes the file from Git

Add to .gitignore:
```
nginx/default.conf
```

#### Commit and Push
```
git add .
git commit -m "Make nginx config server-managed"
git push origin main
```

#### SSH into Linode server
- Create `nginx/default.conf` file
- Add domain to this file:
```
server_name example.com www.example.com;
```
Restart nginx:
```
docker compose restart nginx
```
#### Update Django ALLOWED_HOSTS
Add your domain into `.env.docker`

Restart backend:
```
docker compose restart backend
```
### Test Domain (HTTP only
http://example.com

## Install SSL (Let’s Encrypt)

In the server root directory, create folders:
```
mkdir -p certbot/www
mkdir -p certbot/conf
```
### Update docker-compose.yml (Nginx service)
Edit docker-compose.yml locally (nginx service):
```
volumes:
  - ./certbot/www:/var/www/certbot
  - ./certbot/conf:/etc/letsencrypt
```
Push to main branch.

### Update nginx/default.conf
Edit `nginx/default.conf`

Add this block:
```
location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }
```

Restart Nginx container:
```
docker compose restart nginx
```
Make sure the site with HTTP still works at this point:

### Install Certbot
```
apt update
apt install certbot -y
```

### Get SSL Certificate (WEBROOT METHOD)
```
certbot certonly \
  --webroot \
  -w /opt/clickmart/certbot/www \
  -d djangoclickmart.store \
  -d www.djangoclickmart.store
```

### Enable HTTPS in Nginx
Edit `nginx/default.conf` again:

Replace with FINAL CONFIG:
```
server {
    listen 80;
    server_name djangoclickmart.store www.djangoclickmart.store;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name djangoclickmart.store www.djangoclickmart.store;

    ssl_certificate /etc/letsencrypt/live/djangoclickmart.store/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/djangoclickmart.store/privkey.pem;

    location / {
        proxy_pass http://frontend:80;
    }

    location /api/ {
        proxy_pass http://backend:8000;
    }

    location /admin/ {
        proxy_pass http://backend:8000;
    }

    location /static/ {
        alias /static/;
    }
}

```




#### Restart Nginx
docker compose restart nginx

#### Test HTTPS 🎉
https://example.com

Congratulations 🎉 You did it.

# Fixing Media Files in Production (Docker + Nginx + Django)

This guide explains how to fix issues where **media files (uploaded images)** are not loading correctly in production.

---

### Step 1: Update Nginx Configuration (Server)

1. Login to your production server.
2. Open the Nginx config file:

```bash
nano nginx/default.conf
```

3. Add the following block inside the HTTPS server block:
```
location /media/ {
    alias /media/;
}
```
This tells Nginx to serve uploaded media files directly.
4. Restart nginx container:
```
docker compose restart nginx
```

### Step 2: Mount Media Folder in Docker (Local Project)
1. Open `docker-compose.yml` - in your local project
2. Inside the nginx service, add the media volume mapping:
```
nginx:
    volumes:
      - ./backend-drf/media:/media
```
This allows the Nginx container to access uploaded media files created by Django.

3. Commit and push the changes:
```
git add .
git commit -m "Serve media files using nginx"
git push origin main
```

### Step 3: Verify Media Files
Try opening a media file directly in the browser:
```
https://your-domain.com/media/example.jpg
```
If the image loads, media serving is working correctly.

### Step 4 (Fallback): Fix Serializer Image URL
If media files load directly but still do not appear on the webpage, update the serializer to return a relative media path.

1. Open `products/serializers.py`
3. Update `ProductSerializer` - or whatever serializer the image is coming from.
Refer to below code:
```
from rest_framework import serializers

class ProductSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = "__all__"

    def get_image(self, obj):
        return obj.image.url if obj.image else None
```

This ensures the API returns: `/media/products/image.jpg` instead of Docker-internal URLs like `backend:8000`

4. Commit and push again:
```
git add .
git commit -m "Fix media image URL in serializer"
git push origin main
```
5. Test again.

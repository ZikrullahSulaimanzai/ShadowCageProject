# myShadowCageProject

**myShadowCageProject** is a full-stack blog application built with Django REST Framework and React. It provides a secure platform where authenticated users can read and interact with posts, while administrators manage content and users through an admin dashboard.

## Features

- User registration and JWT authentication
- User profiles and profile editing
- Password management
- Protected posts and post details
- Post creation, editing, publishing, and deletion (admin)
- Image uploads
- Comments and nested replies
- Comment moderation
- Post search
- Admin dashboard with application statistics
- User management
- Content reporting
- Responsive user interface

## Technologies

**Backend**
- Python 3.14
- Django 5.2
- Django REST Framework
- Simple JWT
- SQLite

**Frontend**
- React
- JavaScript
- CSS

**Tools**
- Docker
- Docker Compose
- Git

## Project Structure

```text
myShadowCageProject/
├── shadowsCage1/                 # Django backend
├── ShadowsCageFrontEnd/
│   └── shadowsCage-frontend/     # React frontend
├── docker-compose.yml
└── README.md
```

## Getting Started

### Requirements
- Docker
- Docker Compose

### Installation

1. Clone the repository:

```bash
git clone https://github.com/YOUR-USERNAME/myShadowCageProject.git
cd myShadowCageProject
```

2. Build and start the application:

```bash
docker compose up --build -d
```

3. Check the containers:

```bash
docker compose ps
```

4. Stop the application:

```bash
docker compose down
```

## Security

- JWT-based authentication
- Protected API endpoints
- Administrator permissions
- Password validation
- Restricted access to protected content

**Note:** Configure environment variables and production security settings before deployment. Never upload secret keys, passwords, or private `.env` files to GitHub.

## Project Purpose

This project was developed to gain practical experience in full-stack development, REST APIs, database management, authentication, Docker, and application security.

## Author
Zikrullah sulaimanzai
Computer Engineering Student

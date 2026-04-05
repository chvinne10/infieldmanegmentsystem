# Smart Field Work Manager - Complete Guide

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [API Documentation](#api-documentation)
7. [Features Guide](#features-guide)
8. [Troubleshooting](#troubleshooting)

---

## 📊 Project Overview

**Smart Field Work Manager** is an AI-powered web application designed for sales and marketing employees to manage their daily visit schedules automatically. The system uses OCR (Optical Character Recognition) to extract text from handwritten/printed schedules and converts them into structured task data using NLP.

### Key Features:
- ✅ **User Authentication** - JWT-based login/registration system
- ✅ **Schedule Upload** - Upload handwritten/printed schedules as images
- ✅ **OCR Processing** - Extract text from images using Tesseract
- ✅ **Task Management** - Create, assign, complete, reschedule tasks
- ✅ **Real-time Updates** - WebSocket integration for instant updates
- ✅ **Notifications** - Push notifications and in-app reminders
- ✅ **Voice Assistant** - Text-to-speech task announcement
- ✅ **Manager Dashboard** - Admin panel for task management
- ✅ **Analytics** - Task statistics and progress tracking

---

## 🏗️ Architecture

### Tech Stack
```
Frontend:
├── React 18 - UI library
├── Vite - Build tool
├── Tailwind CSS - Styling
├── Axios - HTTP client
├── Socket.io - Real-time WebSocket
└── React Router - Navigation

Backend:
├── Django 4.2 - Web framework
├── Django REST Framework - API
├── Django Channels - WebSocket support
├── PostgreSQL - Database
├── Celery - Task scheduling
└── Tesseract-OCR - Image text extraction

Infrastructure:
├── Docker & Docker Compose
└── Daphne - ASGI server
```

### Database Schema
```
User
├── CustomUser (username, email, password, role, phone)
├── +relationships: tasks, notifications, uploads

Task
├── id, title, description
├── client_name, client_phone, client_email
├── location, latitude, longitude
├── scheduled_time, completed_time
├── status, priority
├── assigned_to (FK: User)
├── created_by (FK: User)
└── +relationships: update_logs, notifications

UpdateLog
├── id, action, description
├── old_value, new_value (JSON)
├── task (FK: Task)
└── performed_by (FK: User)

Notification
├── id, title, message
├── notification_type, is_read, is_sent
├── user (FK: User)
└── task (FK: Task, optional)

ScheduleUpload
├── id, image, status
├── extracted_text, parsed_tasks_count
├── uploaded_by (FK: User)
└── +relationships: ocr_result
```

---

## 🚀 Installation

### Quick Start with Docker

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/smart-field-work-manager.git
cd smart-field-work-manager

# 2. Copy environment files
cp .env.example .env
cp frontend/.env.example frontend/.env

# 3. Build and start services
docker-compose up -d

# 4. Run migrations
docker-compose exec backend python manage.py migrate

# 5. Create superuser
docker-compose exec backend python manage.py createsuperuser

# 6. Access the application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# Admin: http://localhost:8000/admin
```

### Manual Installation

#### Backend Setup
```bash
# 1. Navigate to backend
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Create .env file (copy from .env.example)
cp .env.example .env

# 5. Run migrations
python manage.py migrate

# 6. Create superuser
python manage.py createsuperuser

# 7. Start development server
python manage.py runserver
```

#### Frontend Setup
```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Create .env file (copy from .env.example)
cp .env.example .env

# 4. Start development server
npm run dev
```

---

## ⚙️ Configuration

### Environment Variables

#### Backend (.env)
```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DATABASE_NAME=smart_field_manager
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_EXPIRATION_HOURS=24

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000

# Tesseract
TESSERACT_CMD=/usr/bin/tesseract  # or C:\Program Files\Tesseract-OCR\tesseract.exe on Windows

# Optional Services
FIREBASE_API_KEY=your-key
GOOGLE_MAPS_API_KEY=your-key
```

#### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api
VITE_SOCKET_URL=http://localhost:8000
VITE_ENABLE_VOICE_ASSISTANT=true
VITE_ENABLE_PUSH_NOTIFICATIONS=true
```

---

## ▶️ Running the Application

### With Docker Compose
```bash
# Start all services
docker-compose up

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Manually
```bash
# Terminal 1 - Backend
cd backend
source venv/bin/activate
python manage.py runserver

# Terminal 2 - Frontend
cd frontend
npm run dev

# Terminal 3 - Celery (optional)
cd backend
celery -A config worker -l info

# Terminal 4 - Celery Beat (optional)
cd backend
celery -A config beat -l info
```

---

## 📚 API Documentation

### Authentication
```
POST /api/users/token/
  Login and get JWT tokens
  
POST /api/users/register/
  Register new user
  
POST /api/users/token/refresh/
  Refresh access token
```

### Tasks
```
GET /api/tasks/
  List all tasks (with filters)
  
POST /api/tasks/
  Create new task
  
GET /api/tasks/today/
  Get today's tasks
  
POST /api/tasks/{id}/mark-complete/
  Mark task as completed
  
POST /api/tasks/{id}/reschedule/
  Reschedule task
```

### Uploads & OCR
```
POST /api/uploads/
  Upload schedule image
  
POST /api/uploads/{id}/process/
  Process with OCR
  
GET /api/uploads/{id}/tasks/
  Get parsed tasks
```

Full API documentation: [API_DOCS.md](./docs/API_DOCS.md)

---

## 🎯 Features Guide

### 1. User Authentication
- Users can register with username, email, password
- JWT tokens for secure API access
- Token refresh mechanism for extended sessions
- Different roles: Employee, Manager, Admin

### 2. Task Management
- Create tasks with client details, location, time
- Assign tasks to employees
- Track task status: pending, in_progress, completed, skipped
- Reschedule tasks with reason logging
- View task history and audit logs

### 3. Schedule Upload & OCR
- Upload handwritten or printed schedules
- Automatic text extraction using Tesseract OCR
- AI-based task parsing and suggestion
- Review extracted tasks before saving

### 4. Real-time Updates
- WebSocket connection for instant task updates
- Automatic refresh when tasks change
- Live notifications for new assignments
- No need to manually refresh page

### 5. Notifications
- In-app notifications for task assignments
- Push notifications for reminders
- Email notifications (configurable)
- Mark read/unread status

### 6. Voice Assistant
- Convert tasks to speech
- Speak task details on demand
- Voice recognition for quick actions (optional)
- Customizable speech settings

---

## 🔍 Troubleshooting

### Database Connection Error
**Problem:** `psycopg2.OperationalError`

**Solution:**
```bash
# Check PostgreSQL is running
# Windows: pg_ctl.exe -D "C:\Program Files\PostgreSQL\data" start
# Mac: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Verify DATABASE credentials in .env
# Run migrations again
python manage.py migrate
```

### Tesseract Not Found
**Problem:** `TesseractNotFoundError`

**Solution:**
1. **Windows:** Download from https://github.com/UB-Mannheim/tesseract/wiki
2. **Mac:** `brew install tesseract`
3. **Linux:** `sudo apt-get install tesseract-ocr`
4. Update `TESSERACT_CMD` in .env

### CORS Error
**Problem:** `Cross-Origin Request Blocked`

**Solution:**
- Add frontend URL to `CORS_ALLOWED_ORIGINS` in .env
- Restart backend server
- Clear browser cache

### WebSocket Connection Failed
**Problem:** WebSocket won't connect

**Solution:**
```bash
# Ensure daphne is running
python -m daphne -b 0.0.0.0 -p 8000 config.asgi:application

# Check CHANNELS configuration in settings.py
# Verify frontend WebSocket URL matches backend
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📖 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Django Channels](https://channels.readthedocs.io/)

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🆘 Support

For issues, questions, or suggestions:
1. Check existing GitHub issues
2. Create a detailed bug report
3. Include error logs and reproduction steps
4. Contact the development team

---

**Last Updated:** January 2024  
**Version:** 1.0.0  
**Status:** 🚀 Production Ready

# 🤖 Smart Field Work Manager

An AI-powered web application that helps marketing/sales employees manage daily visit schedules automatically using AI, OCR, and real-time updates.

## 🎯 Features

- **User Authentication**: JWT-based login/register system
- **Schedule Upload**: Upload handwritten/printed schedules via image
- **AI Processing**: Extract text from images using OCR and convert to structured tasks
- **Task Management**: Dashboard showing today's tasks with mark complete/skip/reschedule options
- **Manager Dashboard**: Admin panel to add, edit, delete tasks with instant user updates
- **Notifications System**: Push notifications and reminders for upcoming tasks
- **Voice Assistant**: Web Speech API integration to read out tasks
- **Real-Time Updates**: WebSocket integration for instant task updates
- **Database Design**: User, Task, Notification, and UpdateLog models

## 📁 Project Structure

```
gd_ai/
├── frontend/          # React application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── App.jsx
│   └── package.json
├── backend/           # Django REST Framework
│   ├── config/
│   ├── apps/
│   │   ├── users/
│   │   ├── tasks/
│   │   └── notifications/
│   ├── manage.py
│   └── requirements.txt
├── docs/              # Documentation
└── .env.example       # Environment variables template
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Tailwind CSS, Axios, Socket.io
- **Backend**: Django 4.2, Django REST Framework, Django Channels
- **Database**: PostgreSQL
- **Authentication**: JWT (djangorestframework-simplejwt)
- **OCR**: Pytesseract, Tesseract-OCR
- **Real-time**: Django Channels, WebSockets
- **Notifications**: Firebase Cloud Messaging or Web Push API

## 🚀 Getting Started

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

### Database Setup

PostgreSQL must be running. Create a database and update `.env`:

```
DATABASE_NAME=smart_field_manager
DATABASE_USER=postgres
DATABASE_PASSWORD=your_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
```

## 📚 API Documentation

See [API_DOCS.md](./docs/API_DOCS.md) for detailed endpoint information.

## 🔐 Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=localhost,127.0.0.1

# PostgreSQL
DATABASE_NAME=smart_field_manager
DATABASE_USER=postgres
DATABASE_PASSWORD=password
DATABASE_HOST=localhost
DATABASE_PORT=5432

# JWT
JWT_SECRET_KEY=your-jwt-secret

# Firebase (Optional)
FIREBASE_API_KEY=your-api-key
FIREBASE_AUTH_DOMAIN=your-auth-domain

# Google Maps (Optional)
GOOGLE_MAPS_API_KEY=your-api-key

# Tesseract
TESSERACT_CMD=/usr/bin/tesseract  # Or path on Windows
```

## 📖 Documentation

- [Backend Setup](./docs/BACKEND_SETUP.md)
- [Frontend Setup](./docs/FRONTEND_SETUP.md)
- [Database Schema](./docs/DATABASE_SCHEMA.md)
- [API Endpoints](./docs/API_DOCS.md)

## 👨‍💻 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m "Add feature description"`
4. Push: `git push origin feature/your-feature`

## 📄 License

MIT License - See LICENSE file for details

---

**Status**: 🚧 In Development

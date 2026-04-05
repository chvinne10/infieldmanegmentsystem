# Smart Field Work Manager - Setup Guide

## 🎯 Quick Start

### Backend Setup

1. **Clone repository**
   ```bash
   cd backend
   ```

2. **Create virtual environment**
   ```bash
   # Windows
   python -m venv venv
   venv\Scripts\activate
   
   # Mac/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Create .env file**
   ```bash
   cp .env.example .env
   # Update with your database credentials
   ```

5. **Set up PostgreSQL database**
   ```bash
   # Make sure PostgreSQL is running
   # Create database: smart_field_manager
   ```

6. **Run migrations**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

7. **Create superuser**
   ```bash
   python manage.py createsuperuser
   ```

8. **Create demo users** (optional)
   ```bash
   python manage.py shell
   ```
   
   ```python
   from django.contrib.auth import get_user_model
   User = get_user_model()
   
   # Create employee
   User.objects.create_user(
       username='employee',
       email='employee@example.com',
       password='password123',
       role='employee',
       first_name='Demo',
       last_name='Employee'
   )
   
   # Create manager
   User.objects.create_user(
       username='manager',
       email='manager@example.com',
       password='password123',
       role='manager',
       first_name='Demo',
       last_name='Manager'
   )
   ```

9. **Run development server**
   ```bash
   python manage.py runserver
   ```

   Server will be available at: `http://localhost:8000`
   Admin panel: `http://localhost:8000/admin`

### Frontend Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   # Update API URL if needed
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   App will be available at: `http://localhost:3000`

## 📦 Database Schema

### User Model
- username, email, password
- first_name, last_name, phone
- role (employee, manager, admin)
- profile_image, fcm_token
- is_active, created_at, updated_at

### Task Model
- title, description
- client_name, client_phone, client_email
- location, latitude, longitude
- scheduled_time, completed_time
- status, priority
- assigned_to (FK to User)
- created_by (FK to User)
- purpose, notes, tags
- attachment, is_recurring, recurrence_pattern

### Notification Model
- user (FK to User)
- task (FK to Task, optional)
- notification_type
- title, message
- is_read, is_sent
- created_at, read_at

### UpdateLog Model
- task (FK to Task)
- action, description
- performed_by (FK to User)
- old_value, new_value (JSON)
- created_at

### ScheduleUpload Model
- uploaded_by (FK to User)
- image (file)
- status (pending, processing, completed, failed)
- extracted_text, parsed_tasks_count
- error_message
- file_name, file_size, mime_type
- created_at, processed_at

## 🚀 API Endpoints

### Authentication
- `POST /api/users/token/` - Login
- `POST /api/users/token/refresh/` - Refresh token
- `POST /api/users/register/` - Register new user

### Users
- `GET /api/users/me/` - Get current user
- `GET /api/users/` - List all users
- `GET /api/users/employees/` - Get all employees (manager only)
- `GET /api/users/managers/` - Get all managers
- `POST /api/users/update-fcm-token/` - Update FCM token

### Tasks
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}/` - Get task details
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task
- `GET /api/tasks/today/` - Get today's tasks
- `POST /api/tasks/{id}/mark-complete/` - Mark as completed
- `POST /api/tasks/{id}/skip/` - Skip task
- `POST /api/tasks/{id}/reschedule/` - Reschedule task
- `GET /api/tasks/stats/` - Get statistics
- `GET /api/tasks/overdue/` - Get overdue tasks

### Notifications
- `GET /api/notifications/` - Get notifications
- `GET /api/notifications/unread/` - Get unread
- `POST /api/notifications/{id}/mark-as-read/` - Mark as read
- `POST /api/notifications/mark-all-as-read/` - Mark all as read
- `DELETE /api/notifications/clear-all/` - Clear all

### Uploads & OCR
- `POST /api/uploads/` - Upload image
- `GET /api/uploads/` - List uploads
- `POST /api/uploads/{id}/process/` - Process with OCR
- `GET /api/uploads/{id}/tasks/` - Get parsed tasks
- `GET /api/uploads/recent/` - Get recent uploads
- `GET /api/uploads/stats/` - Get statistics

### WebSocket
- `ws://localhost:8000/ws/tasks/updates/` - Real-time task updates

## 🔧 Configuration

### Tesseract-OCR Installation

**Windows:**
1. Download installer from: https://github.com/UB-Mannheim/tesseract/wiki
2. Install to: `C:\Program Files\Tesseract-OCR`
3. Update `.env`: `TESSERACT_CMD=C:\\Program Files\\Tesseract-OCR\\tesseract.exe`

**Mac:**
```bash
brew install tesseract
```

**Linux:**
```bash
sudo apt-get install tesseract-ocr
```

### Firebase Setup (Optional)
1. Create Firebase project at https://firebase.google.com
2. Get credentials and update `.env`
3. Enable Cloud Messaging

### Google Maps API (Optional)
1. Get API key from Google Cloud Console
2. Update `.env` with `GOOGLE_MAPS_API_KEY`

## 📝 Features

✅ User authentication with JWT
✅ Task management and assignment
✅ OCR-based schedule extraction
✅ Real-time task updates via WebSockets
✅ Push notifications
✅ Voice assistant (Web Speech API)
✅ Manager dashboard
✅ Responsive UI with Tailwind CSS

## 🐛 Troubleshooting

### Database connection error
- Check PostgreSQL is running
- Verify DATABASE_* settings in .env
- Run migrations: `python manage.py migrate`

### Tesseract not found
- Install Tesseract-OCR
- Update TESSERACT_CMD in settings.py
- Restart server

### CORS errors
- Update CORS_ALLOWED_ORIGINS in .env
- Check frontend URL matches settings

### WebSocket connection failed
- Ensure daphne is running
-check WebSocket URL in frontend

## 📚 Additional Resources

- Django Docs: https://docs.djangoproject.com/
- DRF Docs: https://www.django-rest-framework.org/
- React Docs: https://react.dev/
- Tailwind CSS: https://tailwindcss.com/

## 🤝 Support

For issues or questions:
1. Check existing issues
2. Create detailed bug report
3. Include error logs and steps to reproduce

Happy coding! 🚀

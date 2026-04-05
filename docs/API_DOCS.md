# API Documentation

## Authentication

### Login
**POST** `/api/users/token/`

Request:
```json
{
  "username": "employee",
  "password": "password123"
}
```

Response:
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "user": {
    "id": 1,
    "username": "employee",
    "email": "employee@example.com",
    "first_name": "Demo",
    "last_name": "Employee",
    "role": "employee"
  }
}
```

### Refresh Token
**POST** `/api/users/token/refresh/`

Request:
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

Response:
```json
{
  "access": "new_access_token"
}
```

## Users

### Get Current User
**GET** `/api/users/me/`

Response:
```json
{
  "id": 1,
  "username": "employee",
  "email": "employee@example.com",
  "first_name": "Demo",
  "last_name": "Employee",
  "phone": "+1234567890",
  "role": "employee",
  "is_active": true,
  "created_at": "2024-01-15T10:00:00Z",
  "updated_at": "2024-01-15T10:00:00Z"
}
```

### Register User
**POST** `/api/users/register/`

Request:
```json
{
  "username": "newuser",
  "email": "newuser@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "password": "secure_password_123",
  "password2": "secure_password_123",
  "phone": "+1234567890",
  "role": "employee"
}
```

### Get All Employees (Manager only)
**GET** `/api/users/employees/`

Response:
```json
[
  {
    "id": 2,
    "username": "employee1",
    "email": "emp1@example.com",
    "first_name": "John",
    "last_name": "Smith",
    "role": "employee"
  }
]
```

## Tasks

### Get All Tasks
**GET** `/api/tasks/?status=pending&priority=high`

Query Parameters:
- `status`: pending, in_progress, completed, skipped, etc.
- `priority`: low, medium, high, urgent
- `assigned_to`: user_id
- `scheduled_time`: date filter

Response:
```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Visit Client X",
      "description": "Follow-up meeting",
      "client_name": "ABC Corp",
      "client_phone": "+1234567890",
      "client_email": "contact@abc.com",
      "location": "123 Main St, City",
      "latitude": 40.7128,
      "longitude": -74.0060,
      "scheduled_time": "2024-01-20T14:30:00Z",
      "completed_time": null,
      "status": "pending",
      "priority": "high",
      "assigned_to": 2,
      "assigned_to_detail": {
        "id": 2,
        "username": "employee1",
        "email": "emp1@example.com"
      },
      "created_by": 1,
      "purpose": "Discuss project timeline",
      "notes": "Client prefers afternoon meetings",
      "tags": "important, client_a",
      "is_today": true,
      "is_overdue": false,
      "created_at": "2024-01-15T10:00:00Z",
      "updated_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### Get Today's Tasks
**GET** `/api/tasks/today/`

Response:
```json
{
  "count": 3,
  "results": [
    {
      "id": 1,
      "title": "Visit Client X",
      ...
    }
  ]
}
```

### Create Task
**POST** `/api/tasks/`

Request:
```json
{
  "title": "Visit Client",
  "client_name": "ABC Corp",
  "location": "123 Main St",
  "scheduled_time": "2024-01-20T14:30:00Z",
  "assigned_to": 2,
  "priority": "high",
  "purpose": "Sales follow-up",
  "notes": "Bring presentation",
  "status": "pending"
}
```

### Mark Task as Completed
**POST** `/api/tasks/{id}/mark-complete/`

Request:
```json
{
  "notes": "Meeting completed successfully"
}
```

Response:
```json
{
  "message": "Task marked as completed",
  "task": {
    "id": 1,
    "status": "completed",
    "completed_time": "2024-01-20T14:45:00Z"
  }
}
```

### Reschedule Task
**POST** `/api/tasks/{id}/reschedule/`

Request:
```json
{
  "scheduled_time": "2024-01-21T15:00:00Z",
  "reason": "Client requested reschedule"
}
```

### Get Task Statistics
**GET** `/api/tasks/stats/`

Response:
```json
{
  "total_tasks": 25,
  "completed_tasks": 10,
  "pending_tasks": 12,
  "overdue_tasks": 3,
  "today_tasks": 5
}
```

## Notifications

### Get All Notifications
**GET** `/api/notifications/`

Response:
```json
[
  {
    "id": 1,
    "notification_type": "task_assigned",
    "title": "New Task Assigned",
    "message": "You have been assigned a task: Visit Client X",
    "is_read": false,
    "is_sent": true,
    "task": 1,
    "created_at": "2024-01-20T10:00:00Z",
    "read_at": null
  }
]
```

### Get Unread Notifications
**GET** `/api/notifications/unread/`

Response:
```json
{
  "count": 3,
  "results": [...]
}
```

### Mark Notification as Read
**POST** `/api/notifications/{id}/mark-as-read/`

Response:
```json
{
  "message": "Notification marked as read",
  "notification": {...}
}
```

## Uploads & OCR

### Upload Schedule Image
**POST** `/api/uploads/`

Request (multipart/form-data):
```
image: <file>
description: "Optional description"
```

Response:
```json
{
  "id": 1,
  "image": "/media/schedules/2024/01/20/image.jpg",
  "status": "pending",
  "extracted_text": "",
  "parsed_tasks_count": 0,
  "uploaded_by": 2,
  "created_at": "2024-01-20T10:00:00Z"
}
```

### Process Upload with OCR
**POST** `/api/uploads/{id}/process/`

Response:
```json
{
  "upload_id": 1,
  "status": "completed",
  "extracted_text": "3 PM - Visit ABC Corp at 123 Main St...",
  "parsed_tasks": [
    {
      "title": "Visit ABC Corp",
      "client_name": "ABC Corp",
      "location": "123 Main St",
      "time": "3 PM"
    }
  ],
  "task_count": 1,
  "confidence": 92.5,
  "processing_time": 2.34
}
```

### Get Parsed Tasks from Upload
**GET** `/api/uploads/{id}/tasks/`

Response:
```json
{
  "upload_id": 1,
  "parsed_tasks": [...],
  "task_count": 3,
  "suggestions": [
    {
      "type": "follow_up",
      "count": 2,
      "confidence": 90
    }
  ]
}
```

## WebSocket Events

### Connect
```javascript
const socket = io('ws://localhost:8000/ws/tasks/updates/');
socket.on('connect', () => {
  console.log('Connected to WebSocket');
});
```

### Task Update Event
```javascript
socket.on('task_update', (data) => {
  console.log('Task updated:', data);
});
```

### Task Created Event
```javascript
socket.on('task_created', (data) => {
  console.log('New task:', data);
});
```

### Task Completed Event
```javascript
socket.on('task_completed', (data) => {
  console.log('Task completed:', data);
});
```

## Error Responses

### 400 Bad Request
```json
{
  "field": ["Error message"]
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
  "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
  "detail": "Not found."
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

## Authentication Headers

All authenticated requests require:
```
Authorization: Bearer <access_token>
```

## Rate Limiting

API implements rate limiting:
- 100 requests per minute per user
- 1000 requests per hour per user

## Pagination

List endpoints support pagination:
- `?page=1&page_size=20`
- Default page size: 20
- Maximum page size: 100

---

**Version:** 1.0.0  
**Last Updated:** January 2024

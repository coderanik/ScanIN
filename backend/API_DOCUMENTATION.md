# ScanIN Backend API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## 🔐 Authentication Routes (`/auth`)

### 1. User Registration
```http
POST /auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "studentId": "STU123456",
  "password": "password123",
  "role": "student" // optional, defaults to "student"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "jwt_token"
}
```

### 2. User Login
```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "user": {
    "id": "user_id",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "student"
  },
  "token": "jwt_token"
}
```

---

## 📅 Event Routes (`/events`)

### 1. Create Event (Admin Only)
```http
POST /events
```

**Request Body:**
```json
{
  "title": "Tech Conference 2024",
  "description": "Annual technology conference",
  "location": "Main Auditorium",
  "date": "2024-03-15",
  "time": "09:00 AM"
}
```

**Response:**
```json
{
  "message": "Event created successfully",
  "event": {
    "id": "event_id",
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "location": "Main Auditorium",
    "date": "2024-03-15",
    "time": "09:00 AM",
    "createdBy": "admin_id"
  }
}
```

### 2. Register for Event (Students)
```http
POST /events/:eventId/register
```

**Response:**
```json
{
  "message": "Registered successfully",
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### 3. Check-in User (Admin Only)
```http
POST /events/:eventId/check-in/:userId
```

**Response:**
```json
{
  "message": "Check-in successful"
}
```

### 4. Get Event Attendees (Admin Only)
```http
GET /events/:eventId/attendees
```

**Response:**
```json
{
  "totalAttendees": 25,
  "checkedIn": 18,
  "attendees": [
    {
      "user": {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "studentId": "STU123456"
      },
      "checkedIn": true,
      "qrCode": "data:image/png;base64,..."
    }
  ]
}
```

---

## 👨‍💼 Admin Routes (`/admin`)

### 1. Create Event
```http
POST /admin/event
```

**Request Body:**
```json
{
  "title": "Workshop Series",
  "description": "Programming workshop",
  "location": "Computer Lab",
  "date": "2024-03-20",
  "time": "02:00 PM"
}
```

### 2. Get Event Attendees
```http
GET /admin/attendees/:eventId
```

**Response:**
```json
{
  "attendees": [
    {
      "userId": {
        "name": "John Doe",
        "email": "john@example.com",
        "studentId": "STU123456"
      },
      "checkedIn": true,
      "registeredAt": "2024-03-10T10:30:00Z"
    }
  ]
}
```

### 3. Manual Check-in User
```http
POST /admin/checkin
```

**Request Body:**
```json
{
  "userId": "user_id",
  "eventId": "event_id"
}
```

### 4. Export Attendees Data
```http
GET /admin/export/:eventId
```

**Response:**
```json
{
  "event": {
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "location": "Main Auditorium",
    "date": "2024-03-15",
    "time": "09:00 AM"
  },
  "totalRegistered": 25,
  "totalCheckedIn": 18,
  "attendees": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "studentId": "STU123456",
      "registeredAt": "2024-03-10T10:30:00Z",
      "checkedIn": true,
      "checkInTime": "2024-03-15T09:15:00Z",
      "qrCode": "data:image/png;base64,..."
    }
  ]
}
```

### 5. Scan QR Code (NEW)
```http
POST /admin/scan-qr
```

**Request Body:**
```json
{
  "qrCodeData": "{\"userId\":\"user_id\",\"eventId\":\"event_id\",\"timestamp\":1647856800000}"
}
```

**Response:**
```json
{
  "message": "Check-in successful",
  "user": {
    "name": "John Doe",
    "email": "john@example.com",
    "studentId": "STU123456"
  },
  "event": {
    "title": "Tech Conference 2024",
    "location": "Main Auditorium",
    "date": "2024-03-15",
    "time": "09:00 AM"
  },
  "checkInTime": "2024-03-15T09:15:00Z"
}
```

### 6. Get Attendance Statistics (NEW)
```http
GET /admin/stats/:eventId
```

**Response:**
```json
{
  "event": {
    "title": "Tech Conference 2024",
    "description": "Annual technology conference",
    "location": "Main Auditorium",
    "date": "2024-03-15",
    "time": "09:00 AM"
  },
  "statistics": {
    "totalRegistered": 25,
    "totalCheckedIn": 18,
    "totalManualCheckins": 5,
    "totalQRCheckins": 13,
    "attendanceRate": "72.00"
  },
  "recentCheckins": [
    {
      "name": "John Doe",
      "email": "john@example.com",
      "studentId": "STU123456",
      "checkInTime": "2024-03-15T09:15:00Z"
    }
  ]
}
```

---

## 📊 Attendance Routes (`/attendance`)

### 1. Generate Event QR Code
```http
GET /attendance/event/:eventId/qr
```

**Response:**
```json
{
  "qrCode": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### 2. Record Manual Attendance
```http
POST /attendance/event/:eventId/check-in
```

**Request Body:**
```json
{
  "participantName": "John Doe",
  "email": "john@example.com"
}
```

**Response:**
```json
{
  "message": "Attendance recorded successfully",
  "attendance": {
    "id": "attendance_id",
    "eventId": "event_id",
    "participantName": "John Doe",
    "email": "john@example.com",
    "timeOfAttendance": "2024-03-15T09:15:00Z"
  }
}
```

### 3. Export Attendance to Excel
```http
GET /attendance/event/:eventId/export
```

**Response:** Excel file download with columns:
- Participant Name
- Email
- Student ID
- Check-in Method (Manual/QR Code)
- Time of Attendance
- QR Code

---

## 🔄 Complete Backend Workflow

### 1. **System Initialization**
```
Server Start → Database Connection → Load Routes → CORS Setup → Ready
```

### 2. **User Registration Flow**
```
User Registration → Validate Data → Check Duplicates → Hash Password → Create User → Generate JWT → Return Token
```

### 3. **User Login Flow**
```
User Login → Find User → Verify Password → Generate JWT → Return User Data + Token
```

### 4. **Event Creation Flow (Admin)**
```
Admin Login → Create Event → Validate Data → Save Event → Return Event Details
```

### 5. **Student Event Registration Flow**
```
Student Login → Select Event → Generate QR Code → Save Registration → Send Email → Return QR Code
```

### 6. **QR Code Scanning Flow (Admin)**
```
Admin Scan QR → Parse QR Data → Validate User/Event → Check Registration → Mark Attendance → Update Records → Return Confirmation
```

### 7. **Manual Check-in Flow (Admin)**
```
Admin Manual Check-in → Find User/Event → Validate Registration → Mark Check-in → Update Records → Return Confirmation
```

### 8. **Attendance Export Flow**
```
Admin Request Export → Gather All Data → Combine Manual + QR Check-ins → Generate Excel → Return File
```

### 9. **Statistics Generation Flow**
```
Admin Request Stats → Calculate Metrics → Get Recent Check-ins → Return Statistics
```

---

## 🛡️ Security Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control

### Authorization
- Admin-only routes protected
- Student-only routes protected
- Middleware validation

### Data Validation
- Input sanitization
- Email format validation
- Required field validation

---

## 📋 Error Handling

### Common Error Responses

**400 Bad Request:**
```json
{
  "message": "Invalid QR code format"
}
```

**401 Unauthorized:**
```json
{
  "message": "Please authenticate."
}
```

**403 Forbidden:**
```json
{
  "message": "Access denied. Admin privileges required."
}
```

**404 Not Found:**
```json
{
  "message": "Event not found"
}
```

**500 Internal Server Error:**
```json
{
  "error": "Database connection failed"
}
```

---

## 🗄️ Database Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  studentId: String (unique),
  password: String (hashed),
  role: String (enum: ['student', 'admin']),
  registeredEvents: [Event IDs]
}
```

### Event Model
```javascript
{
  title: String,
  description: String,
  location: String,
  date: Date,
  time: String,
  createdBy: User ID,
  attendees: [{
    user: User ID,
    qrCode: String,
    checkedIn: Boolean
  }]
}
```

### Registration Model
```javascript
{
  userId: User ID,
  eventId: Event ID,
  qrCode: String,
  checkedIn: Boolean,
  registeredAt: Date
}
```

### Attendance Model
```javascript
{
  eventId: Event ID,
  participantName: String,
  email: String,
  qrCode: String,
  timeOfAttendance: Date
}
```

---

## 🚀 Environment Variables

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/scanin
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

---

## 📝 Usage Examples

### Complete QR Code Scanning Workflow

1. **Admin creates event:**
```bash
curl -X POST http://localhost:3000/api/admin/event \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{"title":"Workshop","description":"Tech workshop","location":"Lab 101","date":"2024-03-20","time":"02:00 PM"}'
```

2. **Student registers for event:**
```bash
curl -X POST http://localhost:3000/api/events/event_id/register \
  -H "Authorization: Bearer student_token"
```

3. **Admin scans student QR code:**
```bash
curl -X POST http://localhost:3000/api/admin/scan-qr \
  -H "Authorization: Bearer admin_token" \
  -H "Content-Type: application/json" \
  -d '{"qrCodeData":"{\"userId\":\"user_id\",\"eventId\":\"event_id\",\"timestamp\":1647856800000}"}'
```

4. **Admin exports attendance:**
```bash
curl -X GET http://localhost:3000/api/attendance/event/event_id/export \
  -H "Authorization: Bearer admin_token" \
  --output attendance.xlsx
```

This completes the comprehensive API documentation and workflow for the ScanIN backend system. 
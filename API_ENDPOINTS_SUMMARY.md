# ScanIN API Endpoints Summary

## 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/auth/register` | Register new user | ❌ | Any |
| POST | `/auth/login` | User login | ❌ | Any |

## 📅 Events (`/api/events`)
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/events` | Create event | ✅ | Admin |
| POST | `/events/:eventId/register` | Register for event | ✅ | Student |
| POST | `/events/:eventId/check-in/:userId` | Check-in user | ✅ | Admin |
| GET | `/events/:eventId/attendees` | Get event attendees | ✅ | Admin |

## 👨‍💼 Admin (`/api/admin`)
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| POST | `/admin/event` | Create event | ✅ | Admin |
| GET | `/admin/attendees/:eventId` | Get attendees | ✅ | Admin |
| POST | `/admin/checkin` | Manual check-in | ✅ | Admin |
| GET | `/admin/export/:eventId` | Export attendees | ✅ | Admin |
| POST | `/admin/scan-qr` | Scan QR code | ✅ | Admin |
| GET | `/admin/stats/:eventId` | Get attendance stats | ✅ | Admin |

## 📊 Attendance (`/api/attendance`)
| Method | Endpoint | Description | Auth Required | Role Required |
|--------|----------|-------------|---------------|---------------|
| GET | `/attendance/event/:eventId/qr` | Generate event QR | ❌ | None |
| POST | `/attendance/event/:eventId/check-in` | Record manual attendance | ❌ | None |
| GET | `/attendance/event/:eventId/export` | Export to Excel | ❌ | None |

---

## 📋 Complete Backend Workflow

### **1. System Initialization**
```
Server Start → Database Connection → Load Routes → CORS Setup → Ready
```

### **2. User Management Workflow**
```
Registration → Validation → Password Hash → User Creation → JWT Token → Login
```

### **3. Event Management Workflow**
```
Admin Login → Create Event → Validation → Database Save → Event Available
```

### **4. Student Registration Workflow**
```
Student Login → Browse Events → Select Event → Generate QR → Save Registration → Email Confirmation
```

### **5. QR Code Scanning Workflow**
```
Admin Scan QR → Parse Data → Validate User/Event → Check Registration → Mark Attendance → Update Records
```

### **6. Attendance Export Workflow**
```
Admin Request → Gather Data → Combine Manual + QR → Generate Excel → Download File
```

### **7. Statistics Generation Workflow**
```
Admin Request → Calculate Metrics → Get Recent Activity → Return Statistics
```

---

## 🔄 Data Flow Summary

### **Registration Flow**
```
Student Input → Validation → Database Check → QR Generation → Email → Storage
```

### **Check-in Flow**
```
QR Scan → Validation → Attendance Marking → Database Update → Confirmation
```

### **Export Flow**
```
Request → Data Aggregation → Excel Generation → File Download
```

---

## 🛡️ Security Features

- **JWT Authentication** for all protected routes
- **Role-based Authorization** (Admin/Student)
- **Password Hashing** with bcrypt
- **Input Validation** and sanitization
- **CORS Protection**
- **Error Handling** with proper HTTP status codes

---

## 📊 Database Models

### **User**
- name, email, studentId, password, role, registeredEvents

### **Event**
- title, description, location, date, time, createdBy, attendees

### **Registration**
- userId, eventId, qrCode, checkedIn, registeredAt

### **Attendance**
- eventId, participantName, email, qrCode, timeOfAttendance

---

## 🚀 Key Features

1. **QR Code Generation** for event registration
2. **QR Code Scanning** for automatic attendance
3. **Manual Check-in** for admins
4. **Excel Export** with comprehensive data
5. **Real-time Statistics** and analytics
6. **Email Notifications** for registrations
7. **Role-based Access Control**
8. **Comprehensive Error Handling**

---

## 📝 Usage Examples

### **Complete QR Scanning Workflow**
```bash
# 1. Admin creates event
POST /admin/event

# 2. Student registers
POST /events/:id/register

# 3. Admin scans QR
POST /admin/scan-qr

# 4. Export attendance
GET /attendance/event/:id/export
```

### **Authentication Flow**
```bash
# 1. Register
POST /auth/register

# 2. Login
POST /auth/login

# 3. Use token for protected routes
Authorization: Bearer <token>
```

This summary provides a quick reference for all API endpoints and the complete backend workflow of the ScanIN system. 
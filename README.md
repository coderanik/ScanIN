# QR-Based Event Check-In System

A backend system for managing college event check-ins using QR codes. The system allows users to register for events and receive a unique QR code. On the event day, organizers can scan the QR to verify attendance and mark the user as "checked-in."

## Features

- User Registration and Login with JWT Authentication
- Role-based access (student, admin)
- Event Creation and Management
- QR Code Generation for Event Registration
- Email Notifications with QR Codes
- Admin Dashboard for Attendee Management
- Swagger API Documentation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd scanin
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/scanin
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:
```
http://localhost:3000/api-docs
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user

### Events
- POST `/api/events` - Create a new event (Admin only)
- POST `/api/events/:eventId/register` - Register for an event
- POST `/api/events/:eventId/check-in/:userId` - Check-in an attendee (Admin only)
- GET `/api/events/:eventId/attendees` - Get event attendees (Admin only)

## Usage

1. Register a new user (student or admin)
2. Login to get JWT token
3. Use the token in the Authorization header for protected routes
4. Create events (admin only)
5. Register for events (students)
6. Check-in attendees using QR codes (admin only)

## Security

- JWT-based authentication
- Password hashing using bcrypt
- Role-based access control
- Input validation using express-validator

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 
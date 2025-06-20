export interface User {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  role: 'admin' | 'student';
  registeredEvents: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
  createdBy: string;
  attendees: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  _id: string;
  userId: string;
  eventId: string;
  qrCode: string;
  checkedIn: boolean;
  registeredAt: string;
}

export interface Attendance {
  _id: string;
  eventId: string;
  participantName: string;
  email: string;
  qrCode: string;
  timeOfAttendance: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  studentId: string;
  password: string;
  role: 'admin' | 'student';
}

export interface CreateEventRequest {
  title: string;
  description: string;
  location: string;
  date: string;
  time: string;
}

export interface QRScanRequest {
  qrCode: string;
  eventId: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
} 
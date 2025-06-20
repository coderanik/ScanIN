import api from '@/lib/api';
import { Event, CreateEventRequest, Registration, Attendance, ApiResponse } from '@/types';

export const eventService = {
  // Admin Event Management
  async createEvent(eventData: CreateEventRequest): Promise<Event> {
    const response = await api.post<ApiResponse<Event>>('/admin/event', eventData);
    
    if (response.data.success) {
      return response.data.data!;
    }
    
    throw new Error(response.data.message || 'Failed to create event');
  },

  async getEvents(): Promise<Event[]> {
    const response = await api.get<ApiResponse<Event[]>>('/events');
    
    if (response.data.success) {
      return response.data.data!;
    }
    
    throw new Error(response.data.message || 'Failed to fetch events');
  },

  async getEventById(eventId: string): Promise<Event> {
    const response = await api.get<ApiResponse<Event>>(`/events/${eventId}`);
    
    if (response.data.success) {
      return response.data.data!;
    }
    
    throw new Error(response.data.message || 'Failed to fetch event');
  },

  // Student Event Registration
  async registerForEvent(eventId: string): Promise<Registration> {
    const response = await api.post<ApiResponse<Registration>>(`/events/${eventId}/register`);
    
    if (response.data.success) {
      return response.data.data!;
    }
    
    throw new Error(response.data.message || 'Failed to register for event');
  },

  // Admin Attendance Management
  async getEventAttendees(eventId: string): Promise<Attendance[]> {
    const response = await api.get<ApiResponse<Attendance[]>>(`/admin/attendees/${eventId}`);
    
    if (response.data.success) {
      return response.data.data!;
    }
    
    throw new Error(response.data.message || 'Failed to fetch attendees');
  },

  async scanQRCode(qrCode: string, eventId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>('/admin/scan-qr', {
      qrCode,
      eventId
    });
    
    if (response.data.success) {
      return response.data.data!;
    }
    
    throw new Error(response.data.message || 'Failed to scan QR code');
  },

  async manualCheckIn(eventId: string, userId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.post<ApiResponse<{ success: boolean; message: string }>>(`/events/${eventId}/check-in/${userId}`);
    
    if (response.data.success) {
      return response.data.data!;
    }
    
    throw new Error(response.data.message || 'Failed to check in user');
  },

  async exportAttendance(eventId: string): Promise<Blob> {
    const response = await api.get(`/attendance/event/${eventId}/export`, {
      responseType: 'blob'
    });
    
    return response.data;
  },

  async getEventStats(eventId: string): Promise<any> {
    const response = await api.get<ApiResponse<any>>(`/admin/stats/${eventId}`);
    
    if (response.data.success) {
      return response.data.data!;
    }
    
    throw new Error(response.data.message || 'Failed to fetch event statistics');
  }
}; 
'use client';

import { useState, useEffect } from 'react';
import { QrCode, Camera, Users, Download, Search, X } from 'lucide-react';
import { eventService } from '@/services/eventService';
import { Event, Attendance } from '@/types';
import QRScanner from '@/components/QRScanner';
import toast from 'react-hot-toast';

export default function AdminAttendancePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendance[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      loadAttendees(selectedEvent._id);
    }
  }, [selectedEvent]);

  const loadEvents = async () => {
    try {
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
      if (eventsData.length > 0) {
        setSelectedEvent(eventsData[0]);
      }
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setIsLoading(false);
    }
  };

  const loadAttendees = async (eventId: string) => {
    try {
      const attendeesData = await eventService.getEventAttendees(eventId);
      setAttendees(attendeesData);
    } catch (error) {
      toast.error('Failed to load attendees');
    }
  };

  const handleQRScan = async (qrCode: string) => {
    if (!selectedEvent) {
      toast.error('Please select an event first');
      return;
    }

    try {
      const result = await eventService.scanQRCode(qrCode, selectedEvent._id);
      toast.success(result.message);
      setShowScanner(false);
      
      // Reload attendees to show updated data
      await loadAttendees(selectedEvent._id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to scan QR code');
    }
  };

  const handleExportAttendance = async () => {
    if (!selectedEvent) {
      toast.error('Please select an event first');
      return;
    }

    try {
      const blob = await eventService.exportAttendance(selectedEvent._id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance-${selectedEvent.title}-${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Attendance exported successfully');
    } catch (error) {
      toast.error('Failed to export attendance');
    }
  };

  const filteredAttendees = attendees.filter(attendee =>
    attendee.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    attendee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="mt-2 text-gray-600">Scan QR codes and manage event attendance</p>
        </div>

        {/* Event Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Event</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                  selectedEvent?._id === event._id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">{event.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString()} at {event.time}
                  </span>
                  <span className="text-xs text-gray-500">{event.location}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedEvent && (
          <>
            {/* QR Scanner Section */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-gray-900">
                  QR Code Scanner - {selectedEvent.title}
                </h2>
                <button
                  onClick={() => setShowScanner(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Open Scanner
                </button>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6 text-center">
                <QrCode className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">
                  Click "Open Scanner" to start scanning QR codes for attendance
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Make sure to allow camera access when prompted
                </p>
              </div>
            </div>

            {/* Attendees List */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Attendees</h2>
                  <button
                    onClick={handleExportAttendance}
                    className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attendees..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        QR Code
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Check-in Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAttendees.map((attendee) => (
                      <tr key={attendee._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {attendee.participantName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{attendee.email}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {attendee.qrCode.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(attendee.timeOfAttendance).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No attendees found</p>
                  <p className="text-sm text-gray-400">Start scanning QR codes to record attendance</p>
                </div>
              )}
            </div>
          </>
        )}

        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">QR Code Scanner</h3>
                <button
                  onClick={() => setShowScanner(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <QRScanner onScan={handleQRScan} onError={(error) => toast.error(error)} />
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowScanner(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close Scanner
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
} 
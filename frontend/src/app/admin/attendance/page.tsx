'use client';

import { useState, useEffect } from 'react';
import { QrCode, Camera, Users, Download, Search, X, Calendar, MapPin, Clock, Sparkles } from 'lucide-react';

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
    (attendee.participantName && attendee.participantName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (attendee.email && attendee.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
            Attendance Management
          </h1>
          <p className="mt-3 text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your event check-ins with QR code scanning and real-time attendance tracking
          </p>
        </div>

        {/* Event Selection */}
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
          <div className="flex items-center mb-6">
            <Calendar className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Select Event</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                className={`group relative p-6 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                  selectedEvent?._id === event._id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-2xl'
                    : 'bg-white hover:bg-gray-50 shadow-lg hover:shadow-xl border border-gray-100'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <h3 className="font-bold text-lg mb-2">{event.title}</h3>
                  <p className={`text-sm mb-4 ${selectedEvent?._id === event._id ? 'text-blue-100' : 'text-gray-600'}`}>
                    {event.description}
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <div className={`mt-4 pt-4 border-t ${selectedEvent?._id === event._id ? 'border-white/20' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Attendees</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedEvent?._id === event._id 
                          ? 'bg-white/20 text-white' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {event.attendeeCount}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {selectedEvent && (
          <>
            {/* QR Scanner Section */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <QrCode className="h-6 w-6 text-blue-600 mr-3" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    QR Code Scanner
                  </h2>
                </div>
                <button
                  onClick={() => setShowScanner(true)}
                  className="group flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <Camera className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Open Scanner
                </button>
              </div>
              
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 text-center border border-gray-100">
                <div className="inline-flex p-4 bg-white rounded-2xl shadow-lg mb-6">
                  <QrCode className="h-12 w-12 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Scan</h3>
                <p className="text-gray-600 mb-4">
                  Click "Open Scanner" to start scanning QR codes for <span className="font-semibold text-blue-600">{selectedEvent.title}</span>
                </p>
                <p className="text-sm text-gray-500 bg-white/60 rounded-lg py-2 px-4 inline-block">
                  💡 Make sure to allow camera access when prompted
                </p>
              </div>
            </div>

            {/* Attendees List */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 overflow-hidden">
              <div className="px-8 py-6 bg-gradient-to-r from-gray-50 to-blue-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-6 w-6 text-blue-600 mr-3" />
                    <h2 className="text-2xl font-bold text-gray-900">Attendees</h2>
                    <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {filteredAttendees.length}
                    </span>
                  </div>
                  <button
                    onClick={handleExportAttendance}
                    className="group flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <Download className="h-4 w-4 mr-2 group-hover:translate-y-1 transition-transform duration-300" />
                    Export
                  </button>
                </div>
              </div>

              {/* Search */}
              <div className="px-8 py-6 bg-gradient-to-r from-gray-50/50 to-blue-50/50 border-b border-gray-200">
                <div className="relative max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search attendees by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white/80 backdrop-blur-sm transition-all duration-300"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50/80">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Participant
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        QR Code
                      </th>
                      <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                        Check-in Time
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white/60 divide-y divide-gray-200">
                    {filteredAttendees.map((attendee, index) => (
                      <tr key={attendee._id} className="hover:bg-blue-50/50 transition-colors duration-200">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm mr-4">
                              {attendee.participantName.charAt(0)}
                            </div>
                            <div className="text-sm font-bold text-gray-900">
                              {attendee.participantName}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{attendee.email}</div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700 font-mono bg-gray-100 px-3 py-1 rounded-lg inline-block">
                            {attendee.qrCode.substring(0, 8)}...
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="text-sm text-gray-700">
                            {new Date(attendee.timeOfAttendance).toLocaleString()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredAttendees.length === 0 && (
                <div className="text-center py-16">
                  <div className="inline-flex p-4 bg-gray-100 rounded-2xl mb-6">
                    <Users className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">No Attendees Found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm ? 'Try adjusting your search terms' : 'Start scanning QR codes to record attendance'}
                  </p>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* QR Scanner Modal */}
        {showScanner && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-white/20">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">QR Code Scanner</h3>
                <button
                  onClick={() => setShowScanner(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <QRScanner onScan={handleQRScan} onError={(error) => alert(error)} />
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowScanner(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-2xl hover:bg-gray-300 transition-colors"
                >
                  Close Scanner
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { eventService } from "@/services/eventService";
import { Event } from "@/types";
import { Calendar, Clock, MapPin, Eye, Plus } from "lucide-react";
import toast from "react-hot-toast";

export default function StudentEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const eventsData = await eventService.getEvents();
      setEvents(eventsData);
    } catch (error) {
      toast.error("Failed to load events");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterForEvent = async (eventId: string) => {
    try {
      await eventService.registerForEvent(eventId);
      toast.success("Successfully registered for event!");
      loadEvents();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register for event");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Events</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <div key={event._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {new Date(event.date) >= new Date() ? "Upcoming" : "Past"}
              </span>
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{event.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="h-4 w-4 mr-2" />
                {new Date(event.date).toLocaleDateString()}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2" />
                {event.time}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <MapPin className="h-4 w-4 mr-2" />
                {event.location}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">
                {event.attendees.length} attendees
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleRegisterForEvent(event._id)}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Register
                </button>
                <button
                  disabled
                  className="flex items-center px-3 py-2 border border-gray-300 text-gray-400 text-sm rounded-lg cursor-not-allowed"
                  title="View details page not implemented"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {events.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No events found.</p>
        </div>
      )}
    </div>
  );
} 
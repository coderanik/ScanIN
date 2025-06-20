"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { eventService } from "@/services/eventService";
import { Event } from "@/types";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminEventDetailPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const params = useParams();
  const { id } = params;

  useEffect(() => {
    if (typeof id === "string") {
      loadEvent(id);
    }
  }, [id]);

  const loadEvent = async (eventId: string) => {
    try {
      const eventData = await eventService.getEventById(eventId);
      setEvent(eventData);
    } catch (error) {
      toast.error("Failed to load event details");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Event not found</h2>
        <p>The event you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">{event.title}</h1>
        <p className="mt-2 text-lg text-gray-600">{event.description}</p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Event Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Calendar className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Date</p>
              <p className="font-semibold">{new Date(event.date).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Time</p>
              <p className="font-semibold">{event.time}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <MapPin className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="font-semibold">{event.location}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Users className="h-6 w-6 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Attendees</p>
              <p className="font-semibold">{event.attendees.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
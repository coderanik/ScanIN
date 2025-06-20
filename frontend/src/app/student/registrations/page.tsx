"use client";

import { useEffect, useState } from "react";
import { eventService } from "@/services/eventService";
import { Registration } from "@/types";
import Image from "next/image";

export default function StudentRegistrationsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const res = await fetch("http://localhost:5000/api/student/registrations", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await res.json();
        if (data.success) {
          setRegistrations(data.data);
        }
      } catch (error) {
        // handle error
      } finally {
        setIsLoading(false);
      }
    };
    fetchRegistrations();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">My Registrations</h1>
      {registrations.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">You have not registered for any events yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((reg) => (
            <div key={reg._id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-blue-700 mb-2">
                  {typeof reg.eventId === 'object' && 'title' in reg.eventId
                    ? reg.eventId.title
                    : 'Event'}
                </h2>
              <p className="text-gray-600 mb-1">
                {reg.eventId?.description}
              </p>
              <p className="text-gray-500 text-sm mb-1">
                {reg.eventId?.date ? new Date(reg.eventId.date).toLocaleDateString() : ""} {reg.eventId?.time}
              </p>
              <p className="text-gray-500 text-sm mb-2">
                {reg.eventId?.location}
              </p>
              {reg.qrCode ? (
                <div className="mt-4">
                  <p className="text-sm text-gray-700 mb-1">QR Code for Check-in:</p>
                  <Image src={reg.qrCode} alt="QR Code" width={120} height={120} />
                </div>
              ) : (
                <p className="text-xs text-gray-400">No QR code available.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
"use client";

import { Calendar } from "lucide-react";
import EventCard from "./event-card";

interface Event {
    id: string;
    name: string;
    description: string | null;
    date: Date;
    time: string;
    timezone: string;
    venue: string;
    address: string;
    addressUrl: string | null;
    dressCode: string | null;
}

interface EventTableProps {
    events: Event[];
    onEdit: (event: Event) => void;
}

export default function EventTable({ events, onEdit }: EventTableProps) {
    if (events.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                    No events yet
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                    Get started by creating your first event.
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    event={event}
                    onEdit={() => onEdit(event)}
                />
            ))}
        </div>
    );
}

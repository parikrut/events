"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import EventDialog from "./event-dialog";
import EventTable from "./event-table";

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

interface EventsClientProps {
    lineupId: string;
    lineupTitle: string;
    events: Event[];
}

export default function EventsClient({
    lineupId,
    lineupTitle,
    events,
}: EventsClientProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState<Event | null>(null);

    const handleEdit = (event: Event) => {
        setEditingEvent(event);
        setDialogOpen(true);
    };

    const handleCloseDialog = () => {
        setDialogOpen(false);
        setEditingEvent(null);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Events</h1>
                    <p className="text-gray-600 mt-1">{lineupTitle}</p>
                </div>
                <Button onClick={() => setDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Create Event
                </Button>
            </div>

            <EventTable events={events} onEdit={handleEdit} />

            <EventDialog
                open={dialogOpen}
                onOpenChange={handleCloseDialog}
                lineupId={lineupId}
                event={editingEvent}
            />
        </div>
    );
}

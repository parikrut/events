"use client";

import { Calendar, Clock, MapPin, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteEvent } from "@/lib/actions/event";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { format } from "date-fns";

interface EventCardProps {
    event: {
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
    };
    onEdit: () => void;
}

export default function EventCard({ event, onEdit }: EventCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${event.name}"?`)) {
            return;
        }

        setIsDeleting(true);

        try {
            const result = await deleteEvent(event.id);

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                });
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.message,
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="group relative bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {event.name}
                    </h3>
                    {event.description && (
                        <p className="text-sm text-gray-600">
                            {event.description}
                        </p>
                    )}
                    {event.dressCode && (
                        <p className="text-sm text-gray-600 mt-1">
                            Dress Code: {event.dressCode}
                        </p>
                    )}
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={onEdit}
                        className=""
                    >
                        <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className=""
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{format(new Date(event.date), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>{event.time}</span>
                </div>
                <div className="col-span-2 flex items-start gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span>{event.venue}</span>
                </div>
            </div>

            {event.addressUrl && (
                <a
                    href={event.addressUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    <Button variant="outline" className="w-full">
                        View Location
                    </Button>
                </a>
            )}
        </div>
    );
}

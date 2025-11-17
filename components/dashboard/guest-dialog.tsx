"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createGuest, updateGuest } from "@/lib/actions/guest";
import { createInvitations, syncInvitations } from "@/lib/actions/invitation";
import { getEventsByLineup } from "@/lib/actions/event";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

const guestSchema = z.object({
    fullName: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Must be a valid email").optional().or(z.literal("")),
});

type GuestFormData = z.infer<typeof guestSchema>;

interface GuestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lineupId: string;
    guest?: any;
}

export default function GuestDialog({
    open,
    onOpenChange,
    lineupId,
    guest,
}: GuestDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingEvents, setIsLoadingEvents] = useState(false);
    const [events, setEvents] = useState<any[]>([]);
    const [eventInvitations, setEventInvitations] = useState<Map<string, number>>(new Map());
    const { toast } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<GuestFormData>({
        resolver: zodResolver(guestSchema),
    });

    // Update form values when guest changes
    useEffect(() => {
        if (guest) {
            reset({
                fullName: guest.fullName,
                email: guest.email || "",
            });
            // Set event invitations based on existing invitations
            if (guest.invitations) {
                const invMap = new Map();
                guest.invitations.forEach((inv: any) => {
                    invMap.set(inv.eventId, inv.attendeeLimit || -1);
                });
                setEventInvitations(invMap);
            }
        } else {
            reset({
                fullName: "",
                email: "",
            });
            setEventInvitations(new Map());
        }
    }, [guest, reset]);

    // Fetch events when dialog opens
    useEffect(() => {
        if (open && lineupId) {
            const fetchEvents = async () => {
                setIsLoadingEvents(true);
                try {
                    const result = await getEventsByLineup(lineupId);
                    if (result.success && result.events) {
                        setEvents(result.events);
                    }
                } finally {
                    setIsLoadingEvents(false);
                }
            };
            fetchEvents();
        }
    }, [open, lineupId]);

    const onSubmit = async (data: GuestFormData) => {
        setIsLoading(true);

        try {
            let result;
            const invitations = Array.from(eventInvitations.entries()).map(([eventId, attendeeLimit]) => ({
                eventId,
                attendeeLimit,
            }));

            if (guest) {
                result = await updateGuest(guest.id, data);

                // Sync invitations for updated guest
                if (result.success) {
                    await syncInvitations({
                        guestId: guest.id,
                        invitations,
                    });
                }
            } else {
                result = await createGuest({
                    lineupId,
                    ...data,
                });

                // Create invitations for selected events
                if (result.success && result.guest && invitations.length > 0) {
                    await createInvitations({
                        guestId: result.guest.id,
                        invitations,
                    });
                }
            }

            if (result.success) {
                toast({
                    title: guest ? "Guest updated" : "Guest added",
                    description: guest
                        ? "Guest has been updated successfully."
                        : "Guest has been added successfully.",
                });
                onOpenChange(false);
                router.refresh();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Something went wrong",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to save guest",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{guest ? "Edit Guest" : "Add Guest"}</DialogTitle>
                    <DialogDescription>
                        {guest
                            ? "Update guest information below."
                            : "Add a new guest to your event lineup. All fields marked with * are required."}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
                    <div>
                        <label htmlFor="fullName" className="block text-sm font-medium mb-2">
                            Full Name *
                        </label>
                        <Input
                            id="fullName"
                            placeholder="Enter guest's full name"
                            {...register("fullName")}
                            disabled={isLoading || isLoadingEvents}
                        />
                        {errors.fullName && (
                            <p className="text-sm text-red-600 mt-1">{errors.fullName.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            The guest's full name as it will appear on invitations.
                        </p>
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email (Optional)
                        </label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="guest@example.com"
                            {...register("email")}
                            disabled={isLoading || isLoadingEvents}
                        />
                        {errors.email && (
                            <p className="text-sm text-red-600 mt-1">{errors.email.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            Email address for sending invitations. Can be added later.
                        </p>
                    </div>

                    {events.length > 0 && (
                        <div>
                            <label className="block text-sm font-medium mb-3">
                                Invite to Events
                            </label>
                            <div className="space-y-4 border rounded-lg p-4 max-h-96 overflow-y-auto">
                                {events.map((event) => (
                                    <div key={event.id} className="space-y-2 pb-3 border-b last:border-b-0 last:pb-0">
                                        <div className="flex items-start space-x-3">
                                            <Checkbox
                                                id={`event-${event.id}`}
                                                checked={eventInvitations.has(event.id)}
                                                onChange={(e) => {
                                                    const newInvitations = new Map(eventInvitations);
                                                    if (e.target.checked) {
                                                        newInvitations.set(event.id, -1);
                                                    } else {
                                                        newInvitations.delete(event.id);
                                                    }
                                                    setEventInvitations(newInvitations);
                                                }}
                                                disabled={isLoading}
                                            />
                                            <label
                                                htmlFor={`event-${event.id}`}
                                                className="text-sm cursor-pointer flex-1"
                                            >
                                                <div className="font-medium text-gray-900">{event.name}</div>
                                                <div className="text-xs text-gray-500">
                                                    {new Date(event.date).toLocaleDateString()} • {event.time}
                                                </div>
                                            </label>
                                        </div>
                                        {eventInvitations.has(event.id) && (
                                            <div className="pl-7">
                                                <label className="text-xs text-gray-700 block mb-1">
                                                    Attendee Limit for this event:
                                                </label>
                                                <Input
                                                    type="number"
                                                    placeholder="-1"
                                                    className="h-8 text-sm"
                                                    value={eventInvitations.get(event.id)}
                                                    onChange={(e) => {
                                                        const newInvitations = new Map(eventInvitations);
                                                        newInvitations.set(event.id, parseInt(e.target.value) || -1);
                                                        setEventInvitations(newInvitations);
                                                    }}
                                                    disabled={isLoading}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    -1 for no limit, or enter a positive number
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                {guest
                                    ? "Update which events this guest is invited to and set attendee limits per event."
                                    : "Select events to invite this guest to. Set attendee limits for each event individually."}
                            </p>
                        </div>
                    )}

                    {isLoadingEvents && (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                            <span className="ml-2 text-sm text-gray-600">Loading events...</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading || isLoadingEvents}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading || isLoadingEvents}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : guest ? (
                                "Update Guest"
                            ) : (
                                "Add Guest"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

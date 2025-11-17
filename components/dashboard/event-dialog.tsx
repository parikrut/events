"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createEvent, updateEvent } from "@/lib/actions/event";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

const eventSchema = z.object({
    name: z.string().min(3, "Event name must be at least 3 characters"),
    description: z.string().optional(),
    date: z.string().min(1, "Date is required"),
    time: z.string().min(1, "Time is required"),
    timezone: z.string().min(1, "Timezone is required"),
    venue: z.string().min(2, "Venue is required"),
    address: z.string().min(5, "Address is required"),
    addressUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    dressCode: z.string().optional(),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lineupId: string;
    event?: any;
}

export default function EventDialog({
    open,
    onOpenChange,
    lineupId,
    event,
}: EventDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
    });

    // Update form values when event changes
    useEffect(() => {
        if (event) {
            reset({
                name: event.name,
                description: event.description || "",
                date: new Date(event.date).toISOString().split("T")[0],
                time: event.time,
                timezone: event.timezone,
                venue: event.venue,
                address: event.address,
                addressUrl: event.addressUrl || "",
                dressCode: event.dressCode || "",
            });
        } else {
            reset({
                name: "",
                description: "",
                date: "",
                time: "",
                timezone: "America/New_York",
                venue: "",
                address: "",
                addressUrl: "",
                dressCode: "",
            });
        }
    }, [event, reset]); const onSubmit = async (data: EventFormData) => {
        setIsLoading(true);

        try {
            const eventDate = new Date(data.date + "T00:00:00");

            const result = event
                ? await updateEvent(event.id, {
                    ...data,
                    date: eventDate,
                    addressUrl: data.addressUrl || undefined,
                })
                : await createEvent(lineupId, {
                    ...data,
                    date: eventDate,
                    addressUrl: data.addressUrl || undefined,
                });

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                });
                reset();
                onOpenChange(false);
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
                description: "Something went wrong. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{event ? "Edit Event" : "Create Event"}</DialogTitle>
                    <DialogDescription>
                        {event
                            ? "Update event details"
                            : "Add a new event to your lineup"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                            Event Name *
                        </label>
                        <Input
                            id="name"
                            placeholder="e.g., Wedding Ceremony, Reception Dinner"
                            {...register("name")}
                            disabled={isLoading}
                        />
                        {errors.name && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.name.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium mb-1.5"
                        >
                            Description
                        </label>
                        <textarea
                            id="description"
                            rows={2}
                            placeholder="Optional description..."
                            {...register("description")}
                            disabled={isLoading}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="date"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Date *
                            </label>
                            <Input
                                id="date"
                                type="date"
                                {...register("date")}
                                disabled={isLoading}
                            />
                            {errors.date && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.date.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="time"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Time *
                            </label>
                            <Input
                                id="time"
                                type="time"
                                {...register("time")}
                                disabled={isLoading}
                            />
                            {errors.time && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.time.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="timezone"
                            className="block text-sm font-medium mb-1.5"
                        >
                            Timezone *
                        </label>
                        <select
                            id="timezone"
                            {...register("timezone")}
                            disabled={isLoading}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="America/New_York">
                                Eastern Time (ET)
                            </option>
                            <option value="America/Chicago">Central Time (CT)</option>
                            <option value="America/Denver">
                                Mountain Time (MT)
                            </option>
                            <option value="America/Los_Angeles">
                                Pacific Time (PT)
                            </option>
                            <option value="Asia/Kolkata">India (IST)</option>
                            <option value="Europe/London">London (GMT)</option>
                            <option value="Australia/Sydney">Sydney (AEDT)</option>
                        </select>
                        {errors.timezone && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.timezone.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label htmlFor="venue" className="block text-sm font-medium mb-1.5">
                            Venue *
                        </label>
                        <Input
                            id="venue"
                            placeholder="e.g., Grand Ballroom, City Hall"
                            {...register("venue")}
                            disabled={isLoading}
                        />
                        {errors.venue && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.venue.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="address"
                            className="block text-sm font-medium mb-1.5"
                        >
                            Address *
                        </label>
                        <Input
                            id="address"
                            placeholder="123 Main St, City, State 12345"
                            {...register("address")}
                            disabled={isLoading}
                        />
                        {errors.address && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.address.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="addressUrl"
                            className="block text-sm font-medium mb-1.5"
                        >
                            Google Maps URL
                        </label>
                        <Input
                            id="addressUrl"
                            type="url"
                            placeholder="https://maps.google.com/..."
                            {...register("addressUrl")}
                            disabled={isLoading}
                        />
                        {errors.addressUrl && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.addressUrl.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label
                            htmlFor="dressCode"
                            className="block text-sm font-medium mb-1.5"
                        >
                            Dress Code
                        </label>
                        <Input
                            id="dressCode"
                            placeholder="e.g., Formal, Casual, Traditional"
                            {...register("dressCode")}
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading
                                ? event
                                    ? "Updating..."
                                    : "Creating..."
                                : event
                                    ? "Update Event"
                                    : "Create Event"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

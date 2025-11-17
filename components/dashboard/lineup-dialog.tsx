"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { createLineup, updateLineup } from "@/lib/actions/lineup";
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

const lineupSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    organizerName: z.string().min(2, "Organizer name is required"),
    organizerEmail: z.string().email("Please enter a valid email"),
    groomName: z.string().min(2, "Groom name is required"),
    brideName: z.string().min(2, "Bride name is required"),
    description: z.string().min(10, "Description must be at least 10 characters"),
});

type LineupFormData = z.infer<typeof lineupSchema>;

interface LineupDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lineup?: any; // Existing lineup for editing
}

export default function LineupDialog({
    open,
    onOpenChange,
    lineup,
}: LineupDialogProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<LineupFormData>({
        resolver: zodResolver(lineupSchema),
    });

    // Update form values when lineup changes
    useEffect(() => {
        if (lineup) {
            reset({
                title: lineup.title,
                organizerName: lineup.organizerName,
                organizerEmail: lineup.organizerEmail,
                groomName: lineup.groomName || "",
                brideName: lineup.brideName || "",
                description: lineup.description || "",
            });
        } else {
            reset({
                title: "",
                organizerName: "",
                organizerEmail: "",
                groomName: "",
                brideName: "",
                description: "",
            });
        }
    }, [lineup, reset]);

    const onSubmit = async (data: LineupFormData) => {
        setIsLoading(true);

        try {
            // Add eventCategory as "wedding" by default
            const lineupData = {
                ...data,
                eventCategory: "wedding",
            };

            const result = lineup
                ? await updateLineup(lineup.id, lineupData)
                : await createLineup(lineupData);

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
                    <DialogTitle>
                        {lineup ? "Edit Event Lineup" : "Create Event Lineup"}
                    </DialogTitle>
                    <DialogDescription>
                        {lineup
                            ? "Update your event lineup details"
                            : "Create a new event lineup to start managing your events"}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium mb-1.5">
                            Event Title *
                        </label>
                        <Input
                            id="title"
                            placeholder="e.g., Sarah & John's Wedding"
                            {...register("title")}
                            disabled={isLoading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This will be displayed as the main heading on your RSVP page
                        </p>
                        {errors.title && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.title.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="organizerName"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Organizer Name *
                            </label>
                            <Input
                                id="organizerName"
                                placeholder="John Doe"
                                {...register("organizerName")}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Used in email communications to guests
                            </p>
                            {errors.organizerName && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.organizerName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="organizerEmail"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Organizer Email *
                            </label>
                            <Input
                                id="organizerEmail"
                                type="email"
                                placeholder="john@example.com"
                                {...register("organizerEmail")}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                RSVP notifications will be sent here
                            </p>
                            {errors.organizerEmail && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.organizerEmail.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label
                                htmlFor="groomName"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Groom Name *
                            </label>
                            <Input
                                id="groomName"
                                placeholder="John Smith"
                                {...register("groomName")}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Displayed on the RSVP page header
                            </p>
                            {errors.groomName && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.groomName.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label
                                htmlFor="brideName"
                                className="block text-sm font-medium mb-1.5"
                            >
                                Bride Name *
                            </label>
                            <Input
                                id="brideName"
                                placeholder="Sarah Johnson"
                                {...register("brideName")}
                                disabled={isLoading}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Displayed on the RSVP page header
                            </p>
                            {errors.brideName && (
                                <p className="text-sm text-red-500 mt-1">
                                    {errors.brideName.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="description"
                            className="block text-sm font-medium mb-1.5"
                        >
                            Description *
                        </label>
                        <textarea
                            id="description"
                            rows={3}
                            placeholder="Share details about your wedding celebration..."
                            {...register("description")}
                            disabled={isLoading}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            This welcome message will be shown to guests on the RSVP form
                        </p>
                        {errors.description && (
                            <p className="text-sm text-red-500 mt-1">
                                {errors.description.message}
                            </p>
                        )}
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
                                ? lineup
                                    ? "Updating..."
                                    : "Creating..."
                                : lineup
                                    ? "Update Lineup"
                                    : "Create Lineup"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

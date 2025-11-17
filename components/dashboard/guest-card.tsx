"use client";

import { Mail, Users, Edit, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteGuest } from "@/lib/actions/guest";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface GuestCardProps {
    guest: {
        id: string;
        fullName: string;
        email: string | null;
        invitations?: Array<{
            event?: {
                name: string;
                id: string;
            };
            attendeeLimit: number;
        }>;
        responses?: any[];
    };
    onEdit: () => void;
}

export default function GuestCard({ guest, onEdit }: GuestCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${guest.fullName}"?`)) {
            return;
        }

        setIsDeleting(true);

        try {
            const result = await deleteGuest(guest.id);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Guest deleted successfully",
                });
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to delete guest",
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

    const invitationCount = guest.invitations?.length || 0;
    const responseCount = guest.responses?.length || 0;

    return (
        <div className="group relative bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {guest.fullName}
                    </h3>
                    {guest.email && (
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            {guest.email}
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

            <div className="space-y-3">
                {invitationCount > 0 ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>Event Invitations:</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {guest.invitations?.map((invitation) => (
                                <div
                                    key={invitation.event?.id}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-sm"
                                >
                                    <span className="font-medium text-blue-900">
                                        {invitation.event?.name || "Unknown Event"}
                                    </span>
                                    <span className="text-blue-600">·</span>
                                    <span className="text-blue-700 text-xs">
                                        {invitation.attendeeLimit === -1
                                            ? "No limit"
                                            : `Max ${invitation.attendeeLimit}`}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-sm text-gray-500 italic">
                        No event invitations yet
                    </div>
                )}

                {responseCount > 0 && (
                    <div className="text-sm text-gray-600 pt-2 border-t">
                        <span className="font-medium">{responseCount}</span> Response
                        {responseCount !== 1 ? "s" : ""}
                    </div>
                )}
            </div>
        </div>
    );
}

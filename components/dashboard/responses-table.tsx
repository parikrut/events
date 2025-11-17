"use client";

import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Users, CheckCircle, XCircle } from "lucide-react";
import { deleteResponse } from "@/lib/actions/response";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface ResponsesTableProps {
    responses: any[];
    lineupId: string;
}

export default function ResponsesTable({ responses, lineupId }: ResponsesTableProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (responseId: string, guestName: string) => {
        if (!confirm(`Delete RSVP response from "${guestName}"?`)) {
            return;
        }

        setDeletingId(responseId);

        try {
            const result = await deleteResponse(responseId);

            if (result.success) {
                toast({
                    title: "Success",
                    description: "Response deleted successfully",
                });
                router.refresh();
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: result.error || "Failed to delete response",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong",
            });
        } finally {
            setDeletingId(null);
        }
    };

    if (responses.length === 0) {
        return (
            <div className="text-center py-12 bg-white rounded-lg border">
                <Users className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-lg font-semibold text-gray-900">No Responses Yet</h3>
                <p className="mt-2 text-sm text-gray-500">
                    RSVP responses from guests will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Guest</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Event</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attendees</TableHead>
                        <TableHead>Responded At</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {responses.map((response) => (
                        <TableRow key={response.id}>
                            <TableCell className="font-medium">
                                {response.guest.fullName}
                            </TableCell>
                            <TableCell>
                                {response.guest.email || (
                                    <span className="text-gray-400 italic">No email</span>
                                )}
                            </TableCell>
                            <TableCell>{response.event.name}</TableCell>
                            <TableCell>
                                {new Date(response.event.date).toLocaleDateString()}
                                <span className="text-gray-500 text-sm ml-2">
                                    {response.event.time}
                                </span>
                            </TableCell>
                            <TableCell>
                                {response.isAttending ? (
                                    <div className="flex items-center gap-1.5 text-green-600">
                                        <CheckCircle className="h-4 w-4" />
                                        <span className="font-medium">Attending</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-1.5 text-red-600">
                                        <XCircle className="h-4 w-4" />
                                        <span className="font-medium">Not Attending</span>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                {response.isAttending ? (
                                    <span className="font-medium">{response.attendeeCount}</span>
                                ) : (
                                    <span className="text-gray-400">-</span>
                                )}
                            </TableCell>
                            <TableCell className="text-sm text-gray-500">
                                {new Date(response.createdAt).toLocaleDateString()}{" "}
                                {new Date(response.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </TableCell>
                            <TableCell className="text-right">
                                <Button
                                    variant="ghost"
                                    onClick={() => handleDelete(response.id, response.guest.fullName)}
                                    disabled={deletingId === response.id}
                                >
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                </Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

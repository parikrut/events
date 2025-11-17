"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import ResponsesTable from "@/components/dashboard/responses-table";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface ResponsesClientProps {
    lineup: {
        id: string;
        title: string;
        slug: string;
    };
    responses: any[];
}

export default function ResponsesClient({ lineup, responses }: ResponsesClientProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleExportAll = () => {
        if (responses.length === 0) {
            toast({
                title: "No responses to export",
                description: "There are no RSVP responses yet.",
                variant: "destructive",
            });
            return;
        }

        // Create export data
        const exportData = responses.map((response) => ({
            "Guest Name": response.guest.fullName,
            "Email": response.guest.email || "",
            "Event": response.event.name,
            "Event Date": new Date(response.event.date).toLocaleDateString(),
            "Event Time": response.event.time,
            "Attending": response.isAttending ? "Yes" : "No",
            "Attendee Count": response.attendeeCount,
            "Responded At": new Date(response.createdAt).toLocaleString(),
        }));

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Responses");

        // Download file
        const fileName = `${lineup.slug}-responses-${new Date().toISOString().split("T")[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast({
            title: "Export successful",
            description: `${responses.length} responses exported successfully.`,
        });
    };

    const handleDeleteAll = async () => {
        if (responses.length === 0) {
            toast({
                title: "No responses to delete",
                description: "There are no RSVP responses in this lineup.",
            });
            return;
        }

        if (
            !confirm(
                `Are you sure you want to delete all ${responses.length} responses? This action cannot be undone.`
            )
        ) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch("/api/responses/delete-all", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lineupId: lineup.id,
                }),
            });

            const result = await response.json();

            if (result.success) {
                toast({
                    title: "Success",
                    description: `Deleted ${result.count} responses successfully.`,
                });
                router.refresh();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete responses",
                    variant: "destructive",
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const attendingCount = responses.filter((r) => r.isAttending).length;
    const notAttendingCount = responses.filter((r) => r.isAttending === false).length;
    const totalAttendees = responses
        .filter((r) => r.isAttending)
        .reduce((sum, r) => sum + r.attendeeCount, 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">RSVP Responses</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage responses for {lineup.title}
                    </p>
                </div>
                <div className="flex gap-3">
                    {responses.length > 0 && (
                        <>
                            <Button onClick={handleExportAll} variant="outline">
                                <Download className="h-4 w-4 mr-2" />
                                Export All
                            </Button>
                            <Button
                                onClick={handleDeleteAll}
                                variant="outline"
                                disabled={isDeleting}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete All
                            </Button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            {responses.length > 0 && (
                <div className="grid gap-4 md:grid-cols-4">
                    <div className="bg-white border rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500">Total Responses</div>
                        <div className="text-2xl font-bold mt-1">{responses.length}</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500">Attending</div>
                        <div className="text-2xl font-bold mt-1 text-green-600">{attendingCount}</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500">Not Attending</div>
                        <div className="text-2xl font-bold mt-1 text-red-600">{notAttendingCount}</div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                        <div className="text-sm font-medium text-gray-500">Total Attendees</div>
                        <div className="text-2xl font-bold mt-1 text-blue-600">{totalAttendees}</div>
                    </div>
                </div>
            )}

            <ResponsesTable responses={responses} lineupId={lineup.id} />
        </div>
    );
}

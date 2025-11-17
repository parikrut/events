"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Upload, Download, Trash2 } from "lucide-react";
import GuestTable from "@/components/dashboard/guest-table";
import GuestDialog from "@/components/dashboard/guest-dialog";
import BulkImportGuestDialog from "@/components/dashboard/bulk-import-guest-dialog";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import * as XLSX from "xlsx";

interface GuestsClientProps {
    lineup: {
        id: string;
        title: string;
        slug: string;
    };
    guests: any[];
    events: any[];
}

export default function GuestsClient({ lineup, guests, events }: GuestsClientProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleExportAll = () => {
        if (guests.length === 0) {
            toast({
                title: "No guests to export",
                description: "Add some guests first before exporting.",
                variant: "destructive",
            });
            return;
        }

        // Create export data with guest names and event limits
        const exportData: any[] = guests.map((guest) => {
            const row: any = {
                "Guest Name": guest.fullName,
                "Email": guest.email || "",
            };

            // Add event columns with attendee limits
            events.forEach((event) => {
                const invitation = guest.invitations?.find(
                    (inv: any) => inv.event?.slug === event.slug
                );
                row[event.name] = invitation ? invitation.attendeeLimit : 0;
            });

            return row;
        });

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(exportData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Guests");

        // Download file
        const fileName = `${lineup.slug}-guests-${new Date().toISOString().split("T")[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);

        toast({
            title: "Export successful",
            description: `${guests.length} guests exported successfully.`,
        });
    };

    const handleDeleteAll = async () => {
        if (guests.length === 0) {
            toast({
                title: "No guests to delete",
                description: "There are no guests in this lineup.",
            });
            return;
        }

        if (
            !confirm(
                `Are you sure you want to delete all ${guests.length} guests? This action cannot be undone.`
            )
        ) {
            return;
        }

        setIsDeleting(true);

        try {
            const response = await fetch("/api/guests/delete-all", {
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
                    description: `Deleted ${result.count} guests successfully.`,
                });
                router.refresh();
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete guests",
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Guests</h1>
                    <p className="text-muted-foreground mt-2">
                        Manage your guest list for {lineup.title}
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button onClick={() => setIsDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Guest
                    </Button>
                    <Button
                        onClick={() => setIsBulkImportOpen(true)}
                        variant="outline"
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Import Guests
                    </Button>
                    {guests.length > 0 && (
                        <>
                            <Button
                                onClick={handleExportAll}
                                variant="outline"
                            >
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

            <GuestTable guests={guests} lineupId={lineup.id} />

            <GuestDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                lineupId={lineup.id}
            />

            <BulkImportGuestDialog
                open={isBulkImportOpen}
                onOpenChange={setIsBulkImportOpen}
                lineupId={lineup.id}
                events={events}
            />
        </div>
    );
}

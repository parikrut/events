"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Upload, Download, Loader2, CheckCircle, XCircle } from "lucide-react";
import * as XLSX from "xlsx";

interface BulkImportGuestDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lineupId: string;
    events: Array<{ id: string; name: string; slug: string }>;
}

interface GuestImportData {
    guestName: string;
    email?: string;
    eventLimits: { [eventSlug: string]: number };
}

export default function BulkImportGuestDialog({
    open,
    onOpenChange,
    lineupId,
    events,
}: BulkImportGuestDialogProps) {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
    const [resultMessage, setResultMessage] = useState("");
    const { toast } = useToast();
    const router = useRouter();

    const downloadSampleExcel = () => {
        // Create sample data with per-event attendee limits
        const sampleData: any[] = [
            {
                "Guest Name": "John Doe",
                "Email": "john@example.com",
                ...events.reduce((acc, event) => {
                    acc[event.name] = "-1"; // -1 for no limit
                    return acc;
                }, {} as any),
            },
            {
                "Guest Name": "Jane Smith",
                "Email": "",
                ...events.reduce((acc, event, index) => {
                    // Example: Different limits per event, with 0 for not invited
                    acc[event.name] = index === 0 ? "2" : index === 1 ? "0" : "-1";
                    return acc;
                }, {} as any),
            },
            {
                "Guest Name": "Bob Wilson",
                "Email": "bob@example.com",
                ...events.reduce((acc, event, index) => {
                    // Example: Mix of limits
                    acc[event.name] = index === 0 ? "1" : index === 1 ? "5" : "0";
                    return acc;
                }, {} as any),
            },
        ];

        // Create worksheet
        const ws = XLSX.utils.json_to_sheet(sampleData);

        // Create workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Guests");

        // Add instructions sheet
        const instructionsData = [
            { Column: "Guest Name", Description: "Required. Full name of the guest" },
            { Column: "Email", Description: "Optional. Email address of the guest (can be left empty)" },
            { Column: "Event Columns", Description: "Enter attendee limit for each event:" },
            { Column: "-1", Description: "Invited with NO LIMIT (unlimited guests)" },
            { Column: "0", Description: "NOT INVITED to this event" },
            { Column: "1, 2, 3...", Description: "Invited with SPECIFIC LIMIT (e.g., 2 means max 2 guests)" },
            { Column: "Example 1", Description: "John with sangeet=2, reception=-1 means: sangeet max 2 people, reception unlimited" },
            { Column: "Example 2", Description: "Jane with sangeet=0, reception=1 means: NOT invited to sangeet, reception max 1 person" },
        ];
        const wsInstructions = XLSX.utils.json_to_sheet(instructionsData);
        XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

        // Download file
        XLSX.writeFile(wb, "guest_import_template.xlsx");

        toast({
            title: "Sample downloaded",
            description: "Sample Excel file has been downloaded successfully.",
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setUploadStatus("processing");
        setProgress(0);

        try {
            // Read file
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            if (jsonData.length === 0) {
                throw new Error("Excel file is empty");
            }

            setProgress(20);

            // Parse data
            const guestsToImport: GuestImportData[] = [];

            for (const row of jsonData) {
                const rowData: any = row;
                const guestName = rowData["Guest Name"];
                const email = rowData["Email"] || "";

                if (!guestName) continue;

                const eventLimits: { [eventSlug: string]: number } = {};

                // Check each event column for numeric limits
                events.forEach((event) => {
                    const cellValue = rowData[event.name];
                    if (cellValue !== undefined && cellValue !== null && cellValue !== "") {
                        const limit = parseInt(cellValue.toString());
                        // Only add if valid number and not 0 (0 means no invitation)
                        if (!isNaN(limit) && limit !== 0) {
                            eventLimits[event.slug] = limit;
                        }
                    }
                });

                guestsToImport.push({
                    guestName,
                    email: email.trim() || undefined,
                    eventLimits,
                });
            }

            setProgress(40);

            // Send to server for processing
            const response = await fetch("/api/guests/bulk-import", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    lineupId,
                    guests: guestsToImport,
                    events,
                }),
            });

            setProgress(80);

            const result = await response.json();

            if (result.success) {
                setProgress(100);
                setUploadStatus("success");
                setResultMessage(`Successfully imported ${result.count} guests`);

                toast({
                    title: "Import successful",
                    description: `${result.count} guests have been imported successfully.`,
                });

                setTimeout(() => {
                    router.refresh();
                    onOpenChange(false);
                    setUploadStatus("idle");
                    setProgress(0);
                }, 2000);
            } else {
                throw new Error(result.error || "Import failed");
            }
        } catch (error: any) {
            setUploadStatus("error");
            setResultMessage(error.message || "Failed to import guests");
            toast({
                title: "Import failed",
                description: error.message || "Something went wrong",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Bulk Import Guests</DialogTitle>
                    <DialogDescription>
                        Upload an Excel file to import multiple guests at once. Download the sample template to get started.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {/* Download Sample */}
                    <div className="border rounded-lg p-4 bg-blue-50">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <h3 className="font-medium text-gray-900 mb-1">Step 1: Download Sample Template</h3>
                                <p className="text-sm text-gray-600">
                                    Download the Excel template with your event columns pre-filled.
                                </p>
                            </div>
                            <Button onClick={downloadSampleExcel} variant="outline" className="gap-2">
                                <Download className="h-4 w-4" />
                                Download
                            </Button>
                        </div>
                    </div>

                    {/* Upload File */}
                    <div className="border rounded-lg p-4">
                        <h3 className="font-medium text-gray-900 mb-3">Step 2: Upload Filled Template</h3>

                        {uploadStatus === "idle" && (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                                <span className="text-sm font-medium text-gray-700 mb-1">
                                    Click to upload or drag and drop
                                </span>
                                <span className="text-xs text-gray-500">Excel file (.xlsx, .xls)</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileUpload}
                                    disabled={isProcessing}
                                />
                            </label>
                        )}

                        {uploadStatus === "processing" && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-center gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                                    <span className="text-sm text-gray-700">Processing import...</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className="text-xs text-center text-gray-500">{progress}% complete</p>
                            </div>
                        )}

                        {uploadStatus === "success" && (
                            <div className="flex flex-col items-center justify-center py-6">
                                <CheckCircle className="h-12 w-12 text-green-600 mb-3" />
                                <span className="text-sm font-medium text-green-700">{resultMessage}</span>
                            </div>
                        )}

                        {uploadStatus === "error" && (
                            <div className="space-y-4">
                                <div className="flex flex-col items-center justify-center py-6">
                                    <XCircle className="h-12 w-12 text-red-600 mb-3" />
                                    <span className="text-sm font-medium text-red-700">{resultMessage}</span>
                                </div>
                                <Button
                                    onClick={() => {
                                        setUploadStatus("idle");
                                        setResultMessage("");
                                    }}
                                    variant="outline"
                                    className="w-full"
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Instructions */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Quick Guide:</h4>
                        <ul className="text-xs text-gray-600 space-y-1.5 list-disc list-inside">
                            <li><strong>Guest Name</strong>: Required - Full name of the guest</li>
                            <li><strong>Email</strong>: Optional - Guest's email address (can be left empty)</li>
                            <li><strong>Event Columns</strong>: Enter a number for each event:
                                <ul className="ml-6 mt-1 space-y-0.5 list-circle">
                                    <li><strong>-1</strong> = Invited with unlimited guests</li>
                                    <li><strong>0</strong> = NOT invited to this event</li>
                                    <li><strong>1, 2, 3...</strong> = Invited with max limit (e.g., 2 = max 2 guests)</li>
                                </ul>
                            </li>
                            <li><strong>Examples</strong>:
                                <ul className="ml-6 mt-1 space-y-0.5 list-circle">
                                    <li>sangeet=2, reception=-1 → max 2 at sangeet, unlimited at reception</li>
                                    <li>sangeet=0, reception=1 → not invited to sangeet, max 1 at reception</li>
                                </ul>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isProcessing}
                    >
                        Close
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

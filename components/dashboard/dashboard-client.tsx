"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import LineupCard from "@/components/dashboard/lineup-card";
import LineupDialog from "@/components/dashboard/lineup-dialog";

interface DashboardClientProps {
    lineups: any[];
}

export default function DashboardClient({ lineups }: DashboardClientProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingLineup, setEditingLineup] = useState<any>(null);

    const handleEdit = (lineup: any) => {
        setEditingLineup(lineup);
        setDialogOpen(true);
    };

    const handleClose = () => {
        setDialogOpen(false);
        // Delay clearing the editing lineup to allow dialog to close smoothly
        setTimeout(() => setEditingLineup(null), 300);
    };

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Event Lineups</h1>
                    <p className="mt-1 text-gray-600">
                        Manage your events and guest lists
                    </p>
                </div>
                <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Lineup
                </Button>
            </div>

            {lineups.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                    <div className="max-w-md mx-auto">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            No event lineups yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Get started by creating your first event lineup
                        </p>
                        <Button onClick={() => setDialogOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create Your First Lineup
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {lineups.map((lineup) => (
                        <LineupCard
                            key={lineup.id}
                            lineup={lineup}
                            onEdit={() => handleEdit(lineup)}
                        />
                    ))}
                </div>
            )}

            <LineupDialog
                open={dialogOpen}
                onOpenChange={handleClose}
                lineup={editingLineup}
            />
        </>
    );
}

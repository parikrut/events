"use client";

import { useState } from "react";
import GuestCard from "./guest-card";
import GuestDialog from "./guest-dialog";

interface Guest {
    id: string;
    fullName: string;
    email: string | null;
    attendeeLimit: number;
    invitations?: any[];
    responses?: any[];
}

interface GuestTableProps {
    guests: Guest[];
    lineupId: string;
}

export default function GuestTable({ guests, lineupId }: GuestTableProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedGuest, setSelectedGuest] = useState<Guest | undefined>(undefined);

    const handleEdit = (guest: Guest) => {
        setSelectedGuest(guest);
        setIsDialogOpen(true);
    };

    const handleDialogClose = () => {
        setIsDialogOpen(false);
        setSelectedGuest(undefined);
    };

    if (guests.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500">No guests added yet. Start by adding your first guest!</p>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {guests.map((guest) => (
                    <GuestCard
                        key={guest.id}
                        guest={guest}
                        onEdit={() => handleEdit(guest)}
                    />
                ))}
            </div>

            <GuestDialog
                open={isDialogOpen}
                onOpenChange={handleDialogClose}
                lineupId={lineupId}
                guest={selectedGuest}
            />
        </>
    );
}

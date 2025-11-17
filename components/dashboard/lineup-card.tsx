"use client";

import Link from "next/link";
import { Calendar, Users, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteLineup } from "@/lib/actions/lineup";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface LineupCardProps {
    lineup: {
        id: string;
        title: string;
        slug: string;
        eventCategory: string;
        groomName: string | null;
        brideName: string | null;
        eventCount: number;
        guestCount: number;
    };
    onEdit: () => void;
}

export default function LineupCard({ lineup, onEdit }: LineupCardProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this event lineup?")) {
            return;
        }

        setIsDeleting(true);

        try {
            const result = await deleteLineup(lineup.id);

            if (result.success) {
                toast({
                    title: "Success",
                    description: result.message,
                });
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
                description: "Something went wrong",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="group relative bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {lineup.title}
                    </h3>
                    {lineup.groomName && lineup.brideName && (
                        <p className="text-sm text-gray-600">
                            {lineup.groomName} & {lineup.brideName}
                        </p>
                    )}
                    <span className="inline-block mt-2 text-xs font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        {lineup.eventCategory}
                    </span>
                </div>

                <div className="flex gap-2">
                    <Button
                        variant="ghost"
                        onClick={onEdit}
                        className=" "
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

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{lineup.eventCount} events</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{lineup.guestCount} guests</span>
                </div>
            </div>

            <Link href={`/dashboard/${lineup.id}`}>
                <Button className="w-full">Manage Events</Button>
            </Link>
        </div>
    );
}

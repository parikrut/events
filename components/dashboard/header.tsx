"use client";

import { logoutHost } from "@/lib/actions/auth";
import { getLineupById } from "@/lib/actions/lineup";
import { LogOut, User, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface HeaderProps {
    hostName: string;
    hostEmail: string;
}

export default function Header({ hostName, hostEmail }: HeaderProps) {
    const { toast } = useToast();
    const pathname = usePathname();
    const [lineupData, setLineupData] = useState<{ slug: string; title: string } | null>(null);

    const initials = hostName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    useEffect(() => {
        const lineupId = pathname?.split("/")[2];

        if (lineupId && lineupId !== "profile") {
            getLineupById(lineupId).then((result) => {
                if (result.success && result.lineup) {
                    setLineupData({
                        slug: result.lineup.slug,
                        title: result.lineup.title,
                    });
                } else {
                    setLineupData(null);
                }
            });
        } else {
            setLineupData(null);
        }
    }, [pathname]);

    const copyRsvpLink = () => {
        if (!lineupData) return;

        const rsvpUrl = `${window.location.origin}/events/${lineupData.slug}`;
        navigator.clipboard.writeText(rsvpUrl);

        toast({
            title: "RSVP Link Copied!",
            description: `Link copied to clipboard for ${lineupData.title}`,
        });
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-white px-6">
            <div className="flex-1">
                {lineupData && (
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-gray-900">{lineupData.title}</h2>
                        <Button
                            variant="outline"
                            onClick={copyRsvpLink}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs"
                        >
                            <LinkIcon className="h-3.5 w-3.5" />
                            Copy RSVP Link
                        </Button>
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-blue-500 text-white text-sm">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left">
                                <div className="text-sm font-medium">{hostName}</div>
                                <div className="text-xs text-gray-500">{hostEmail}</div>
                            </div>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuItem className="cursor-pointer">
                            <User className="mr-2 h-4 w-4" />
                            <span>Profile</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            className="cursor-pointer text-red-600"
                            onClick={() => logoutHost()}
                        >
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}

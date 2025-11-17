"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Calendar, Users, BarChart3 } from "lucide-react";

export default function Sidebar() {
    const pathname = usePathname();
    const lineupId = pathname?.split("/")[2];

    const navigation = [
        {
            name: "Event Lineups",
            href: "/dashboard",
            icon: LayoutGrid,
            current: pathname === "/dashboard",
        },
    ];

    // Add lineup-specific navigation if we're in a lineup
    if (lineupId && lineupId !== "profile") {
        navigation.push(
            {
                name: "Events",
                href: `/dashboard/${lineupId}`,
                icon: Calendar,
                current: pathname === `/dashboard/${lineupId}`,
            },
            {
                name: "Guests",
                href: `/dashboard/${lineupId}/guests`,
                icon: Users,
                current: pathname === `/dashboard/${lineupId}/guests`,
            },
            {
                name: "Responses",
                href: `/dashboard/${lineupId}/responses`,
                icon: BarChart3,
                current: pathname === `/dashboard/${lineupId}/responses`,
            }
        );
    }

    return (
        <div className="flex h-full w-64 flex-col bg-white border-r">
            {/* Logo */}
            <div className="flex h-16 items-center px-6 border-b">
                <Link href="/dashboard" className="flex items-center">
                    <span className="text-xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">
                        Event Manager
                    </span>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1 px-3 py-4">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                                flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors
                                ${item.current
                                    ? "bg-blue-50 text-blue-600"
                                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                                }
                            `}
                        >
                            <Icon className="h-5 w-5" />
                            {item.name}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}

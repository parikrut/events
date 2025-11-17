import { getCurrentHost } from "@/lib/actions/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/dashboard/sidebar";
import Header from "@/components/dashboard/header";
import { Toaster } from "@/components/ui/toaster";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const host = await getCurrentHost();

    if (!host) {
        redirect("/auth/login");
    }

    return (
        <div className="flex h-screen overflow-hidden bg-gray-50">
            {/* Sidebar */}
            <Sidebar />

            {/* Main content */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* Header */}
                <Header hostName={host.name} hostEmail={host.email} />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto p-6">{children}</main>
            </div>

            <Toaster />
        </div>
    );
}

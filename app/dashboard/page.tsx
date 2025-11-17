import { getMyLineups } from "@/lib/actions/lineup";
import DashboardClient from "@/components/dashboard/dashboard-client";

export default async function DashboardPage() {
    const { lineups } = await getMyLineups();

    return <DashboardClient lineups={lineups} />;
}

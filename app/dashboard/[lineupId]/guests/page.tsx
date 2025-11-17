import { getSessionWithValidation } from "@/lib/session";
import { getLineupById } from "@/lib/actions/lineup";
import { getGuestsByLineup } from "@/lib/actions/guest";
import { getEventsSummaryByLineup } from "@/lib/actions/event";
import { redirect } from "next/navigation";
import GuestsClient from "./guests-client";

interface GuestsPageProps {
    params: Promise<{ lineupId: string }>;
}

export default async function GuestsPage({ params }: GuestsPageProps) {
    const { lineupId } = await params;
    const session = await getSessionWithValidation();

    if (!session) {
        redirect("/auth/login");
    }

    // Get lineup to verify ownership
    const lineupResult = await getLineupById(lineupId);

    if (!lineupResult.success || !lineupResult.lineup) {
        redirect("/dashboard");
    }

    // Verify user owns this lineup
    if (lineupResult.lineup.hostId !== session.hostId) {
        redirect("/dashboard");
    }

    // Get guests for this lineup
    const guestsResult = await getGuestsByLineup(lineupId);

    // Get events for this lineup
    const eventsResult = await getEventsSummaryByLineup(lineupId);

    return (
        <GuestsClient
            lineup={lineupResult.lineup}
            guests={guestsResult.guests || []}
            events={eventsResult.events || []}
        />
    );
}

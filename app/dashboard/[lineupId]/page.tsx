import { notFound } from "next/navigation";
import { getLineupById } from "@/lib/actions/lineup";
import { getEventsByLineup } from "@/lib/actions/event";
import EventsClient from "@/components/dashboard/events-client";

export default async function EventsPage({
    params,
}: {
    params: Promise<{ lineupId: string }>;
}) {
    const { lineupId } = await params;

    const lineupResult = await getLineupById(lineupId);

    if (!lineupResult.success || !lineupResult.lineup) {
        notFound();
    }

    const eventsResult = await getEventsByLineup(lineupId);

    if (!eventsResult.success) {
        notFound();
    }

    return (
        <EventsClient
            lineupId={lineupId}
            lineupTitle={lineupResult.lineup.title}
            events={eventsResult.events || []}
        />
    );
}

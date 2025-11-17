import { getSessionWithValidation } from "@/lib/session";
import { getLineupById } from "@/lib/actions/lineup";
import { getResponsesByLineup } from "@/lib/actions/response";
import { redirect } from "next/navigation";
import ResponsesClient from "./responses-client";

interface ResponsesPageProps {
    params: Promise<{ lineupId: string }>;
}

export default async function ResponsesPage({ params }: ResponsesPageProps) {
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

    // Get responses for this lineup
    const responsesResult = await getResponsesByLineup(lineupId);

    return (
        <ResponsesClient
            lineup={lineupResult.lineup}
            responses={responsesResult.responses || []}
        />
    );
}

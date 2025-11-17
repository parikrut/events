import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json(
                { success: false, error: "Not authenticated" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { lineupId } = body;

        if (!lineupId) {
            return NextResponse.json(
                { success: false, error: "Invalid request data" },
                { status: 400 }
            );
        }

        // Verify lineup ownership
        const lineup = await prisma.eventLineup.findFirst({
            where: {
                id: lineupId,
                hostId: session.hostId,
            },
        });

        if (!lineup) {
            return NextResponse.json(
                { success: false, error: "Lineup not found" },
                { status: 404 }
            );
        }

        // Delete all guests for this lineup (cascading will delete invitations and responses)
        const result = await prisma.guest.deleteMany({
            where: {
                lineupId,
            },
        });

        return NextResponse.json({
            success: true,
            count: result.count,
        });
    } catch (error: any) {
        console.error("Delete all guests error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

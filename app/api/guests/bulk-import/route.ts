import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Add BigInt serialization support
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { lineupId, guests, events } = body;

        if (!lineupId || !guests || !Array.isArray(guests)) {
            return NextResponse.json(
                { success: false, error: "Invalid request data" },
                { status: 400 }
            );
        }

        let successCount = 0;
        const errors: string[] = [];

        // Create a map of event slugs to event IDs
        const eventMap = new Map(events.map((e: any) => [e.slug, e.id]));

        for (const guestData of guests) {
            try {
                // Create guest (without attendeeLimit - now per-invitation)
                const guest = await prisma.guest.create({
                    data: {
                        lineupId,
                        fullName: guestData.guestName,
                        email: guestData.email?.trim() || null,
                    },
                });

                // Create invitations with per-event attendee limits
                const invitationsToCreate = Object.entries(guestData.eventLimits || {})
                    .map(([eventSlug, attendeeLimit]) => {
                        const eventId = eventMap.get(eventSlug);
                        if (eventId) {
                            return {
                                guestId: guest.id,
                                eventId,
                                isInvited: true,
                                attendeeLimit: attendeeLimit as number,
                            };
                        }
                        return null;
                    })
                    .filter(Boolean);

                if (invitationsToCreate.length > 0) {
                    await prisma.invitation.createMany({
                        data: invitationsToCreate as any[],
                        skipDuplicates: true,
                    });
                }

                successCount++;
            } catch (error: any) {
                // Check if it's a unique constraint violation (duplicate name)
                if (error.code === 'P2002') {
                    errors.push(`${guestData.guestName}: Guest with this name already exists`);
                } else {
                    errors.push(`${guestData.guestName}: ${error.message}`);
                }
            }
        }

        if (errors.length > 0 && successCount === 0) {
            return NextResponse.json(
                { success: false, error: "Failed to import guests", errors },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            count: successCount,
            errors: errors.length > 0 ? errors : undefined,
        });
    } catch (error: any) {
        console.error("Bulk import error:", error);
        return NextResponse.json(
            { success: false, error: error.message || "Internal server error" },
            { status: 500 }
        );
    }
}

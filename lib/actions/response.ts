"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function getResponsesByLineup(lineupId: string) {
    const session = await getSession();
    if (!session) {
        return { success: false, responses: [] };
    }

    try {
        // Verify lineup ownership
        const lineup = await prisma.eventLineup.findFirst({
            where: {
                id: lineupId,
                hostId: session.hostId,
            },
        });

        if (!lineup) {
            return { success: false, responses: [] };
        }

        const responses = await prisma.response.findMany({
            where: {
                guest: {
                    lineupId,
                },
            },
            include: {
                guest: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                event: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        date: true,
                        time: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return { success: true, responses };
    } catch (error) {
        console.error("Error fetching responses:", error);
        return { success: false, responses: [] };
    }
}

export async function deleteResponse(responseId: string) {
    const session = await getSession();
    if (!session) {
        return { success: false, error: "Not authenticated" };
    }

    try {
        // Verify ownership through lineup
        const response = await prisma.response.findUnique({
            where: { id: responseId },
            include: {
                guest: {
                    include: {
                        lineup: true,
                    },
                },
            },
        });

        if (!response || response.guest.lineup.hostId !== session.hostId) {
            return { success: false, error: "Response not found" };
        }

        await prisma.response.delete({
            where: { id: responseId },
        });

        revalidatePath(`/dashboard/${response.guest.lineupId}/responses`);

        return { success: true };
    } catch (error) {
        console.error("Error deleting response:", error);
        return { success: false, error: "Failed to delete response" };
    }
}

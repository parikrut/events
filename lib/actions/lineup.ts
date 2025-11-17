"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function getMyLineups() {
    const session = await getSession();
    if (!session) {
        return { success: false, lineups: [] };
    }

    try {
        const lineups = await prisma.eventLineup.findMany({
            where: {
                hostId: session.hostId,
            },
            include: {
                _count: {
                    select: {
                        events: true,
                        guestLists: true,
                    },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return {
            success: true,
            lineups: lineups.map((lineup) => ({
                ...lineup,
                eventCount: lineup._count.events,
                guestCount: lineup._count.guestLists,
            })),
        };
    } catch (error) {
        console.error("Error fetching lineups:", error);
        return { success: false, lineups: [] };
    }
}

export async function createLineup(data: {
    title: string;
    eventCategory: string;
    organizerName: string;
    organizerEmail: string;
    groomName?: string;
    brideName?: string;
    description?: string;
}) {
    const session = await getSession();
    if (!session) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        const slug = generateSlug(data.title);

        // Check if slug exists
        const existing = await prisma.eventLineup.findUnique({
            where: { slug },
        });

        if (existing) {
            return {
                success: false,
                message: "A lineup with this title already exists",
            };
        }

        const lineup = await prisma.eventLineup.create({
            data: {
                hostId: session.hostId,
                title: data.title,
                slug,
                eventCategory: data.eventCategory,
                organizerName: data.organizerName,
                organizerEmail: data.organizerEmail,
                groomName: data.groomName || null,
                brideName: data.brideName || null,
                description: data.description || null,
            },
        });

        revalidatePath("/dashboard");

        return {
            success: true,
            message: "Event lineup created successfully",
            lineup,
        };
    } catch (error) {
        console.error("Error creating lineup:", error);
        return {
            success: false,
            message: "Failed to create event lineup",
        };
    }
}

export async function updateLineup(
    id: string,
    data: {
        title?: string;
        eventCategory?: string;
        organizerName?: string;
        organizerEmail?: string;
        groomName?: string;
        brideName?: string;
        description?: string;
    }
) {
    const session = await getSession();
    if (!session) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        // Verify ownership
        const existing = await prisma.eventLineup.findFirst({
            where: {
                id,
                hostId: session.hostId,
            },
        });

        if (!existing) {
            return {
                success: false,
                message: "Event lineup not found",
            };
        }

        const updateData: any = {};

        if (data.title && data.title !== existing.title) {
            updateData.title = data.title;
            updateData.slug = generateSlug(data.title);
        }

        if (data.eventCategory) updateData.eventCategory = data.eventCategory;
        if (data.organizerName) updateData.organizerName = data.organizerName;
        if (data.organizerEmail) updateData.organizerEmail = data.organizerEmail;
        if (data.groomName !== undefined) updateData.groomName = data.groomName || null;
        if (data.brideName !== undefined) updateData.brideName = data.brideName || null;
        if (data.description !== undefined)
            updateData.description = data.description || null;

        const lineup = await prisma.eventLineup.update({
            where: { id },
            data: updateData,
        });

        revalidatePath("/dashboard");
        revalidatePath(`/dashboard/${id}`);

        return {
            success: true,
            message: "Event lineup updated successfully",
            lineup,
        };
    } catch (error) {
        console.error("Error updating lineup:", error);
        return {
            success: false,
            message: "Failed to update event lineup",
        };
    }
}

export async function deleteLineup(id: string) {
    const session = await getSession();
    if (!session) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        // Verify ownership
        const existing = await prisma.eventLineup.findFirst({
            where: {
                id,
                hostId: session.hostId,
            },
        });

        if (!existing) {
            return {
                success: false,
                message: "Event lineup not found",
            };
        }

        await prisma.eventLineup.delete({
            where: { id },
        });

        revalidatePath("/dashboard");

        return {
            success: true,
            message: "Event lineup deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting lineup:", error);
        return {
            success: false,
            message: "Failed to delete event lineup",
        };
    }
}

export async function getLineupById(id: string) {
    const session = await getSession();
    if (!session) {
        return { success: false, lineup: null };
    }

    try {
        const lineup = await prisma.eventLineup.findFirst({
            where: {
                id,
                hostId: session.hostId,
            },
            include: {
                events: {
                    orderBy: {
                        epochTime: "asc",
                    },
                },
                _count: {
                    select: {
                        events: true,
                        guestLists: true,
                    },
                },
            },
        });

        if (!lineup) {
            return { success: false, lineup: null };
        }

        return {
            success: true,
            lineup: {
                ...lineup,
                eventCount: lineup._count.events,
                guestCount: lineup._count.guestLists,
            },
        };
    } catch (error) {
        console.error("Error fetching lineup:", error);
        return { success: false, lineup: null };
    }
}

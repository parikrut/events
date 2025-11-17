"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
}

export async function createEvent(
    lineupId: string,
    data: {
        name: string;
        description?: string;
        date: Date;
        time: string;
        timezone: string;
        venue: string;
        address: string;
        addressUrl?: string;
        dressCode?: string;
    }
) {
    const session = await getSession();
    if (!session) {
        return { success: false, message: "Not authenticated" };
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
            return {
                success: false,
                message: "Event lineup not found",
            };
        }

        const slug = generateSlug(data.name);
        const epochTime = BigInt(Math.floor(data.date.getTime()));

        const event = await prisma.event.create({
            data: {
                lineupId,
                slug,
                name: data.name,
                description: data.description || null,
                date: data.date,
                time: data.time,
                epochTime,
                timezone: data.timezone,
                venue: data.venue,
                address: data.address,
                addressUrl: data.addressUrl || null,
                dressCode: data.dressCode || null,
            },
        });

        revalidatePath(`/dashboard/${lineupId}`);
        revalidatePath(`/events/${lineup.slug}`);

        return {
            success: true,
            message: "Event created successfully",
            event,
        };
    } catch (error) {
        console.error("Error creating event:", error);
        return {
            success: false,
            message: "Failed to create event",
        };
    }
}

export async function updateEvent(
    eventId: string,
    data: {
        name?: string;
        description?: string;
        date?: Date;
        time?: string;
        timezone?: string;
        venue?: string;
        address?: string;
        addressUrl?: string;
        dressCode?: string;
    }
) {
    const session = await getSession();
    if (!session) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        // Verify ownership through lineup
        const existing = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                lineup: true,
            },
        });

        if (!existing || existing.lineup.hostId !== session.hostId) {
            return {
                success: false,
                message: "Event not found",
            };
        }

        const updateData: any = {};

        if (data.name && data.name !== existing.name) {
            updateData.name = data.name;
            updateData.slug = generateSlug(data.name);
        }

        if (data.description !== undefined)
            updateData.description = data.description || null;
        if (data.date) {
            updateData.date = data.date;
            updateData.epochTime = BigInt(Math.floor(data.date.getTime()));
        }
        if (data.time) updateData.time = data.time;
        if (data.timezone) updateData.timezone = data.timezone;
        if (data.venue) updateData.venue = data.venue;
        if (data.address) updateData.address = data.address;
        if (data.addressUrl !== undefined)
            updateData.addressUrl = data.addressUrl || null;
        if (data.dressCode !== undefined)
            updateData.dressCode = data.dressCode || null;

        const event = await prisma.event.update({
            where: { id: eventId },
            data: updateData,
        });

        revalidatePath(`/dashboard/${existing.lineupId}`);
        revalidatePath(`/events/${existing.lineup.slug}`);

        return {
            success: true,
            message: "Event updated successfully",
            event,
        };
    } catch (error) {
        console.error("Error updating event:", error);
        return {
            success: false,
            message: "Failed to update event",
        };
    }
}

export async function deleteEvent(eventId: string) {
    const session = await getSession();
    if (!session) {
        return { success: false, message: "Not authenticated" };
    }

    try {
        // Verify ownership through lineup
        const existing = await prisma.event.findUnique({
            where: { id: eventId },
            include: {
                lineup: true,
            },
        });

        if (!existing || existing.lineup.hostId !== session.hostId) {
            return {
                success: false,
                message: "Event not found",
            };
        }

        await prisma.event.delete({
            where: { id: eventId },
        });

        revalidatePath(`/dashboard/${existing.lineupId}`);
        revalidatePath(`/events/${existing.lineup.slug}`);

        return {
            success: true,
            message: "Event deleted successfully",
        };
    } catch (error) {
        console.error("Error deleting event:", error);
        return {
            success: false,
            message: "Failed to delete event",
        };
    }
}

export async function getEventsByLineup(lineupId: string) {
    const session = await getSession();
    if (!session) {
        return { success: false, events: [] };
    }

    try {
        // Verify ownership
        const lineup = await prisma.eventLineup.findFirst({
            where: {
                id: lineupId,
                hostId: session.hostId,
            },
        });

        if (!lineup) {
            return { success: false, events: [] };
        }

        const events = await prisma.event.findMany({
            where: {
                lineupId,
            },
            orderBy: {
                epochTime: "asc",
            },
        });

        return {
            success: true,
            events,
        };
    } catch (error) {
        console.error("Error fetching events:", error);
        return { success: false, events: [] };
    }
}

export async function getEventsSummaryByLineup(lineupId: string) {
    const session = await getSession();
    if (!session) {
        return { success: false, events: [] };
    }

    try {
        // Verify ownership
        const lineup = await prisma.eventLineup.findFirst({
            where: {
                id: lineupId,
                hostId: session.hostId,
            },
        });

        if (!lineup) {
            return { success: false, events: [] };
        }

        const events = await prisma.event.findMany({
            where: {
                lineupId,
            },
            orderBy: {
                epochTime: "asc",
            },
            select: {
                id: true,
                name: true,
                slug: true,
            },
        });

        return {
            success: true,
            events,
        };
    } catch (error) {
        console.error("Error fetching events summary:", error);
        return { success: false, events: [] };
    }
}

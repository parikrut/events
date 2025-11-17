"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateGuestData {
    lineupId: string;
    fullName: string;
    email?: string;
}

interface UpdateGuestData {
    fullName?: string;
    email?: string;
}

interface BulkGuestData {
    fullName: string;
    email?: string;
}

export async function createGuest(data: CreateGuestData) {
    try {
        const guest = await prisma.guest.create({
            data: {
                lineupId: data.lineupId,
                fullName: data.fullName,
                email: data.email,
            },
        });

        revalidatePath(`/dashboard/${data.lineupId}/guests`);

        return { success: true, guest };
    } catch (error: any) {
        console.error("Error creating guest:", error);
        // Check for unique constraint violation (duplicate name)
        if (error.code === 'P2002') {
            return { success: false, error: "A guest with this name already exists in this lineup" };
        }
        return { success: false, error: "Failed to create guest" };
    }
}

export async function updateGuest(guestId: string, data: UpdateGuestData) {
    try {
        const guest = await prisma.guest.update({
            where: { id: guestId },
            data,
        });

        // Get lineupId for revalidation
        const guestData = await prisma.guest.findUnique({
            where: { id: guestId },
            select: { lineupId: true },
        });

        if (guestData) {
            revalidatePath(`/dashboard/${guestData.lineupId}/guests`);
        }

        return { success: true, guest };
    } catch (error: any) {
        console.error("Error updating guest:", error);
        // Check for unique constraint violation (duplicate name)
        if (error.code === 'P2002') {
            return { success: false, error: "A guest with this name already exists in this lineup" };
        }
        return { success: false, error: "Failed to update guest" };
    }
}

export async function deleteGuest(guestId: string) {
    try {
        // Get lineupId before deletion for revalidation
        const guest = await prisma.guest.findUnique({
            where: { id: guestId },
            select: { lineupId: true },
        });

        await prisma.guest.delete({
            where: { id: guestId },
        });

        if (guest) {
            revalidatePath(`/dashboard/${guest.lineupId}/guests`);
        }

        return { success: true };
    } catch (error) {
        console.error("Error deleting guest:", error);
        return { success: false, error: "Failed to delete guest" };
    }
}

export async function getGuestsByLineup(lineupId: string) {
    try {
        const guests = await prisma.guest.findMany({
            where: { lineupId },
            orderBy: { fullName: "asc" },
            include: {
                invitations: {
                    include: {
                        event: {
                            select: {
                                name: true,
                                slug: true,
                            },
                        },
                    },
                },
                responses: {
                    include: {
                        event: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
        });

        return { success: true, guests };
    } catch (error) {
        console.error("Error fetching guests:", error);
        return { success: false, error: "Failed to fetch guests", guests: [] };
    }
}

export async function bulkCreateGuests(lineupId: string, guestsData: BulkGuestData[]) {
    try {
        const guests = await prisma.guest.createMany({
            data: guestsData.map((guest) => ({
                lineupId,
                fullName: guest.fullName,
                email: guest.email,
            })),
            skipDuplicates: true,
        });

        revalidatePath(`/dashboard/${lineupId}/guests`);

        return { success: true, count: guests.count };
    } catch (error) {
        console.error("Error bulk creating guests:", error);
        return { success: false, error: "Failed to create guests" };
    }
}

export async function getGuestById(guestId: string) {
    try {
        const guest = await prisma.guest.findUnique({
            where: { id: guestId },
            include: {
                invitations: {
                    include: {
                        event: true,
                    },
                },
                responses: {
                    include: {
                        event: true,
                    },
                },
            },
        });

        if (!guest) {
            return { success: false, error: "Guest not found" };
        }

        return { success: true, guest };
    } catch (error) {
        console.error("Error fetching guest:", error);
        return { success: false, error: "Failed to fetch guest" };
    }
}

"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

interface CreateInvitationsData {
    guestId: string;
    invitations: Array<{ eventId: string; attendeeLimit: number }>;
}

interface SyncInvitationsData {
    guestId: string;
    invitations: Array<{ eventId: string; attendeeLimit: number }>;
}

export async function createInvitations(data: CreateInvitationsData) {
    try {
        const invitations = await prisma.invitation.createMany({
            data: data.invitations.map((inv) => ({
                guestId: data.guestId,
                eventId: inv.eventId,
                attendeeLimit: inv.attendeeLimit,
                isInvited: true,
            })),
            skipDuplicates: true,
        });

        return { success: true, count: invitations.count };
    } catch (error) {
        console.error("Error creating invitations:", error);
        return { success: false, error: "Failed to create invitations" };
    }
}

export async function syncInvitations(data: SyncInvitationsData) {
    try {
        // Get current invitations
        const currentInvitations = await prisma.invitation.findMany({
            where: { guestId: data.guestId },
            select: { eventId: true, id: true, attendeeLimit: true },
        });

        const currentEventIds = currentInvitations.map((inv) => inv.eventId);
        const newEventIds = data.invitations.map((inv) => inv.eventId);

        // Find invitations to delete (not in new list)
        const invitationsToDelete = currentInvitations.filter(
            (inv) => !newEventIds.includes(inv.eventId)
        );

        // Find invitations to create (in new list but not in current)
        const invitationsToCreate = data.invitations.filter(
            (inv) => !currentEventIds.includes(inv.eventId)
        );

        // Find invitations to update (exist in both but may have different attendeeLimit)
        const invitationsToUpdate = data.invitations.filter((newInv) => {
            const existing = currentInvitations.find((curr) => curr.eventId === newInv.eventId);
            return existing && existing.attendeeLimit !== newInv.attendeeLimit;
        });

        // Delete removed invitations
        if (invitationsToDelete.length > 0) {
            await prisma.invitation.deleteMany({
                where: {
                    id: {
                        in: invitationsToDelete.map((inv) => inv.id),
                    },
                },
            });
        }

        // Create new invitations
        if (invitationsToCreate.length > 0) {
            await prisma.invitation.createMany({
                data: invitationsToCreate.map((inv) => ({
                    guestId: data.guestId,
                    eventId: inv.eventId,
                    attendeeLimit: inv.attendeeLimit,
                    isInvited: true,
                })),
                skipDuplicates: true,
            });
        }

        // Update existing invitations with new attendeeLimit
        for (const inv of invitationsToUpdate) {
            const existing = currentInvitations.find((curr) => curr.eventId === inv.eventId);
            if (existing) {
                await prisma.invitation.update({
                    where: { id: existing.id },
                    data: { attendeeLimit: inv.attendeeLimit },
                });
            }
        }

        return {
            success: true,
            deleted: invitationsToDelete.length,
            created: invitationsToCreate.length,
            updated: invitationsToUpdate.length,
        };
    } catch (error) {
        console.error("Error syncing invitations:", error);
        return { success: false, error: "Failed to sync invitations" };
    }
}

export async function deleteInvitation(invitationId: string) {
    try {
        await prisma.invitation.delete({
            where: { id: invitationId },
        });

        return { success: true };
    } catch (error) {
        console.error("Error deleting invitation:", error);
        return { success: false, error: "Failed to delete invitation" };
    }
}

export async function updateInvitation(invitationId: string, isInvited: boolean) {
    try {
        const invitation = await prisma.invitation.update({
            where: { id: invitationId },
            data: { isInvited },
        });

        return { success: true, invitation };
    } catch (error) {
        console.error("Error updating invitation:", error);
        return { success: false, error: "Failed to update invitation" };
    }
}

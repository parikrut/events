"use server";

import { prisma } from "@/lib/prisma";

export async function getAllEventSlugs() {
    try {
        const eventLineups = await prisma.eventLineup.findMany({
            where: {
                isActive: true,
            },
            select: {
                slug: true,
            },
        });

        return eventLineups.map((lineup) => lineup.slug);
    } catch (error) {
        console.error("Error fetching event slugs:", error);
        return [];
    }
}

export async function getEventBySlug(slug: string) {
    try {
        const eventLineup = await prisma.eventLineup.findUnique({
            where: {
                slug,
                isActive: true,
            },
            include: {
                events: {
                    where: {
                        isActive: true,
                    },
                    orderBy: {
                        epochTime: "asc",
                    },
                },
                _count: {
                    select: {
                        guestLists: true,
                    },
                },
            },
        });

        if (!eventLineup) {
            return null;
        }

        return {
            id: eventLineup.id,
            title: eventLineup.title,
            slug: eventLineup.slug,
            organizerName: eventLineup.organizerName,
            organizerEmail: eventLineup.organizerEmail,
            groomName: eventLineup.groomName,
            brideName: eventLineup.brideName,
            description: eventLineup.description,
            guestCount: eventLineup._count.guestLists,
            events: eventLineup.events,
        };
    } catch (error) {
        console.error("Error fetching event:", error);
        return null;
    }
}

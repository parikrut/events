"use server";

import { prisma } from "@/lib/prisma";

export async function getAllEventSlugs() {
    try {
        const eventOrganizers = await prisma.eventOrganizer.findMany({
            where: {
                isActive: true,
            },
            select: {
                slug: true,
            },
        });

        return eventOrganizers.map((event) => event.slug);
    } catch (error) {
        console.error("Error fetching event slugs:", error);
        return [];
    }
}

export async function getEventBySlug(slug: string) {
    try {
        const eventOrganizer = await prisma.eventOrganizer.findUnique({
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

        if (!eventOrganizer) {
            return null;
        }

        return {
            id: eventOrganizer.id,
            title: eventOrganizer.title,
            slug: eventOrganizer.slug,
            organizerName: eventOrganizer.organizerName,
            organizerEmail: eventOrganizer.organizerEmail,
            groomName: eventOrganizer.groomName,
            brideName: eventOrganizer.brideName,
            hostName: eventOrganizer.hostName,
            description: eventOrganizer.description,
            theme: eventOrganizer.theme,
            logoUrl: eventOrganizer.logoUrl,
            guestCount: eventOrganizer._count.guestLists,
            events: eventOrganizer.events,
        };
    } catch (error) {
        console.error("Error fetching event:", error);
        return null;
    }
}

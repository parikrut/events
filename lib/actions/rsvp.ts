"use server";

import { prisma } from "@/lib/prisma";
import { sendRSVPConfirmationEmail } from "@/lib/email";

export async function checkGuestByName(fullName: string, organizerId: string) {
    try {
        // Find exact match
        const exactMatch = await prisma.guest.findFirst({
            where: {
                organizerId,
                fullName: {
                    equals: fullName,
                    mode: "insensitive",
                },
            },
            include: {
                invitations: {
                    where: {
                        isInvited: true,
                    },
                    include: {
                        event: {
                            select: {
                                id: true,
                                name: true,
                                slug: true,
                                date: true,
                                time: true,
                                timezone: true,
                                venue: true,
                                address: true,
                                addressUrl: true,
                                dressCode: true,
                                // Exclude epochTime to avoid BigInt serialization issues
                            },
                        },
                    },
                },
            },
        });

        if (exactMatch) {
            return {
                success: true,
                matched: true,
                guest: exactMatch,
                suggestions: [],
            };
        }

        // Find similar names for suggestions
        const similarGuests = await prisma.guest.findMany({
            where: {
                organizerId,
                fullName: {
                    contains: fullName.split(" ")[0], // Search by first name
                    mode: "insensitive",
                },
            },
            take: 5,
        });

        return {
            success: true,
            matched: false,
            guest: null,
            suggestions: similarGuests.map((g) => g.fullName),
        };
    } catch (error) {
        console.error("Error checking guest:", error);
        return {
            success: false,
            matched: false,
            guest: null,
            suggestions: [],
            error: "Failed to check guest name",
        };
    }
}

export async function submitRSVP(data: {
    guestId: string;
    email: string;
    responses: Array<{
        eventId: string;
        isAttending: boolean;
        attendeeCount: number;
    }>;
}) {
    try {
        // Get guest with organizer info for email
        const guest = await prisma.guest.findUnique({
            where: { id: data.guestId },
            include: {
                organizer: {
                    select: {
                        title: true,
                        organizerName: true,
                        organizerEmail: true,
                    }
                }
            }
        });

        if (!guest) {
            return {
                success: false,
                message: "Guest not found",
            };
        }

        // Update guest email
        await prisma.guest.update({
            where: { id: data.guestId },
            data: { email: data.email },
        });

        // Create or update responses
        for (const response of data.responses) {
            await prisma.response.upsert({
                where: {
                    guestId_eventId: {
                        guestId: data.guestId,
                        eventId: response.eventId,
                    },
                },
                create: {
                    guestId: data.guestId,
                    eventId: response.eventId,
                    isAttending: response.isAttending,
                    attendeeCount: response.attendeeCount,
                },
                update: {
                    isAttending: response.isAttending,
                    attendeeCount: response.attendeeCount,
                },
            });
        }

        // Send confirmation email (non-blocking)
        let emailSent = false;
        let emailError: string | undefined;
        let resendMessageId: string | undefined;

        const attendingEvents = data.responses.filter(r => r.isAttending);

        if (attendingEvents.length > 0) {
            try {
                // Fetch full event details for attending events
                const events = await prisma.event.findMany({
                    where: {
                        id: {
                            in: attendingEvents.map(e => e.eventId)
                        }
                    },
                    select: {
                        id: true,
                        name: true,
                        date: true,
                        time: true,
                        timezone: true,
                        venue: true,
                        address: true,
                        addressUrl: true,
                        dressCode: true,
                    }
                });

                // Prepare event details with attendee counts
                const eventDetails = events.map(event => {
                    const response = attendingEvents.find(r => r.eventId === event.id);
                    return {
                        ...event,
                        attendeeCount: response?.attendeeCount || 1
                    };
                });

                const emailResult = await sendRSVPConfirmationEmail(
                    guest.fullName,
                    data.email,
                    eventDetails,
                    guest.organizer.organizerName,
                    guest.organizer.organizerEmail,
                    guest.organizer.title
                );

                emailSent = emailResult.success;
                resendMessageId = emailResult.messageId;
                emailError = emailResult.error;

                if (emailSent) {
                    console.log("Email sent successfully:", resendMessageId);

                    // Log successful email
                    await prisma.emailLog.create({
                        data: {
                            guestId: data.guestId,
                            emailType: "confirmation",
                            status: "sent",
                            resendId: resendMessageId,
                        },
                    });
                } else {
                    console.error("Email failed:", emailError);
                    // Log failed email
                    await prisma.emailLog.create({
                        data: {
                            guestId: data.guestId,
                            emailType: "confirmation",
                            status: "failed",
                            error: emailError,
                        },
                    });
                }
            } catch (emailErr) {
                console.error("Error sending email (non-blocking):", emailErr);
                emailError = emailErr instanceof Error ? emailErr.message : "Unknown email error";

                // Log email error but don't fail the submission
                await prisma.emailLog.create({
                    data: {
                        guestId: data.guestId,
                        emailType: "confirmation",
                        status: "failed",
                        error: emailError,
                    },
                });
            }
        }

        return {
            success: true,
            message: emailSent
                ? "RSVP submitted successfully! Check your email for confirmation."
                : "RSVP submitted successfully! Email confirmation may be delayed.",
            emailSent,
        };
    } catch (error) {
        console.error("Error submitting RSVP:", error);
        return {
            success: false,
            message: "Failed to submit RSVP. Please try again.",
        };
    }
}

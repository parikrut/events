import { Resend } from 'resend';
import { createEvents, DateArray } from 'ics';

const resend = new Resend(process.env.RESEND_API_KEY);

interface EventDetails {
    id: string;
    name: string;
    date: Date;
    time: string;
    timezone: string;
    venue: string;
    address: string;
    addressUrl: string | null;
    dressCode: string | null;
    attendeeCount: number;
}

/**
 * Generates ICS content for multiple events
 */
export function generateMultipleCalendarInvites(
    events: EventDetails[],
    guestName: string,
    organizerEmail: string,
    organizerName: string
): string | null {
    try {
        // Generate event objects for ics library
        const icsEvents = events.map((event, index) => {
            // Parse the date (assumes YYYY-MM-DD format)
            const dateObj = new Date(event.date);

            // Parse time (assumes HH:MM format)
            const [hours, minutes] = event.time.split(':').map(Number);

            // Create a date with the time
            const startDate = new Date(dateObj);
            startDate.setHours(hours, minutes, 0, 0);

            // Extract components for start time
            const start: DateArray = [
                startDate.getFullYear(),
                startDate.getMonth() + 1,
                startDate.getDate(),
                startDate.getHours(),
                startDate.getMinutes()
            ];

            // Calculate end time (3 hours after start)
            const endDate = new Date(startDate.getTime() + 3 * 60 * 60 * 1000);
            const end: DateArray = [
                endDate.getFullYear(),
                endDate.getMonth() + 1,
                endDate.getDate(),
                endDate.getHours(),
                endDate.getMinutes()
            ];

            return {
                start,
                end,
                title: event.name,
                description: `${event.name}\n\n${event.dressCode ? `Dress Code: ${event.dressCode}\n\n` : ''}We look forward to celebrating with you!`,
                location: `${event.venue}, ${event.address}`,
                url: event.addressUrl || undefined,
                status: 'CONFIRMED' as const,
                busyStatus: 'BUSY' as const,
                organizer: {
                    name: organizerName,
                    email: organizerEmail
                },
                alarms: [
                    {
                        action: 'display' as const,
                        trigger: { hours: 24, minutes: 0, before: true },
                        description: `Reminder: ${event.name} tomorrow`,
                    }
                ],
                // Add unique identifier for each event
                uid: `event-${event.id}-${Date.now()}-${index}@events.krutikparikh.ca`,
            };
        });

        // Use createEvents to properly generate multiple events in one calendar
        const { error, value } = createEvents(icsEvents);

        if (error) {
            console.error('Error creating ICS events:', error);
            return null;
        }

        return value || null;
    } catch (error) {
        console.error('Error generating multiple calendar invites:', error);
        return null;
    }
}

/**
 * Sends RSVP confirmation email with calendar invites for all events (combined)
 */
export async function sendRSVPConfirmationEmail(
    guestName: string,
    guestEmail: string,
    attendingEvents: EventDetails[],
    organizerName: string,
    organizerEmail: string,
    eventTitle: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
        // Generate calendar invite for all events
        const calendarInvite = generateMultipleCalendarInvites(
            attendingEvents,
            guestName,
            organizerEmail,
            organizerName
        );

        // Create email content
        const eventsList = attendingEvents
            .map((event) => {
                const date = new Date(event.date);
                const monthName = date.toLocaleDateString('en-US', { month: 'long' });
                const day = date.getDate();
                const year = date.getFullYear();
                const dayWithSuffix = `${day}${['th', 'st', 'nd', 'rd'][day % 10 > 3 || Math.floor(day % 100 / 10) === 1 ? 0 : day % 10]}`;

                const [hours, minutes] = event.time.split(':').map(Number);
                const period = hours >= 12 ? 'PM' : 'AM';
                const displayHours = hours % 12 || 12;
                const timeStr = `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;

                return `
                    <div style="margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
                        <h3 style="margin: 0 0 15px 0; font-size: 20px; text-align: center;">${event.name}</h3>
                        
                        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <p style="margin: 0 0 5px 0; font-size: 13px; opacity: 0.9;">📅 Date</p>
                            <p style="margin: 0; font-size: 16px; font-weight: bold;">${dayWithSuffix} ${monthName}, ${year}</p>
                        </div>

                        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <p style="margin: 0 0 5px 0; font-size: 13px; opacity: 0.9;">⏰ Time</p>
                            <p style="margin: 0; font-size: 16px; font-weight: bold;">${timeStr}</p>
                        </div>

                        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <p style="margin: 0 0 5px 0; font-size: 13px; opacity: 0.9;">📍 Venue</p>
                            <p style="margin: 0; font-size: 16px; font-weight: bold;">${event.venue}</p>
                            <p style="margin: 5px 0 0 0; font-size: 13px; opacity: 0.9;">${event.address}</p>
                        </div>

                        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <p style="margin: 0 0 5px 0; font-size: 13px; opacity: 0.9;">👥 Number of Guests</p>
                            <p style="margin: 0; font-size: 16px; font-weight: bold;">${event.attendeeCount} ${event.attendeeCount === 1 ? 'Guest' : 'Guests'}</p>
                        </div>

                        ${event.dressCode ? `
                        <div style="background: rgba(255,255,255,0.1); padding: 12px; border-radius: 8px; margin-bottom: 8px;">
                            <p style="margin: 0 0 5px 0; font-size: 13px; opacity: 0.9;">👔 Dress Code</p>
                            <p style="margin: 0; font-size: 13px; line-height: 1.4;">${event.dressCode}</p>
                        </div>
                        ` : ''}

                        ${event.addressUrl ? `
                        <div style="text-align: center; margin-top: 15px;">
                            <a href="${event.addressUrl}" style="display: inline-block; background: white; color: #667eea; padding: 10px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 13px;">📍 View on Google Maps</a>
                        </div>
                        ` : ''}
                    </div>
                `;
            })
            .join('');

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>RSVP Confirmation</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 40px 20px;">
                    <!-- Header -->
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="margin: 0; color: #1f2937; font-size: 28px;">🎉 You're All Set!</h1>
                        <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 16px;">Your RSVP has been confirmed</p>
                    </div>

                    <!-- Greeting -->
                    <div style="margin-bottom: 30px;">
                        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                            Dear <strong>${guestName}</strong>,
                        </p>
                        <p style="font-size: 16px; color: #374151; line-height: 1.6;">
                            We are thrilled to confirm your attendance for ${eventTitle}. ${attendingEvents.length === 1 ? "We can't wait to celebrate this special moment with you!" : "We can't wait to celebrate these beautiful moments with you!"}
                        </p>
                    </div>

                    <!-- Events List -->
                    <div style="margin-bottom: 30px;">
                        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 15px; text-align: center;">Your Event Details</h2>
                        ${eventsList}
                    </div>

                    <!-- Calendar Invite Info -->
                    ${calendarInvite ? `
                    <div style="background-color: #eff6ff; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
                        <p style="margin: 0 0 10px 0; color: #1e40af; font-weight: bold;">📅 Calendar File Attached</p>
                        <p style="margin: 0; color: #1e40af; font-size: 14px;">
                            We've attached a calendar file with all your events. Simply open the attachment to add them to your calendar. 
                            You'll receive reminders 24 hours before each event.
                        </p>
                    </div>
                    ` : ''}

                    <!-- Important Info -->
                    <div style="margin-bottom: 30px; padding: 20px; background-color: #fef3c7; border-radius: 8px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0 0 10px 0; color: #92400e; font-weight: bold;">⚠️ Important Reminders:</p>
                        <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                            <li style="margin: 5px 0;">Please arrive 15-20 minutes before each event start time</li>
                            <li style="margin: 5px 0;">Dress according to the specified dress code for each event</li>
                            <li style="margin: 5px 0;">If you have any special requirements, please contact us in advance</li>
                        </ul>
                    </div>

                    <!-- Footer -->
                    <div style="text-align: center; padding-top: 30px; border-top: 2px solid #e5e7eb;">
                        <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">
                            If you need to make any changes to your RSVP, please contact us.
                        </p>
                        <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                            We're so excited to celebrate with you! 💕
                        </p>
                    </div>
                </div>
            </body>
            </html>
        `;

        // Prepare email attachments
        const attachments = calendarInvite
            ? [
                {
                    filename: 'events.ics',
                    content: Buffer.from(calendarInvite).toString('base64'),
                },
            ]
            : [];

        // Send email using Resend with organizer name in "from" field
        const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@email.krutikparikh.ca';
        const fromName = organizerName || 'Event Organizer';

        const { data, error } = await resend.emails.send({
            from: `${fromName} <${fromEmail}>`,
            to: guestEmail,
            subject: `✨ RSVP Confirmed - ${eventTitle}`,
            html: htmlContent,
            attachments,
        });

        if (error) {
            console.error('Error sending email:', error);
            return { success: false, error: error.message };
        }

        return { success: true, messageId: data?.id };
    } catch (error) {
        console.error('Error in sendRSVPConfirmationEmail:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}

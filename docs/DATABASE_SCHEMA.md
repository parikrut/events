# Database Schema Documentation

## Overview

The Event Management System uses a relational database structure designed to handle multiple event organizers, each with multiple event types, guest lists, and RSVP responses.

## Schema Design Rationale

### 1. EventOrganizer (The Container)

This is the top-level entity representing a complete event series (e.g., a wedding, house warming party, corporate event).

**Key Fields:**

- `title`: Display name (e.g., "Sarah & John's Wedding 2025")
- `slug`: URL-friendly identifier for custom event pages (e.g., "sarah-john-wedding")
- `groomName` / `brideName`: Optional fields for weddings
- `hostName`: For non-wedding events (e.g., house warming host)
- `theme`: Visual theme/color scheme identifier
- `logoUrl`: Custom branding image

**Why this design?**

- One organizer can host multiple events (ceremony, reception, sangeet, mehndi)
- Centralized branding and theme management
- Easy to clone for similar events
- Slug-based routing for custom URLs

### 2. EventType (Individual Events)

Represents specific events within an organizer's event series.

**Key Fields:**

- `slug`: Event identifier within the organizer (e.g., "ceremony", "reception")
- `name`: Display name (e.g., "Wedding Ceremony", "Reception Dinner")
- `date`: Event date
- `time`: Display time string (e.g., "6:00 PM")
- `epochTime`: Unix timestamp for sorting and filtering
- `timezone`: IANA timezone (e.g., "America/New_York")
- `venue`, `address`, `addressUrl`: Location details
- `dressCode`: Attire guidance
- `capacity`: Optional venue capacity

**Why this design?**

- Flexible scheduling across different dates/times
- Timezone support for destination events
- Each event can have different venues
- Independent RSVP tracking per event
- Guests can choose which events to attend

**Example:**

```
EventOrganizer: "Sarah & John's Wedding"
├── EventType: "Wedding Ceremony" (Saturday, 4:00 PM)
├── EventType: "Cocktail Hour" (Saturday, 5:30 PM)
├── EventType: "Reception Dinner" (Saturday, 7:00 PM)
└── EventType: "Sunday Brunch" (Sunday, 11:00 AM)
```

### 3. GuestList (Invitees)

Represents individuals or families invited to the event organizer's events.

**Key Fields:**

- `fullName`: Guest name
- `email`: Contact email
- `phone`: Optional contact number
- `attendeeLimit`: Maximum attendees for this guest
  - `-1` = No limit (rare, but useful for VIPs)
  - `1` = Solo invitation
  - `2` = Guest + 1
  - `4` = Family of 4
- `isInvited`: Flag for invitation status
- `inviteCode`: Unique code for RSVP access (security)
- `notes`: Internal notes (e.g., "Groom's college friend", "Bride's aunt")

**Why `attendeeLimit`?**
This is better than a simple boolean because:

- Some guests get a "+1", others don't
- Families might have 3-5 people
- `-1` allows unlimited for special cases (wedding party, parents)
- Prevents guests from bringing more people than allowed
- Helps with capacity planning

**Alternative considered:** A separate "plus ones" or "family members" table, but this adds complexity without much benefit for most use cases.

### 4. EventResponse (RSVP)

Tracks responses for each guest at each event type.

**Key Fields:**

- `guestListId`: Which guest is responding
- `eventTypeId`: Which specific event they're responding to
- `isAttending`: Yes/No attendance
- `attendeeCount`: How many people from their allocation
- `dietaryReqs`: Dietary restrictions/preferences
- `message`: Optional message to organizer

**Why separate responses per event?**

- Guest might attend ceremony but not reception
- Different headcounts for different events
- Allows partial RSVPs
- Better data for planning (catering, seating)

**Validation:**

- `attendeeCount` should not exceed `GuestList.attendeeLimit` (unless `-1`)
- Enforced at application level

**Example:**

```
Guest: "John Doe" (attendeeLimit: 2)
├── Response: Ceremony (isAttending: true, attendeeCount: 2)
├── Response: Reception (isAttending: true, attendeeCount: 2)
└── Response: Brunch (isAttending: false, attendeeCount: 0)
```

### 5. EmailLog (Communication Tracking)

Tracks all email communications sent to guests.

**Key Fields:**

- `emailType`: "invitation", "confirmation", "reminder", "update"
- `status`: "sent", "failed", "pending", "delivered", "opened"
- `resendId`: External email service ID
- `error`: Error message if failed
- `metadata`: JSON field for additional data

**Why track emails?**

- Prevent duplicate sends
- Debugging email issues
- Compliance and audit trail
- Resend failed emails
- Analytics (open rates, etc.)

## Relationships

```
EventOrganizer (1) ─┬─→ (N) EventType
                    └─→ (N) GuestList

EventType (1) ───────→ (N) EventResponse
GuestList (1) ───┬───→ (N) EventResponse
                 └───→ (N) EmailLog
```

## Indexes

Strategic indexes for performance:

1. **EventOrganizer**: `slug`, `isActive` - for public URL routing
2. **EventType**: `organizerId`, `date`, `epochTime` - for event listing and sorting
3. **GuestList**: `organizerId`, `email`, `inviteCode` - for lookups and auth
4. **EventResponse**: `guestListId`, `eventTypeId`, `isAttending` - for reporting
5. **EmailLog**: `guestListId`, `status`, `emailType`, `sentAt` - for email management

## Unique Constraints

1. `EventOrganizer.slug` - No duplicate URLs
2. `EventType[organizerId, slug]` - No duplicate event slugs within an organizer
3. `GuestList[organizerId, email]` - No duplicate guests per organizer
4. `GuestList.inviteCode` - Unique RSVP codes
5. `EventResponse[guestListId, eventTypeId]` - One response per guest per event

## Sample Data Flow

### Creating an Event

1. Create EventOrganizer: "Sarah & John's Wedding"
2. Create EventTypes: Ceremony, Reception, Brunch
3. Import GuestList: 150 guests with various attendeeLimits
4. Generate unique inviteCodes for each guest
5. Send invitation emails (logged in EmailLog)

### Guest RSVP Process

1. Guest receives email with inviteCode
2. Guest visits `/rsvp/sarah-john-wedding?code=ABC123`
3. System looks up guest by inviteCode
4. Display all EventTypes for this organizer
5. Guest selects which events to attend
6. For each selected event, specify attendeeCount
7. Create/update EventResponse records
8. Send confirmation email (logged in EmailLog)

### Reporting

- Total headcount per event: `SUM(EventResponse.attendeeCount WHERE isAttending = true)`
- Attendance rate: `COUNT(DISTINCT guestListId WHERE isAttending = true) / COUNT(GuestList)`
- Dietary requirements: Aggregate `EventResponse.dietaryReqs`
- Timeline view: Sort EventTypes by `epochTime`

## Future Enhancements

1. **Seating Arrangements**: Add `SeatingChart` and `TableAssignment` tables
2. **Gift Registry**: Add `GiftItem` and `GiftPurchase` tables
3. **Photo Sharing**: Add `Photo` and `PhotoAlbum` tables
4. **Meal Preferences**: Expand `dietaryReqs` to structured choices
5. **Accommodations**: Add hotel blocks and room reservations
6. **Event Timeline**: Add agenda items and schedule for the event day
7. **Vendors**: Track photographers, caterers, florists
8. **Budget**: Track expenses and payments

## Migration Strategy

When updating the schema:

1. Make changes to `schema.prisma`
2. Run `npx prisma migrate dev --name descriptive_name`
3. Test migrations on development database
4. Review generated SQL
5. Apply to production with `npx prisma migrate deploy`

## Best Practices

1. **Always use transactions** for creating related records
2. **Validate attendeeCount** against attendeeLimit in application code
3. **Generate inviteCodes** using crypto-secure random strings
4. **Sanitize user input** for message and notes fields
5. **Use soft deletes** by adding `deletedAt` if needed
6. **Archive old events** after they're over (add `isArchived` flag)

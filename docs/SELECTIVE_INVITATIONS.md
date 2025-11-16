# Selective Event Invitations

## Overview

The Event Management System supports **selective invitations**, allowing you to invite specific guests to only certain events within an organizer's event series.

## The Problem This Solves

### Scenario: Avish Patel's Wedding

**Avish Patel (Organizer)** has 4 events:

1. Mehndi Ceremony
2. Wedding Ceremony
3. Reception Dinner
4. Sunday Brunch

**Guest List**: 100 total guests

**Challenge**: Not all 100 guests should see or RSVP to all 4 events!

- **50 guests**: Invited to ALL events (close family/friends)
- **30 guests**: Invited to Wedding + Reception only (colleagues, distant relatives)
- **15 guests**: Invited to Reception only (business associates)
- **5 guests**: Invited to Mehndi only (ladies only event)

## How It Works

### Database Structure

```
GuestList ←→ EventInvitation ←→ EventType
```

The `EventInvitation` table is a **junction table** that connects:

- Which **guests** are invited to which **events**
- One guest can have multiple event invitations
- One event can have multiple guest invitations

### Schema

```prisma
model GuestList {
  id               String
  fullName         String
  email            String
  organizerId      String

  eventInvitations EventInvitation[] // 👈 Links to events
  eventResponses   EventResponse[]
}

model EventInvitation {
  id          String
  guestListId String   // 👈 The guest
  eventTypeId String   // 👈 The event they're invited to
  isInvited   Boolean  // Can be toggled to revoke

  guestList   GuestList
  eventType   EventType
}

model EventType {
  id               String
  name             String
  organizerId      String

  eventInvitations EventInvitation[] // 👈 Who's invited
  eventResponses   EventResponse[]
}
```

## Examples

### Example 1: Selective Wedding Invitations

```typescript
// Avish has 4 events
const events = {
  mehndi: "event-id-1",
  ceremony: "event-id-2",
  reception: "event-id-3",
  brunch: "event-id-4",
};

// Guest 1: Close friend - ALL events
await prisma.eventInvitation.createMany({
  data: [
    { guestListId: "guest-1", eventTypeId: events.mehndi },
    { guestListId: "guest-1", eventTypeId: events.ceremony },
    { guestListId: "guest-1", eventTypeId: events.reception },
    { guestListId: "guest-1", eventTypeId: events.brunch },
  ],
});

// Guest 2: Work colleague - Ceremony + Reception only
await prisma.eventInvitation.createMany({
  data: [
    { guestListId: "guest-2", eventTypeId: events.ceremony },
    { guestListId: "guest-2", eventTypeId: events.reception },
  ],
});

// Guest 3: Bride's friend - Mehndi only
await prisma.eventInvitation.create({
  data: {
    guestListId: "guest-3",
    eventTypeId: events.mehndi,
  },
});
```

### Example 2: CSV Import

```csv
# guest-list-template.csv

# Priya - All events
avish-wedding,"Priya Shah",priya@example.com,,2,"mehndi,ceremony,reception,brunch","Best friend"

# Rahul - Ceremony and Reception only
avish-wedding,"Rahul Kumar",rahul@example.com,,2,"ceremony,reception","Work colleague"

# Neha - Mehndi only (ladies event)
avish-wedding,"Neha Patel",neha@example.com,,1,mehndi,"Bride's cousin"

# Mr. Singh - Reception only (business)
avish-wedding,"Mr. Singh",singh@example.com,,1,reception,"Business partner"
```

## RSVP Experience

### What Guests See

When a guest visits their RSVP page using their invite code:

**Priya's RSVP Page** (invited to all):

```
✓ Mehndi Ceremony - June 14, 2025
✓ Wedding Ceremony - June 15, 2025
✓ Reception Dinner - June 15, 2025
✓ Sunday Brunch - June 16, 2025
```

**Rahul's RSVP Page** (ceremony + reception):

```
✓ Wedding Ceremony - June 15, 2025
✓ Reception Dinner - June 15, 2025
```

_He doesn't even see Mehndi or Brunch!_

**Neha's RSVP Page** (mehndi only):

```
✓ Mehndi Ceremony - June 14, 2025
```

## Query Examples

### Get events a guest is invited to

```typescript
const guestWithInvitations = await prisma.guestList.findUnique({
  where: { inviteCode: "ABC123" },
  include: {
    eventInvitations: {
      where: { isInvited: true },
      include: {
        eventType: true,
      },
    },
  },
});

// Shows only events this guest can see
const invitedEvents = guestWithInvitations.eventInvitations.map(
  (inv) => inv.eventType
);
```

### Get all guests invited to a specific event

```typescript
const eventWithGuests = await prisma.eventType.findUnique({
  where: { id: "event-id" },
  include: {
    eventInvitations: {
      where: { isInvited: true },
      include: {
        guestList: true,
      },
    },
  },
});

const invitedGuests = eventWithGuests.eventInvitations.map(
  (inv) => inv.guestList
);
```

### Get headcount for an event (only invited guests who RSVP'd yes)

```typescript
const responses = await prisma.eventResponse.findMany({
  where: {
    eventTypeId: "event-id",
    isAttending: true,
    // Ensure they're actually invited
    guestList: {
      eventInvitations: {
        some: {
          eventTypeId: "event-id",
          isInvited: true,
        },
      },
    },
  },
});

const totalHeadcount = responses.reduce((sum, r) => sum + r.attendeeCount, 0);
```

## Benefits

### 1. **Privacy**

Guests only see events they're invited to. No awkward "Why wasn't I invited to the brunch?" moments.

### 2. **Flexibility**

- VIP guests → All events
- Colleagues → Professional events only
- Ladies → Ladies-only events
- Family → Family events

### 3. **Capacity Management**

Different events can have different guest lists based on:

- Venue capacity
- Budget constraints
- Event type (formal vs casual)
- Time of day

### 4. **Cultural Events**

Perfect for multi-day cultural weddings:

- Mehndi (ladies only)
- Sangeet (close friends/family)
- Ceremony (all guests)
- Reception (all guests)
- Vidai (family only)

### 5. **Easy Management**

Toggle invitations:

```typescript
// Revoke invitation
await prisma.eventInvitation.update({
  where: { id: "invitation-id" },
  data: { isInvited: false },
});

// Re-invite
await prisma.eventInvitation.update({
  where: { id: "invitation-id" },
  data: { isInvited: true },
});
```

## Use Cases

### Wedding Weekend

```
Friday: Rehearsal Dinner (wedding party only)
Saturday: Ceremony (all guests)
Saturday: Reception (all guests)
Sunday: Brunch (out-of-town guests only)
```

### Corporate Conference

```
Day 1: Keynote (all attendees)
Day 1: VIP Dinner (speakers + sponsors only)
Day 2: Workshops (registered attendees)
Day 2: Networking Reception (all attendees)
```

### House Warming

```
Afternoon: Open House (all friends)
Evening: Dinner (close friends only)
```

## Implementation Notes

### When creating guests via CSV:

1. Import Event Organizer
2. Import Event Types
3. Import Guests **with** `invitedToEvents` column
4. Script automatically creates `EventInvitation` records

### When creating guests via UI:

```typescript
// Create guest
const guest = await prisma.guestList.create({ ... })

// Invite to selected events
await prisma.eventInvitation.createMany({
  data: selectedEventIds.map(eventId => ({
    guestListId: guest.id,
    eventTypeId: eventId,
    isInvited: true
  }))
})
```

### Validation Rules

1. **Guest must be invited** to RSVP to an event
2. **EventInvitation must exist** before EventResponse
3. **Cannot RSVP** to events guest isn't invited to
4. **One invitation** per guest per event (unique constraint)

## Security Considerations

### RSVP Endpoint

```typescript
// app/api/rsvp/verify/route.ts
export async function POST(request: Request) {
  const { inviteCode } = await request.json();

  const guest = await prisma.guestList.findUnique({
    where: { inviteCode },
    include: {
      eventInvitations: {
        where: { isInvited: true }, // ← Only show invited events!
        include: { eventType: true },
      },
    },
  });

  // Guest only sees events they're invited to
  return guest;
}
```

### Submit RSVP Validation

```typescript
// Before accepting RSVP, verify invitation exists
const invitation = await prisma.eventInvitation.findUnique({
  where: {
    guestListId_eventTypeId: {
      guestListId: guestId,
      eventTypeId: eventId,
    },
  },
});

if (!invitation || !invitation.isInvited) {
  return { error: "Not invited to this event" };
}
```

## Migration from Old System

If you had `GuestList.isInvited` (boolean):

```typescript
// Old: Guest was either invited or not (to everything)
// New: Guest is invited to specific events

// Migration script
const guests = await prisma.guestList.findMany({
  where: { isInvited: true },
  include: { organizer: { include: { eventTypes: true } } },
});

for (const guest of guests) {
  // Invite to all events in the organizer
  await prisma.eventInvitation.createMany({
    data: guest.organizer.eventTypes.map((event) => ({
      guestListId: guest.id,
      eventTypeId: event.id,
      isInvited: true,
    })),
  });
}
```

## Summary

The `EventInvitation` junction table provides:
✅ Granular control over who sees what
✅ Better privacy for guests  
✅ Flexible invitation management
✅ Perfect for multi-day/multi-event occasions
✅ Easy to query and manage

This is a **major advantage** over simple systems that show all events to all guests! 🎉

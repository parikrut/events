# Schema Comparison: RSVP vs Event Management System

## Overview

This document compares the original RSVP system with the new Event Management System to highlight the improvements and new capabilities.

## Side-by-Side Comparison

### Old RSVP System

```prisma
model Guest {
  id        String   @id @default(cuid())
  fullName  String
  email     String
  isInvited Boolean  @default(false)

  events    EventResponse[]
  emailLogs EmailLog[]
}

model EventResponse {
  id            String   @id @default(cuid())
  guestId       String
  eventId       String
  eventType     String    // Just a string!
  isAttending   Boolean
  attendeeCount Int      @default(0)

  guest Guest @relation(...)
}

model EmailLog {
  id        String   @id @default(cuid())
  guestId   String
  emailType String
  status    String
  ...
}
```

### New Event Management System

```prisma
model EventOrganizer {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  groomName   String?
  brideName   String?
  hostName    String?
  description String?
  theme       String?
  logoUrl     String?

  eventTypes EventType[]
  guestLists GuestList[]
}

model EventType {
  id          String   @id @default(cuid())
  organizerId String
  slug        String
  name        String
  date        DateTime
  time        String
  epochTime   BigInt
  timezone    String
  venue       String
  address     String
  ...

  organizer      EventOrganizer @relation(...)
  eventResponses EventResponse[]
}

model GuestList {
  id            String   @id @default(cuid())
  organizerId   String
  fullName      String
  email         String
  phone         String?
  attendeeLimit Int      @default(-1)  // New!
  inviteCode    String?  @unique       // New!
  notes         String?

  organizer      EventOrganizer @relation(...)
  eventResponses EventResponse[]
  emailLogs      EmailLog[]
}

model EventResponse {
  id            String   @id @default(cuid())
  guestListId   String
  eventTypeId   String
  isAttending   Boolean
  attendeeCount Int      @default(1)
  dietaryReqs   String?  // New!
  message       String?  // New!

  guestList GuestList @relation(...)
  eventType EventType @relation(...)
}

model EmailLog {
  id          String   @id @default(cuid())
  guestListId String
  emailType   String
  subject     String?  // New!
  status      String
  metadata    Json?    // New!
  ...
}
```

## Key Improvements

### 1. ✅ Multi-Event Support

**Old**: One event per RSVP system
**New**: Multiple events under one organizer

```typescript
// Old: Had to deploy separate apps for each event
// New: One app, infinite events!

const wedding = {
  title: "Sarah & John's Wedding",
  events: [
    { name: "Ceremony", date: "2025-06-15" },
    { name: "Reception", date: "2025-06-15" },
    { name: "Brunch", date: "2025-06-16" },
  ],
};

const houseWarming = {
  title: "Miller House Warming",
  events: [{ name: "Party", date: "2025-07-20" }],
};
```

### 2. ✅ Event Types as First-Class Entities

**Old**: `eventType` was just a string field
**New**: `EventType` is a full table with venue, date, time

**Benefits**:

- Different venues per event
- Different dates and times
- Individual capacity limits
- Separate RSVP tracking
- Better analytics

### 3. ✅ Flexible Attendee Limits

**Old**: `attendeeCount` with no validation
**New**: `attendeeLimit` per guest with validation

```typescript
// Old: No way to enforce limits
guest.attendeeCount = 100; // Oops!

// New: Built-in constraints
guest.attendeeLimit = 2; // Guest + 1
guest.attendeeLimit = 4; // Family of 4
guest.attendeeLimit = -1; // VIP (unlimited)
```

### 4. ✅ Custom Branding

**Old**: Generic styling for all events
**New**: Per-event customization

```typescript
{
  title: "Sarah & John's Wedding",
  groomName: "John Smith",
  brideName: "Sarah Johnson",
  theme: "romantic-rose",
  logoUrl: "/logos/sarah-john.png"
}
```

### 5. ✅ Invite Code Security

**Old**: Public RSVP pages (anyone could submit)
**New**: Secure invite codes

```typescript
// Old: /rsvp (open to anyone)
// New: /rsvp/sarah-john-wedding?code=ABC123

const guest = {
  email: "john@example.com",
  inviteCode: "ABC123", // Unique per guest
};
```

### 6. ✅ Timezone Support

**Old**: No timezone handling
**New**: Full timezone support

```typescript
{
  date: new Date("2025-06-15T16:00:00Z"),
  time: "4:00 PM",
  timezone: "America/New_York",
  epochTime: 1750003200000n // For sorting
}
```

### 7. ✅ Enhanced Email Tracking

**Old**: Basic status tracking
**New**: Comprehensive logging

```typescript
// Old
{ emailType: "confirmation", status: "sent" }

// New
{
  emailType: "invitation",
  subject: "You're Invited!",
  status: "delivered",
  metadata: {
    templateId: "wedding-invite-v2",
    eventId: "abc123",
    openedAt: "2025-05-01T10:00:00Z"
  }
}
```

### 8. ✅ Better Data Organization

**Old**: Flat structure
**New**: Hierarchical organization

```
Old Structure:
- Guest 1 → Event Response (ceremony)
- Guest 2 → Event Response (ceremony)
- Guest 3 → Event Response (ceremony)

New Structure:
- Event Organizer: "Wedding"
  ├── Event Type: "Ceremony"
  │   ├── Guest 1 Response
  │   ├── Guest 2 Response
  │   └── Guest 3 Response
  └── Event Type: "Reception"
      ├── Guest 1 Response
      └── Guest 2 Response
```

## Migration Path

To migrate from old RSVP to new system:

```typescript
// 1. Create EventOrganizer
const organizer = await prisma.eventOrganizer.create({
  data: {
    title: "Your Event Title",
    slug: "your-event-slug",
  },
});

// 2. Convert old guests to GuestList
const guests = await oldDb.guest.findMany();
for (const guest of guests) {
  await prisma.guestList.create({
    data: {
      organizerId: organizer.id,
      fullName: guest.fullName,
      email: guest.email,
      inviteCode: generateInviteCode(),
      attendeeLimit: 2, // Default
    },
  });
}

// 3. Create EventTypes from old eventType strings
const uniqueEventTypes = [...new Set(oldResponses.map((r) => r.eventType))];

for (const eventTypeName of uniqueEventTypes) {
  await prisma.eventType.create({
    data: {
      organizerId: organizer.id,
      slug: generateSlug(eventTypeName),
      name: eventTypeName,
      // ... other fields
    },
  });
}

// 4. Migrate EventResponses
// Map old responses to new structure
```

## When to Use Each System

### Use Old RSVP System When:

- Single, simple event
- No need for multiple event types
- Quick deployment needed
- Minimal customization

### Use New Event Management System When:

- Multiple events (wedding weekend, conference)
- Need custom branding per event
- Different venues/dates for sub-events
- Want to track individual event attendance
- Need attendee limit enforcement
- Require secure invite codes
- Want comprehensive analytics
- Planning to host multiple events over time

## Feature Matrix

| Feature          | Old RSVP | New System    |
| ---------------- | -------- | ------------- |
| Single Event     | ✅       | ✅            |
| Multiple Events  | ❌       | ✅            |
| Custom Branding  | ❌       | ✅            |
| Invite Codes     | ❌       | ✅            |
| Attendee Limits  | Basic    | Advanced      |
| Timezone Support | ❌       | ✅            |
| Multiple Venues  | ❌       | ✅            |
| Guest Notes      | ❌       | ✅            |
| Dietary Reqs     | ❌       | ✅            |
| Email Metadata   | ❌       | ✅            |
| Slug-based URLs  | ❌       | ✅            |
| Event Types      | String   | Full Table    |
| Analytics        | Basic    | Comprehensive |

## Conclusion

The new Event Management System is a **superset** of the old RSVP system:

- Everything the old system could do, the new one can do better
- Adds powerful new features for complex events
- Better organized and more scalable
- Type-safe with proper relationships
- Production-ready for professional use

**Bottom Line**: Use the old system for quick, simple RSVPs. Use the new system for anything beyond that! 🚀

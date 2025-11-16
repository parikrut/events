# Database Schema Visual Diagram

## Entity Relationship Diagram (ASCII)

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         EVENT MANAGEMENT SYSTEM                          │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────────┐
│   EventOrganizer         │  The main event container
│──────────────────────────│  (e.g., "Sarah & John's Wedding")
│ id: String (PK)          │
│ title: String            │  ◄── "Sarah & John's Wedding"
│ slug: String (unique)    │  ◄── "sarah-john-wedding" (for URLs)
│ groomName: String?       │  ◄── Wedding-specific
│ brideName: String?       │  ◄── Wedding-specific
│ hostName: String?        │  ◄── For non-weddings
│ description: String?     │
│ theme: String?           │  ◄── "romantic-rose", "modern-blue"
│ logoUrl: String?         │
│ isActive: Boolean        │
│ createdAt: DateTime      │
│ updatedAt: DateTime      │
└──────────┬───────────────┘
           │
           │ 1:N (One organizer has many...)
           │
           ├──────────────────┐
           │                  │
           ▼                  ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   EventType              │  │   GuestList              │
│──────────────────────────│  │──────────────────────────│
│ id: String (PK)          │  │ id: String (PK)          │
│ organizerId: String (FK) │  │ organizerId: String (FK) │
│ slug: String             │  │ fullName: String         │
│ name: String             │  │ email: String            │
│ description: String?     │  │ phone: String?           │
│ date: DateTime           │  │ attendeeLimit: Int       │  ◄── -1 = unlimited
│ time: String             │  │ isInvited: Boolean       │      1 = solo
│ epochTime: BigInt        │  │ inviteCode: String?      │      2+ = with guests
│ timezone: String         │  │ notes: String?           │
│ country: String?         │  │ createdAt: DateTime      │
│ venue: String            │  │ updatedAt: DateTime      │
│ address: String          │  └──────────┬───────────────┘
│ addressUrl: String?      │             │
│ dressCode: String?       │             │
│ capacity: Int?           │             │
│ isActive: Boolean        │             │
│ createdAt: DateTime      │             │
│ updatedAt: DateTime      │             │
└──────────┬───────────────┘             │
           │                             │
           │ 1:N                         │ 1:N
           │                             │
           └─────────┬───────────────────┘
                     │
                     ▼
         ┌──────────────────────────┐
         │   EventResponse          │  RSVP responses
         │──────────────────────────│
         │ id: String (PK)          │
         │ guestListId: String (FK) │  ──┐
         │ eventTypeId: String (FK) │  ──┤ Unique together
         │ isAttending: Boolean     │    │ (one response per guest per event)
         │ attendeeCount: Int       │
         │ dietaryReqs: String?     │
         │ message: String?         │
         │ createdAt: DateTime      │
         │ updatedAt: DateTime      │
         └──────────────────────────┘

                     ┌──────────────────────────┐
                     │   EmailLog               │  Communication tracking
                     │──────────────────────────│
                     │ id: String (PK)          │
                     │ guestListId: String (FK) │
                     │ emailType: String        │  ◄── invitation, confirmation, reminder
                     │ subject: String?         │
                     │ status: String           │  ◄── sent, delivered, opened, failed
                     │ resendId: String?        │
                     │ error: String?           │
                     │ sentAt: DateTime         │
                     │ metadata: Json?          │
                     └──────────────────────────┘
                                ▲
                                │ N:1
                     ┌──────────┴───────────────┐
                     │                          │
                     │  Links to GuestList      │
                     └──────────────────────────┘
```

## Data Flow Example

### Creating a Wedding Event

```
Step 1: Create Event Organizer
┌────────────────────────────────────┐
│ EventOrganizer                     │
│ ─────────────────────────────────  │
│ title: "Sarah & John's Wedding"   │
│ slug: "sarah-john-wedding"         │
│ groomName: "John Smith"            │
│ brideName: "Sarah Johnson"         │
└────────────────────────────────────┘
         │
         ├─── Step 2: Create Event Types
         │
         ├─► EventType: "Wedding Ceremony"
         │   └─ date: 2025-06-15, time: 4:00 PM, venue: Grand Oak Gardens
         │
         ├─► EventType: "Reception Dinner"
         │   └─ date: 2025-06-15, time: 7:00 PM, venue: Grand Oak Gardens
         │
         └─► EventType: "Sunday Brunch"
             └─ date: 2025-06-16, time: 11:00 AM, venue: Garden Cafe

Step 3: Add Guests
┌────────────────────────────────────┐
│ GuestList                          │
│ ─────────────────────────────────  │
│ Emily Davis (limit: 2)             │ ─► inviteCode: "EMILY2025"
│ Michael Brown (limit: 1)           │ ─► inviteCode: "MICHAEL2025"
│ Johnson Family (limit: 4)          │ ─► inviteCode: "JOHNSON2025"
└────────────────────────────────────┘

Step 4: Send Invitations (logged in EmailLog)
         │
         └─► Email sent to each guest with their inviteCode

Step 5: Guests RSVP
┌─────────────────────────────────────────────────────────────┐
│ Emily visits: /rsvp/sarah-john-wedding?code=EMILY2025       │
│                                                              │
│ She sees all events:                                        │
│   ☑ Ceremony (attending, 2 people)                         │
│   ☑ Reception (attending, 2 people)                        │
│   ☐ Brunch (not attending)                                 │
│                                                              │
│ Creates EventResponse records for each selection            │
└─────────────────────────────────────────────────────────────┘
```

## Attendee Limit Examples

```
┌──────────────────────────────────────────────────────────────┐
│  Guest Name       │ Limit │ Meaning                          │
├──────────────────────────────────────────────────────────────┤
│  John Doe         │  -1   │ Unlimited (VIP, wedding party)   │
│  Jane Smith       │   1   │ Solo invitation (no +1)          │
│  Bob & Alice      │   2   │ Couple / Guest +1                │
│  The Browns       │   4   │ Family of 4                      │
│  Miller Family    │   6   │ Large family                     │
└──────────────────────────────────────────────────────────────┘

Validation:
✅ attendeeCount ≤ attendeeLimit (or limit = -1)
❌ attendeeCount > attendeeLimit (reject!)
```

## Query Examples

### Get all events for an organizer (ordered by date)

```sql
SELECT * FROM "EventType"
WHERE "organizerId" = ?
ORDER BY "epochTime" ASC
```

### Get guest with responses for all events

```sql
SELECT g.*, er.*
FROM "GuestList" g
LEFT JOIN "EventResponse" er ON g.id = er."guestListId"
WHERE g."inviteCode" = ?
```

### Calculate total headcount for an event

```sql
SELECT SUM("attendeeCount") as total
FROM "EventResponse"
WHERE "eventTypeId" = ?
AND "isAttending" = true
```

### Response rate for event

```sql
SELECT
  COUNT(DISTINCT "guestListId") as responded,
  (SELECT COUNT(*) FROM "GuestList" WHERE "organizerId" = ?) as total
FROM "EventResponse"
WHERE "eventTypeId" = ?
```

## Index Strategy

```
Fast Lookups:
┌─────────────────────┬──────────────────────────┐
│ Table               │ Indexes                  │
├─────────────────────┼──────────────────────────┤
│ EventOrganizer      │ slug, isActive           │
│ EventType           │ organizerId, date, epoch │
│ GuestList           │ organizerId, email, code │
│ EventResponse       │ guestId, eventId, status │
│ EmailLog            │ guestId, status, type    │
└─────────────────────┴──────────────────────────┘

Unique Constraints:
• EventOrganizer.slug
• EventType[organizerId + slug]
• GuestList.inviteCode
• GuestList[organizerId + email]
• EventResponse[guestListId + eventTypeId]
```

## Security Model

```
┌────────────────────────────────────────────────────┐
│  Access Level        │  Authentication             │
├────────────────────────────────────────────────────┤
│  Admin               │  NextAuth (email/password)  │
│  Guest (RSVP)        │  Invite code only           │
│  Public (view only)  │  None (if enabled)          │
└────────────────────────────────────────────────────┘

Guest Flow:
1. Receives email with inviteCode
2. Clicks link: /rsvp/event-slug?code=ABC123
3. System looks up guest by code
4. Shows RSVP form (no password needed)
5. Submits responses
6. Receives confirmation
```

## Scalability Notes

```
Current Design Handles:
├─ 1000s of event organizers
├─ 100s of event types per organizer
├─ 10,000s of guests per organizer
└─ 100,000s of event responses

Optimizations Available:
├─ Database indexes (✅ already included)
├─ Prisma query optimization
├─ Redis caching for public pages
├─ CDN for static assets
└─ Connection pooling (PgBouncer)
```

---

**Legend:**

- PK = Primary Key
- FK = Foreign Key
- ? = Optional field
- 1:N = One-to-Many relationship
- ☑ = Selected
- ☐ = Not selected

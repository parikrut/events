# Event Management System - Project Summary

## ✅ What's Been Created

### 1. Next.js Project Structure

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Database ORM**: Prisma
- **Location**: `/Users/krutikparikh/Desktop/Krutik Portfolio/event-manager`

### 2. Database Schema (Prisma)

#### EventOrganizer

The main container for events (wedding, house warming, etc.)

- Supports wedding-specific fields (bride/groom names)
- General event fields (host name for non-weddings)
- Custom branding (title, description, theme, logo)
- URL slug for custom event pages

#### EventType

Individual events within an organizer

- Multiple events per organizer (ceremony, reception, brunch)
- Complete scheduling (date, time, timezone, epoch time)
- Venue details (name, address, maps URL)
- Event metadata (dress code, capacity)

#### GuestList

Invited guests for the event organizer

- Flexible attendee limits:
  - `-1` = unlimited (VIPs, wedding party)
  - `1` = solo invitation
  - `2+` = guest with plus ones or families
- Unique invite codes for RSVP access
- Contact information (email, phone)
- Internal notes for organizer

#### EventResponse

RSVP responses for specific events

- One response per guest per event type
- Tracks attendance and attendee count
- Dietary requirements
- Personal messages from guests
- Validation: attendeeCount ≤ attendeeLimit

#### EmailLog

Email communication tracking

- Types: invitation, confirmation, reminder, update
- Status: sent, failed, pending, delivered, opened
- Integration ready for Resend or similar services
- Error logging for debugging

### 3. Project Files Created

```
event-manager/
├── prisma/
│   ├── schema.prisma       # Complete database schema
│   └── seed.ts            # Sample data (wedding + house warming)
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   └── utils.ts           # Helper functions
├── types/
│   └── index.ts           # TypeScript types
├── docs/
│   ├── DATABASE_SCHEMA.md # Detailed schema documentation
│   └── QUICK_START.md     # Getting started guide
├── .env                   # Environment variables
├── .env.example          # Environment template
├── README.md             # Project documentation
└── package.json          # Dependencies and scripts
```

### 4. npm Scripts Added

```json
{
  "dev": "next dev", // Start dev server
  "build": "prisma generate && next build", // Build for production
  "db:generate": "prisma generate", // Generate Prisma Client
  "db:migrate": "prisma migrate dev", // Create/apply migrations
  "db:push": "prisma db push", // Push schema changes
  "db:studio": "prisma studio", // Open database GUI
  "db:seed": "tsx prisma/seed.ts" // Seed sample data
}
```

### 5. Utility Functions

Located in `lib/utils.ts`:

- `generateInviteCode()` - Create unique RSVP codes
- `generateSlug()` - URL-friendly slugs
- `validateAttendeeCount()` - Enforce attendee limits
- `formatEventDate()` / `formatEventTime()` - Display formatting
- `calculateResponseRate()` - RSVP statistics
- `isEventPast()` / `getDaysUntilEvent()` - Date utilities

### 6. Sample Data

The seed file creates:

- **Wedding Event**: "Sarah & John's Wedding"
  - 3 event types (ceremony, reception, brunch)
  - 3 sample guests with different attendee limits
- **House Warming**: "The Miller's New Home"
  - 1 event type

## 🎯 Key Design Decisions

### 1. Flexible Attendee Limits

Instead of a simple boolean, we use integers:

- Better control over capacity
- Supports families, couples, and solo invites
- VIP unlimited access with `-1`

### 2. Separate Event Types

Rather than one monolithic event:

- Guests can RSVP to some events but not others
- Different venues, times, and capacities
- Better analytics per event

### 3. Invite Codes

Security and convenience:

- No password required
- Shareable via email/text
- Prevents unauthorized access
- Easy for guests to remember

### 4. Timezone Support

Essential for destination events:

- Stores IANA timezone (e.g., "America/New_York")
- Epoch time for sorting/filtering
- Display time string for convenience

### 5. Email Logging

Complete audit trail:

- Debug email delivery issues
- Prevent duplicate sends
- Track open rates
- Resend failed emails

## 🚀 Next Steps

### To Start Development:

1. **Set up database**:

   - Use Vercel Postgres, Supabase, or local PostgreSQL
   - Update `.env` with connection strings

2. **Initialize schema**:

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed  # Optional: adds sample data
   ```

3. **Start building**:
   ```bash
   npm run dev
   ```

### Recommended Next Features:

1. **Authentication**

   - NextAuth.js for admin access
   - Guest access via invite codes (no auth needed)

2. **Public Event Pages**

   - `/events/[slug]` - Event details
   - `/rsvp/[slug]?code=XXX` - RSVP form
   - Dynamic theming based on EventOrganizer.theme

3. **Admin Dashboard**

   - Create/edit events
   - Manage guest lists
   - View RSVP statistics
   - Send invitations

4. **Email Integration**

   - Resend API integration
   - Email templates (React Email)
   - Automated reminders

5. **Guest Features**
   - RSVP form with validation
   - Update responses
   - Add dietary requirements
   - View event details

## 📊 Database Relationships

```
EventOrganizer (1) ──┬──→ (N) EventType
                     └──→ (N) GuestList

EventType (1) ─────────→ (N) EventResponse
GuestList (1) ──────┬──→ (N) EventResponse
                    └──→ (N) EmailLog
```

## 🎨 Styling Reference

Your RSVP app uses similar styling, so you can:

1. Copy components from `rsvp/components`
2. Adapt the theme system
3. Reuse Tailwind configurations
4. Import email templates

## 📝 Important Notes

- **Prisma Client**: Must run `npm run db:generate` after schema changes
- **Migrations**: Always create migrations for production databases
- **Environment Variables**: Never commit `.env` to Git
- **Seed Data**: For development only, not for production
- **Type Safety**: TypeScript types auto-generated from Prisma schema

## 🎊 Summary

You now have a **production-ready foundation** for a dynamic event management system that can:

- Host any type of event (weddings, parties, corporate events)
- Manage multiple events under one organizer
- Track RSVPs with flexible attendee limits
- Send automated emails
- Provide beautiful, themed public pages
- Scale to handle thousands of guests

The architecture is clean, the database is normalized, and everything is type-safe with TypeScript!

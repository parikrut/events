# Host Dashboard Implementation Plan (B2C SaaS)

## Overview

This is a **B2C SaaS platform** where:

- **Hosts** (businesses/individuals) register with name, email, password
- Each host creates their own **Event Lineups** (weddings, parties, etc.)
- Each host manages their own guest lists and RSVPs
- **No cross-host access** - hosts only see their own data

**Terminology:**

- **Host** = User/business who registers and manages events
- **Event Lineup** = Main event (e.g., "Sarah & John's Wedding")
- **Event** = Individual events within lineup (ceremony, reception, etc.)

---

## ✅ Database Schema - ALREADY UPDATED

The schema has been updated with:

- ✅ Host model (with password, sessions)
- ✅ Session model (for auth)
- ✅ EventOrganizer → EventLineup (renamed)
- ✅ organizerId → lineupId (renamed)
- ✅ Removed theme and logoUrl fields
- ✅ Added hostId to EventLineup

**Next Step:** Run migration to apply changes

---

## 📦 Dependencies to Install

```bash
npm install bcryptjs @types/bcryptjs
npm install jsonwebtoken @types/jsonwebtoken  # For session tokens
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select @radix-ui/react-tabs
npm install @radix-ui/react-avatar @radix-ui/react-label
npm install @radix-ui/react-separator @radix-ui/react-table
npm install lucide-react  # Icons
npm install date-fns  # Date formatting
npm install xlsx  # Excel import/export
npm install recharts  # Charts for stats (optional)
```

---

## 🔐 Authentication System

### Pages:

1. `/auth/register` - Host registration (name, email, password)
2. `/auth/login` - Host login (email, password)

### Auth Flow:

```
1. Host registers → Hash password → Create Host record
2. Host logs in → Verify password → Create Session → Set HTTP-only cookie
3. Middleware checks session on /dashboard/* routes
4. Logout → Delete session → Clear cookie
```

### Session Management:

- Use JWT tokens stored in HTTP-only cookies
- 30-day expiration
- Refresh on each request
- Delete on logout

---

## 🎨 Dashboard Routes (Simplified)

**Design Pattern:** All create/edit operations use **Shadcn Dialog** components (no separate pages)

```
PUBLIC ROUTES:
/auth/register                          # Host registration
/auth/login                             # Host login
/events/[slug]                          # Public RSVP page (existing)
/events/[slug]/thank-you                # Thank you page (existing)

PROTECTED ROUTES (require auth):
/dashboard                              # Event Lineups List
                                        # - Card view of all lineups
                                        # - Create lineup (dialog)
                                        # - Edit lineup (dialog)
                                        # - Stats per lineup

/dashboard/[lineupId]                   # Events List for lineup
                                        # - Table of events in this lineup
                                        # - Create event (dialog)
                                        # - Edit event (dialog)
                                        # - Delete event (confirm dialog)

/dashboard/[lineupId]/guests            # Guest List
                                        # - Table showing guests + invited events
                                        # - Create guest + select events (dialog)
                                        # - Edit guest + update events (dialog)
                                        # - Bulk upload Excel (dialog with preview)
                                        # - Bulk update Excel (dialog with preview)
                                        # - Delete guest (confirm dialog)
                                        # NOTE: Invitations created when guest is created/edited

/dashboard/[lineupId]/responses         # RSVP Responses
                                        # - View all responses
                                        # - Filter by event
                                        # - Export to Excel
```

**Key Changes:**

- ❌ No `/new` or `/edit` routes - everything uses dialogs
- ❌ No `/invitations` route - handled during guest creation/edit
- ✅ When creating/editing guest → show event checkboxes → store in Invitation table
- ✅ Cleaner URLs, better UX

---

## 📄 Files to Create (Simplified)

### 1. Authentication (8 files)

```
/lib/auth.ts                            # Auth helpers (hashPassword, verifyPassword, createSession)
/lib/session.ts                         # Session management (getSession, setSession, deleteSession)
/middleware.ts                          # Protect /dashboard routes
/lib/actions/auth.ts                    # Server actions (register, login, logout)

/app/auth/register/page.tsx
/app/auth/login/page.tsx
/components/auth/register-form.tsx
/components/auth/login-form.tsx
```

### 2. Dashboard Layout (3 files)

```
/app/dashboard/layout.tsx               # Sidebar + header layout
/components/dashboard/sidebar.tsx       # Navigation (minimal - just lineups)
/components/dashboard/header.tsx        # Top bar with host menu
```

### 3. Event Lineups Page (7 files)

```
/app/dashboard/page.tsx                            # Event lineups list (main page)

/components/dashboard/lineup-card.tsx              # Lineup display card
/components/dashboard/lineup-dialog.tsx            # Create/Edit lineup dialog (Shadcn)
/components/dashboard/lineup-form.tsx              # Form inside dialog
/components/dashboard/lineup-stats.tsx             # Stats widget

/lib/actions/lineup.ts                             # Server actions
/types/lineup.ts                                   # TypeScript types
```

### 4. Events Page (6 files)

```
/app/dashboard/[lineupId]/page.tsx                 # Events list for lineup

/components/dashboard/event-table.tsx              # Events data table
/components/dashboard/event-dialog.tsx             # Create/Edit event dialog (Shadcn)
/components/dashboard/event-form.tsx               # Form inside dialog

/lib/actions/event.ts                              # Server actions
/types/event.ts                                    # TypeScript types
```

### 5. Guests Page (9 files)

```
/app/dashboard/[lineupId]/guests/page.tsx          # Guests list + invited events

/components/dashboard/guest-table.tsx              # Data table showing guests + events
/components/dashboard/guest-dialog.tsx             # Create/Edit guest dialog (Shadcn)
/components/dashboard/guest-form.tsx               # Form with event checkboxes
/components/dashboard/excel-upload-dialog.tsx      # Bulk upload/update dialog (Shadcn)
/components/dashboard/excel-preview-table.tsx      # Preview before import

/lib/actions/guest.ts                              # CRUD + bulk operations
/lib/actions/invitation.ts                         # Auto-created during guest save
/lib/excel-utils.ts                                # Excel parsing/generation
```

### 6. Responses Page (4 files)

```
/app/dashboard/[lineupId]/responses/page.tsx       # RSVP responses view

/components/dashboard/response-table.tsx           # Responses data table
/components/dashboard/response-stats.tsx           # Charts/metrics

/lib/actions/response.ts                           # Fetch responses, export Excel
```

### 7. UI Components (~12 files)

```
/components/ui/label.tsx                           # Shadcn label
/components/ui/select.tsx                          # Shadcn select
/components/ui/textarea.tsx                        # Shadcn textarea
/components/ui/dialog.tsx                          # Shadcn dialog (CRITICAL)
/components/ui/dropdown-menu.tsx                   # Shadcn dropdown
/components/ui/separator.tsx                       # Shadcn separator
/components/ui/table.tsx                           # Shadcn table
/components/ui/badge.tsx                           # Shadcn badge
/components/ui/skeleton.tsx                        # Shadcn skeleton
/components/ui/alert.tsx                           # Shadcn alert
/components/ui/avatar.tsx                          # Shadcn avatar
/components/ui/switch.tsx                          # Shadcn switch
```

### 8. Shared Dashboard Components (6 files)

```
/components/dashboard/stat-card.tsx                # Metric display
/components/dashboard/empty-state.tsx              # Empty state illustration
/components/dashboard/delete-confirm-dialog.tsx    # Reusable delete confirmation
/components/dashboard/page-header.tsx              # Page title + actions
/components/dashboard/host-menu.tsx                # Dropdown menu (logout, profile)
/components/dashboard/loading-state.tsx            # Loading skeletons
```

**Total:** ~45 files (down from 80+)

**Key Simplifications:**

- ❌ No separate `/new` and `/edit` pages - all in dialogs
- ❌ No `/invitations` route - handled in guest dialog
- ✅ Guest dialog includes event selection checkboxes
- ✅ All mutations happen via dialogs with proper forms

---

## 🛠️ Server Actions

### Auth (`/lib/actions/auth.ts`)

```typescript
registerHost(name, email, password)    # Hash password, create Host
loginHost(email, password)             # Verify password, create Session
logoutHost()                           # Delete Session
getCurrentHost()                       # Get logged-in host from session cookie
updateHostProfile(data)                # Update name, email, image
changePassword(oldPwd, newPwd)         # Verify old, hash new
```

### Lineups (`/lib/actions/lineup.ts`)

```typescript
createLineup(data)                     # hostId from session
updateLineup(id, data)                 # Check hostId ownership
deleteLineup(id)                       # Check hostId ownership
getMyLineups()                         # Get lineups WHERE hostId = currentHost
getLineupById(id)                      # Check hostId ownership
getLineupStats(id)                     # RSVP stats (check ownership)
```

### Events (`/lib/actions/event.ts`)

```typescript
createEvent(lineupId, data)            # Verify lineup.hostId = currentHost
updateEvent(id, data)                  # Verify via lineup.hostId
deleteEvent(id)                        # Verify via lineup.hostId
getEventsByLineup(lineupId)            # Verify ownership
```

### Guests (`/lib/actions/guest.ts`)

```typescript
createGuest(lineupId, data, eventIds[])           # Verify lineup.hostId, create guest + invitations
updateGuest(id, data, eventIds[])                 # Verify ownership, update guest + sync invitations
deleteGuest(id)                                   # Verify ownership, cascade delete invitations
bulkCreateGuests(lineupId, guests[], eventIds[])  # Parse Excel → create guests + invitations
bulkUpdateGuests(lineupId, guests[], eventIds[])  # Parse Excel → update guests + invitations
exportGuestsToExcel(lineupId)                     # Fetch guests with invited events → Excel
getGuestsByLineup(lineupId)                       # Verify ownership, include invited events
```

### Invitations (`/lib/actions/invitation.ts`)

```typescript
syncInvitations(guestId, eventIds[])   # Delete old, create new invitations
                                       # Called automatically by createGuest/updateGuest
```

### Responses (`/lib/actions/response.ts`)

```typescript
getResponsesByLineup(lineupId)         # Verify ownership
getResponsesByEvent(eventId)           # Verify ownership
getResponseStats(lineupId)             # Calculate metrics
exportResponsesToExcel(lineupId)       # Generate Excel report
```

**🔒 Security Rule:** ALL actions must verify hostId ownership before any operation

---

## 🔒 Middleware

Create `/middleware.ts`:

```typescript
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Protect all /dashboard routes
  if (path.startsWith("/dashboard")) {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  // Redirect logged-in users away from auth pages
  if (path.startsWith("/auth")) {
    const session = await getSession(request);
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
```

---

## 📊 Dashboard Features

### Event Lineups Page (`/dashboard`)

Show:

- Card grid of all lineups
- Stats per lineup (guests, RSVPs, events)
- "Create Lineup" button → opens dialog
- Click card to edit → opens dialog
- Click "View Events" → navigate to `/dashboard/[lineupId]`

### Events Page (`/dashboard/[lineupId]`)

Show:

- Table of events in lineup
- Columns: Name, Date, Time, Venue, Invited/RSVPs
- "Create Event" button → opens dialog
- Row actions: Edit (dialog), Delete (confirm dialog)
- Breadcrumb: Dashboard > Lineup Name

### Guest Management (`/dashboard/[lineupId]/guests`)

Show:

- Table with columns: Name, Email, Invited Events (badges), RSVP Status
- "Add Guest" button → dialog with event checkboxes
- "Bulk Upload" button → Excel upload dialog with preview
- Row actions: Edit (dialog with event checkboxes), Delete (confirm)
- Excel export button
- Search/filter by name, email, event

**Guest Dialog Flow:**

1. Enter name, email (optional), attendee limit
2. Show checkboxes of all events in lineup
3. On save → create guest + create invitations for checked events

### Response Viewing (`/dashboard/[lineupId]/responses`)

Show:

- Filter by event dropdown
- Filter by status (attending/not attending)
- Table: Guest, Event, Status, Attendee Count, Submitted At
- Export to Excel button
- Stats cards at top

---

## 📈 Excel Features

### Import Template (Simplified):

```
| Full Name* | Email | Attendee Limit |
|------------|-------|----------------|
| John Doe   | j@... | 2              |
| Jane Smith |       | -1             |
```

**Note:** Event selection happens in the dialog AFTER upload

### Import Flow:

1. Click "Bulk Upload" → dialog opens
2. Upload Excel/CSV file
3. Parse with `xlsx` library
4. Show preview table in dialog
5. Validate data (fullName required, email optional)
6. Show checkboxes for events (applies to ALL guests in upload)
7. Click "Import" → create guests + invitations
8. Show success/error toast

### Export Flow:

1. Click "Export to Excel" button
2. Fetch all guests with invited events
3. Generate Excel with columns: Name, Email, Attendee Limit, Invited Events (comma-separated), RSVP Status
4. Download file

---

## 🎯 Implementation Phases

### Phase 1: Foundation (Week 1)

1. ✅ Schema already updated
2. Run Prisma migration
3. Install dependencies
4. Create auth system (register, login, sessions)
5. Create middleware
6. Create dashboard layout (sidebar, header)

### Phase 2: Lineup Management (Week 2)

1. `/dashboard` page - lineup cards
2. Lineup create/edit dialog with form
3. Stats display per lineup
4. All with hostId checks

### Phase 3: Events Management (Week 2-3)

1. `/dashboard/[lineupId]` page - events table
2. Event create/edit dialog with form
3. Delete confirmation dialog
4. Breadcrumb navigation

### Phase 4: Guest Management (Week 3)

1. `/dashboard/[lineupId]/guests` page - guest table
2. Guest create/edit dialog with event checkboxes
3. Excel upload dialog with preview
4. Excel export functionality
5. Auto-create invitations on guest save

### Phase 5: RSVP Responses (Week 3-4)

1. `/dashboard/[lineupId]/responses` page
2. Response table with filters
3. Stats dashboard
4. Excel export

### Phase 5: Polish

1. Loading states
2. Error handling
3. Mobile responsive
4. Toast notifications
5. Confirmation dialogs

---

## 🔧 Files to Update

### Existing files that need updates:

1. `/lib/actions/events.ts` → Update to use `lineupId` and `EventLineup`
2. `/lib/actions/rsvp.ts` → Update model references
3. `/prisma/seed.ts` → Update to use new schema
4. `/app/events/[slug]/page.tsx` → Update queries
5. All imports of EventOrganizer → EventLineup

---

## 🎨 Design System

### Colors (from existing theme):

- Primary: Blue (#3b82f6) → Groom side
- Secondary: Pink (#ec4899) → Bride side
- Purple: (#8b5cf6) → Blend
- Success: Green (#10b981)
- Danger: Red (#ef4444)
- Warning: Amber (#f59e0b)

### Layout:

- Sidebar: 256px, sticky
- Content: Max-width 1400px, centered
- Cards: White bg, shadow-sm, rounded-lg
- Tables: Striped rows, hover effect

### Components:

- Buttons: Gradient on primary actions
- Forms: Labels above inputs
- Tables: Pagination, sorting icons
- Stats: Large numbers, trend indicators

---

## 📝 Key Differences from Original Plan

**Changed:**

- ❌ No "admin" role - all users are equal "hosts"
- ❌ No cross-user access - each host sees only THEIR data
- ✅ EventOrganizer → EventLineup (better naming)
- ✅ organizerId → lineupId (consistency)
- ✅ User → Host (clearer term)
- ✅ Removed theme & logoUrl fields
- ✅ All actions verify hostId ownership

**Security Model:**

```typescript
// Every query must check ownership
const lineup = await prisma.eventLineup.findFirst({
  where: {
    id: lineupId,
    hostId: session.hostId, // ← CRITICAL
  },
});

if (!lineup) throw new Error("Not found or unauthorized");
```

---

## 🚀 Next Steps

1. **Run Migration:**

   ```bash
   npx prisma migrate dev --name add-host-and-rename-to-lineup
   npx prisma generate
   ```

2. **Update Seed File:**

   - Create a default Host
   - Update EventOrganizer → EventLineup
   - Link lineup to host

3. **Start Phase 1:**
   - Install dependencies
   - Create auth pages
   - Build login/register

Ready to start implementation? I recommend beginning with Phase 1 (auth + layout).

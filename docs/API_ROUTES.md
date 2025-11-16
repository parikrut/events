# API Routes Structure

This document outlines a suggested API structure for your Event Management System.

## Recommended Route Structure

```
app/
├── api/
│   ├── organizers/
│   │   ├── route.ts                    # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts                # GET, PUT, DELETE
│   │       ├── events/
│   │       │   └── route.ts            # GET all events for organizer
│   │       ├── guests/
│   │       │   └── route.ts            # GET all guests for organizer
│   │       └── stats/
│   │           └── route.ts            # GET statistics
│   │
│   ├── events/
│   │   ├── route.ts                    # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts                # GET, PUT, DELETE
│   │       ├── responses/
│   │       │   └── route.ts            # GET all responses for event
│   │       └── stats/
│   │           └── route.ts            # GET event statistics
│   │
│   ├── guests/
│   │   ├── route.ts                    # GET (list), POST (create)
│   │   ├── import/
│   │   │   └── route.ts                # POST (bulk import)
│   │   └── [id]/
│   │       ├── route.ts                # GET, PUT, DELETE
│   │       └── responses/
│   │           └── route.ts            # GET guest's responses
│   │
│   ├── rsvp/
│   │   ├── verify/
│   │   │   └── route.ts                # POST (verify invite code)
│   │   ├── submit/
│   │   │   └── route.ts                # POST (submit RSVP)
│   │   └── [code]/
│   │       └── route.ts                # GET guest info by code
│   │
│   └── emails/
│       ├── send/
│       │   └── route.ts                # POST (send email)
│       ├── invite/
│       │   └── route.ts                # POST (send invitation)
│       └── remind/
│           └── route.ts                # POST (send reminder)
│
└── (public routes)
    ├── events/
    │   └── [slug]/
    │       └── page.tsx                # Public event page
    └── rsvp/
        └── [slug]/
            └── page.tsx                # RSVP form
```

## API Endpoint Examples

### 1. Event Organizers

#### `GET /api/organizers`

List all event organizers (admin)

```typescript
// app/api/organizers/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const organizers = await prisma.eventOrganizer.findMany({
    include: {
      eventTypes: true,
      guestLists: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ organizers });
}
```

#### `POST /api/organizers`

Create new event organizer

```typescript
export async function POST(request: Request) {
  const data = await request.json();

  const organizer = await prisma.eventOrganizer.create({
    data: {
      title: data.title,
      slug: data.slug,
      groomName: data.groomName,
      brideName: data.brideName,
      description: data.description,
      theme: data.theme,
    },
  });

  return NextResponse.json({ organizer }, { status: 201 });
}
```

#### `GET /api/organizers/[id]`

Get single organizer with all relations

```typescript
// app/api/organizers/[id]/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const organizer = await prisma.eventOrganizer.findUnique({
    where: { id: params.id },
    include: {
      eventTypes: {
        orderBy: { epochTime: "asc" },
      },
      guestLists: true,
    },
  });

  if (!organizer) {
    return NextResponse.json({ error: "Organizer not found" }, { status: 404 });
  }

  return NextResponse.json({ organizer });
}
```

### 2. Event Types

#### `POST /api/events`

Create new event type

```typescript
// app/api/events/route.ts
export async function POST(request: Request) {
  const data = await request.json();

  const event = await prisma.eventType.create({
    data: {
      organizerId: data.organizerId,
      slug: data.slug,
      name: data.name,
      date: new Date(data.date),
      time: data.time,
      epochTime: BigInt(new Date(data.date).getTime()),
      timezone: data.timezone,
      venue: data.venue,
      address: data.address,
      addressUrl: data.addressUrl,
      dressCode: data.dressCode,
    },
  });

  return NextResponse.json({ event }, { status: 201 });
}
```

#### `GET /api/events/[id]/stats`

Get event statistics

```typescript
// app/api/events/[id]/stats/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;

  // Total invited guests
  const event = await prisma.eventType.findUnique({
    where: { id: eventId },
    include: {
      organizer: {
        include: {
          guestLists: true,
        },
      },
    },
  });

  // Responses for this event
  const responses = await prisma.eventResponse.findMany({
    where: { eventTypeId: eventId },
  });

  const totalInvited = event?.organizer.guestLists.length || 0;
  const totalResponded = responses.length;
  const totalAttending = responses.filter((r) => r.isAttending).length;
  const totalHeadcount = responses
    .filter((r) => r.isAttending)
    .reduce((sum, r) => sum + r.attendeeCount, 0);

  const stats = {
    totalInvited,
    totalResponded,
    totalAttending,
    totalNotAttending: responses.filter((r) => !r.isAttending).length,
    totalHeadcount,
    responseRate: totalInvited > 0 ? (totalResponded / totalInvited) * 100 : 0,
    attendanceRate:
      totalResponded > 0 ? (totalAttending / totalResponded) * 100 : 0,
  };

  return NextResponse.json({ stats });
}
```

### 3. RSVP Routes

#### `POST /api/rsvp/verify`

Verify invite code and return guest info

```typescript
// app/api/rsvp/verify/route.ts
export async function POST(request: Request) {
  const { inviteCode, organizerSlug } = await request.json();

  const guest = await prisma.guestList.findFirst({
    where: {
      inviteCode,
      organizer: {
        slug: organizerSlug,
      },
    },
    include: {
      organizer: {
        include: {
          eventTypes: {
            orderBy: { epochTime: "asc" },
          },
        },
      },
      eventResponses: true,
    },
  });

  if (!guest) {
    return NextResponse.json({ error: "Invalid invite code" }, { status: 404 });
  }

  return NextResponse.json({ guest });
}
```

#### `POST /api/rsvp/submit`

Submit RSVP responses

```typescript
// app/api/rsvp/submit/route.ts
import { validateAttendeeCount } from "@/lib/utils";

export async function POST(request: Request) {
  const { guestListId, responses, message } = await request.json();

  // Get guest to check attendee limit
  const guest = await prisma.guestList.findUnique({
    where: { id: guestListId },
  });

  if (!guest) {
    return NextResponse.json({ error: "Guest not found" }, { status: 404 });
  }

  // Validate attendee counts
  for (const response of responses) {
    if (!validateAttendeeCount(response.attendeeCount, guest.attendeeLimit)) {
      return NextResponse.json(
        { error: `Attendee count exceeds limit of ${guest.attendeeLimit}` },
        { status: 400 }
      );
    }
  }

  // Create or update responses
  const results = await Promise.all(
    responses.map(async (response: any) => {
      return prisma.eventResponse.upsert({
        where: {
          guestListId_eventTypeId: {
            guestListId,
            eventTypeId: response.eventTypeId,
          },
        },
        update: {
          isAttending: response.isAttending,
          attendeeCount: response.attendeeCount,
          dietaryReqs: response.dietaryReqs,
          message,
        },
        create: {
          guestListId,
          eventTypeId: response.eventTypeId,
          isAttending: response.isAttending,
          attendeeCount: response.attendeeCount,
          dietaryReqs: response.dietaryReqs,
          message,
        },
      });
    })
  );

  // Log confirmation email (to be sent)
  await prisma.emailLog.create({
    data: {
      guestListId,
      emailType: "confirmation",
      status: "pending",
    },
  });

  return NextResponse.json({
    success: true,
    responses: results,
  });
}
```

### 4. Guest Management

#### `POST /api/guests/import`

Bulk import guests from CSV/Excel

```typescript
// app/api/guests/import/route.ts
import { generateInviteCode } from "@/lib/utils";

export async function POST(request: Request) {
  const { organizerId, guests } = await request.json();

  const created = await prisma.$transaction(
    guests.map((guest: any) =>
      prisma.guestList.create({
        data: {
          organizerId,
          fullName: guest.fullName,
          email: guest.email,
          phone: guest.phone,
          attendeeLimit: guest.attendeeLimit || 2,
          inviteCode: generateInviteCode(),
          notes: guest.notes,
        },
      })
    )
  );

  return NextResponse.json({
    success: true,
    count: created.length,
    guests: created,
  });
}
```

### 5. Email Routes

#### `POST /api/emails/invite`

Send invitation emails

```typescript
// app/api/emails/invite/route.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  const { guestListIds, organizerId } = await request.json();

  const organizer = await prisma.eventOrganizer.findUnique({
    where: { id: organizerId },
    include: { eventTypes: true },
  });

  const guests = await prisma.guestList.findMany({
    where: {
      id: { in: guestListIds },
      organizerId,
    },
  });

  const results = await Promise.all(
    guests.map(async (guest) => {
      try {
        const { data, error } = await resend.emails.send({
          from: "events@yourdomain.com",
          to: guest.email,
          subject: `You're Invited! ${organizer?.title}`,
          html: `
            <h1>You're Invited!</h1>
            <p>Hi ${guest.fullName},</p>
            <p>You're invited to ${organizer?.title}</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/rsvp/${organizer?.slug}?code=${guest.inviteCode}">
              RSVP Now
            </a>
          `,
        });

        await prisma.emailLog.create({
          data: {
            guestListId: guest.id,
            emailType: "invitation",
            status: error ? "failed" : "sent",
            resendId: data?.id,
            error: error?.message,
          },
        });

        return { guest: guest.email, success: !error };
      } catch (err) {
        return { guest: guest.email, success: false, error: err };
      }
    })
  );

  return NextResponse.json({ results });
}
```

## Public Pages

### Event Details Page

```typescript
// app/events/[slug]/page.tsx
import { prisma } from "@/lib/prisma";

export default async function EventPage({
  params,
}: {
  params: { slug: string };
}) {
  const organizer = await prisma.eventOrganizer.findUnique({
    where: { slug: params.slug },
    include: {
      eventTypes: {
        orderBy: { epochTime: "asc" },
      },
    },
  });

  if (!organizer) {
    return <div>Event not found</div>;
  }

  return (
    <div>
      <h1>{organizer.title}</h1>
      {organizer.groomName && organizer.brideName && (
        <p>
          {organizer.groomName} & {organizer.brideName}
        </p>
      )}
      {organizer.hostName && <p>Hosted by {organizer.hostName}</p>}

      <div>
        {organizer.eventTypes.map((event) => (
          <div key={event.id}>
            <h2>{event.name}</h2>
            <p>
              {event.date.toLocaleDateString()} at {event.time}
            </p>
            <p>{event.venue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### RSVP Form Page

```typescript
// app/rsvp/[slug]/page.tsx
export default async function RSVPPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { code?: string };
}) {
  // Verify invite code
  // Show RSVP form
  // Handle submission

  return <RSVPForm slug={params.slug} code={searchParams.code} />;
}
```

## Error Handling

```typescript
// lib/api-errors.ts
export class ApiError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
  }
}

export const handleApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: error.message },
      { status: error.statusCode }
    );
  }

  console.error("Unexpected error:", error);
  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
};
```

## Rate Limiting

```typescript
// lib/rate-limit.ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_URL!,
  token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});
```

This structure provides a solid foundation for your Event Management System API! 🚀

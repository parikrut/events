# Event Management System

A dynamic event management platform built with Next.js, Prisma, and Tailwind CSS. Host weddings, house warmings, and any type of event with customizable themes and RSVP management.

## Features

- **Multi-Event Support**: Create and manage multiple event types under one organizer
- **Custom Themes**: Personalize with bride/groom names, logos, and color themes
- **Guest Management**: Track RSVPs with flexible attendee limits
- **Event Types**: Support for ceremonies, receptions, and custom event types
- **Email Notifications**: Automated invitation and confirmation emails
- **Timezone Support**: Schedule events across different timezones
- **Responsive Design**: Beautiful UI built with Tailwind CSS

## Database Schema

### EventOrganizer

The main event theme/organizer (e.g., "Sarah & John's Wedding")

- Custom branding with title, description, and logo
- Support for wedding-specific fields (bride/groom) and general events (host)
- Unique slug for custom URLs

### EventType

Individual events within an organizer

- Date, time, and timezone support
- Venue details with address and maps
- Dress code and capacity management
- Multiple events per organizer (ceremony, reception, etc.)

### GuestList

Guests associated with the event organizer

- Attendee limits per guest (-1 for unlimited)
- Unique invite codes for RSVP access
- Contact information and internal notes

### EventResponse

RSVP responses for specific events

- Attendance tracking per event
- Attendee count management
- Dietary requirements and custom messages

### EmailLog

Email communication tracking

- Status tracking (sent, delivered, opened, failed)
- Support for invitations, confirmations, reminders
- Integration with email services (Resend, etc.)

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

Update `.env` with your database credentials and API keys.

3. Initialize the database:

```bash
npx prisma migrate dev --name init
```

4. Generate Prisma Client:

```bash
npx prisma generate
```

5. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

### Option 1: Local PostgreSQL

Install PostgreSQL locally and create a database:

```bash
createdb event_manager
```

### Option 2: Vercel Postgres

1. Create a Vercel Postgres database
2. Copy the connection strings to your `.env` file

### Option 3: Supabase

1. Create a new Supabase project
2. Get the connection string from Project Settings > Database
3. Update `.env` with the connection string

## Development

### Prisma Commands

```bash
# Create a new migration
npx prisma migrate dev --name <migration-name>

# Reset database
npx prisma migrate reset

# Open Prisma Studio (database GUI)
npx prisma studio

# Generate Prisma Client after schema changes
npx prisma generate
```

### Project Structure

```
event-manager/
├── app/              # Next.js app directory
├── components/       # React components
├── lib/             # Utilities and Prisma client
├── prisma/          # Database schema and migrations
│   └── schema.prisma
├── public/          # Static assets
└── styles/          # Global styles
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Environment Variables for Production

Make sure to set these in your hosting platform:

- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NO_SSL`
- `RESEND_API_KEY`
- `NEXTAUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Email**: Resend (or similar)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## License

MIT

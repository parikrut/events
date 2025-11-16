# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Set Up Your Database

You have three options:

#### Option A: Vercel Postgres (Recommended for beginners)

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Create a Postgres database
vercel postgres create event-manager-db

# Get connection strings and add to .env
```

#### Option B: Supabase (Free tier available)

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string
5. Update `.env` file

#### Option C: Local PostgreSQL

```bash
# Install PostgreSQL (macOS)
brew install postgresql@16
brew services start postgresql@16

# Create database
createdb event_manager

# Update .env with local connection
POSTGRES_PRISMA_URL="postgresql://your_username@localhost:5432/event_manager"
POSTGRES_URL_NO_SSL="postgresql://your_username@localhost:5432/event_manager"
```

### Step 2: Configure Environment Variables

Update your `.env` file:

```env
# Database (replace with your actual values)
POSTGRES_PRISMA_URL="your-database-url-here"
POSTGRES_URL_NO_SSL="your-database-url-here"

# Email (optional for now)
RESEND_API_KEY=""

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Set Up Database Schema

```bash
# Generate Prisma Client
npm run db:generate

# Create database tables
npm run db:migrate

# Seed with sample data (optional)
npm run db:seed
```

### Step 4: Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

## 📊 Explore Your Database

View and edit your data with Prisma Studio:

```bash
npm run db:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555)

## 🎨 Next Steps

### Create Your First Event

1. **Option 1: Use Prisma Studio** (GUI)

   - Run `npm run db:studio`
   - Click "EventOrganizer"
   - Click "Add record"
   - Fill in the details

2. **Option 2: Use the Seed File**
   - Edit `prisma/seed.ts`
   - Customize the sample data
   - Run `npm run db:seed`

### Basic Event Structure

```typescript
// 1. Create Event Organizer
{
  title: "Sarah & John's Wedding",
  slug: "sarah-john-wedding",
  groomName: "John",
  brideName: "Sarah",
  theme: "romantic-rose"
}

// 2. Create Event Types
{
  name: "Wedding Ceremony",
  slug: "ceremony",
  date: "2025-06-15",
  time: "4:00 PM",
  venue: "Grand Oak Gardens"
}

// 3. Add Guests
{
  fullName: "Emily Davis",
  email: "emily@example.com",
  attendeeLimit: 2, // Guest + 1
  inviteCode: "EMILY2025"
}
```

## 🛠️ Common Tasks

### Add a New Field to a Model

1. Edit `prisma/schema.prisma`
2. Run `npm run db:migrate`
3. Name your migration (e.g., "add-phone-field")

### Reset Database (WARNING: Deletes all data)

```bash
npm run db:migrate -- reset
```

### Update Schema Without Migration

```bash
npm run db:push
```

Use this for development only, not production!

## 🎯 Development Workflow

1. **Make schema changes** in `prisma/schema.prisma`
2. **Create migration**: `npm run db:migrate`
3. **Prisma Client auto-updates** with new types
4. **Build your features** with type-safe database access

## 📖 Learn More

- [Database Schema Documentation](./DATABASE_SCHEMA.md)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🆘 Troubleshooting

### "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

### "Error: Environment variable not found"

- Check your `.env` file exists
- Make sure database URLs are set
- Restart your dev server

### Migration Failed

```bash
# Reset and try again
npm run db:migrate -- reset
npm run db:migrate
```

### Port 3000 Already in Use

```bash
# Use a different port
PORT=3001 npm run dev
```

## 🎊 You're Ready!

Your event management system is set up. Start building amazing event experiences! 🚀

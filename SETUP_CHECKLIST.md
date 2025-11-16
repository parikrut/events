# Setup Checklist ✅

Use this checklist to get your Event Management System up and running!

## Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm or yarn installed
- [ ] Git installed (optional)
- [ ] Code editor (VS Code recommended)

## Database Setup

Choose ONE option:

### Option A: Vercel Postgres (Easiest)

- [ ] Install Vercel CLI: `npm i -g vercel`
- [ ] Login: `vercel login`
- [ ] Create database: `vercel postgres create`
- [ ] Copy connection strings to `.env`

### Option B: Supabase (Free Tier)

- [ ] Go to https://supabase.com
- [ ] Create account
- [ ] Create new project
- [ ] Get connection string from Settings > Database
- [ ] Add to `.env` file

### Option C: Local PostgreSQL

- [ ] Install PostgreSQL
  - macOS: `brew install postgresql@16`
  - Ubuntu: `sudo apt install postgresql`
  - Windows: Download from postgresql.org
- [ ] Start PostgreSQL service
- [ ] Create database: `createdb event_manager`
- [ ] Update `.env` with local connection

## Project Setup

- [ ] Navigate to project: `cd event-manager`
- [ ] Install dependencies: `npm install`
- [ ] Copy environment file: `cp .env.example .env`
- [ ] Update `.env` with your database URLs
- [ ] Generate Prisma Client: `npm run db:generate`
- [ ] Create database tables: `npm run db:migrate`
- [ ] Seed sample data (optional): `npm run db:seed`

## Verify Installation

- [ ] No errors during migration
- [ ] Run development server: `npm run dev`
- [ ] Open http://localhost:3000
- [ ] Page loads successfully
- [ ] Open Prisma Studio: `npm run db:studio`
- [ ] Verify tables exist (EventOrganizer, EventType, GuestList, EventResponse, EmailLog)
- [ ] If you seeded, verify sample data appears

## Optional: Email Setup

- [ ] Sign up for Resend: https://resend.com
- [ ] Get API key
- [ ] Add to `.env`: `RESEND_API_KEY="your-key"`
- [ ] Verify domain (for production)

## Optional: Authentication Setup

- [ ] Install NextAuth: `npm install next-auth`
- [ ] Generate secret: `openssl rand -base64 32`
- [ ] Add to `.env`: `NEXTAUTH_SECRET="your-secret"`
- [ ] Configure providers (Google, GitHub, etc.)

## Development Workflow

- [ ] Read `docs/QUICK_START.md`
- [ ] Review `docs/DATABASE_SCHEMA.md`
- [ ] Check `PROJECT_SUMMARY.md`
- [ ] Explore `prisma/schema.prisma`
- [ ] Try creating an event in Prisma Studio

## Next Steps

- [ ] Plan your first event structure
- [ ] Design the RSVP form UI
- [ ] Create admin dashboard routes
- [ ] Build public event pages
- [ ] Set up email templates
- [ ] Add form validation
- [ ] Implement RSVP logic

## Troubleshooting

If you encounter issues:

### "Cannot find module '@prisma/client'"

```bash
npm run db:generate
```

### "Error: P1001: Can't reach database server"

- Check database is running
- Verify connection string in `.env`
- Check firewall settings

### "Migration failed"

```bash
npm run db:migrate -- reset
npm run db:migrate
```

### "Port 3000 in use"

```bash
PORT=3001 npm run dev
```

### TypeScript errors in types/index.ts

- Expected until Prisma Client is generated
- Run `npm run db:generate`
- Restart VS Code TypeScript server

## Success Criteria

You're ready to develop when:

✅ `npm run dev` starts without errors  
✅ http://localhost:3000 loads  
✅ `npm run db:studio` opens and shows your tables  
✅ No TypeScript errors in the editor  
✅ Sample data appears (if seeded)

## Resources

- **Quick Start**: `docs/QUICK_START.md`
- **Schema Docs**: `docs/DATABASE_SCHEMA.md`
- **Comparison**: `docs/RSVP_COMPARISON.md`
- **Prisma Docs**: https://www.prisma.io/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind CSS**: https://tailwindcss.com/docs

## Support

Having trouble? Check:

1. Is your database running?
2. Are environment variables set correctly?
3. Did you run `db:generate` after schema changes?
4. Did you restart the dev server?

---

**Ready to build amazing event experiences! 🎉**

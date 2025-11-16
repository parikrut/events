# Dynamic Event Pages

## Overview

Created dynamic event pages with wedding-themed design similar to the RSVP project.

## URL Structure

```
events.krutikparikh.ca/[event-slug]
```

Example: `events.krutikparikh.ca/krutik-hunny-wedding`

## Features

### Wedding Design

- **Split Gradient Background**: Blue gradient on groom's side (left), pink gradient on bride's side (right)
- **Header Layout**:
  - Groom name (top left) - Blue gradient text
  - Custom SVG heart logo (center) - Shows first letter of groom + heart + first letter of bride
  - Bride name (top right) - Pink gradient text
- **Animated Background**: Pulsing gradient orbs following RSVP design patterns

### Components Created

1. **`/app/events/[slug]/page.tsx`** - Dynamic event page route
2. **`/components/heart-logo.tsx`** - Custom SVG heart logo with initials
3. **`/lib/actions/events.ts`** - Server action to fetch event data

### Design System

- Follows RSVP project's design language
- Uses Tailwind CSS v4 with `bg-linear-to-*` gradients
- Animated pulse effects with staggered delays
- Glass morphism effects (backdrop blur)
- Responsive design (mobile-first)

## Event Categories

Currently configured for `wedding` category. Database schema supports:

- wedding
- corporate
- birthday
- house-warming
- conference

## Testing

### Sample Data

Run the seed to create test data:

```bash
npx prisma db seed
```

This creates:

- Event: "Krutik & Hunny's Wedding"
- Slug: `krutik-hunny-wedding`
- 2 Events: Wedding Ceremony & Reception Dinner

### Access

Visit: `http://localhost:3001/events/krutik-hunny-wedding`

## Next Steps

1. Create RSVP form page at `/rsvp/[slug]`
2. Add different designs for other event categories (corporate, birthday, etc.)
3. Implement guest authentication
4. Add event management dashboard

import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Create a host
  const host = await prisma.host.create({
    data: {
      name: "Krutik Parikh",
      email: "krutik@example.com",
      passwordHash: await hashPassword("password123"),
      emailVerified: new Date(),
    },
  });

  // Create an event lineup
  const wedding = await prisma.eventLineup.create({
    data: {
      hostId: host.id,
      title: "Krutik & Hunny's Wedding",
      slug: "krutik-hunny-wedding",
      eventCategory: "wedding",
      organizerName: "Krutik Parikh",
      organizerEmail: "krutik@example.com",
      groomName: "Krutik Parikh",
      brideName: "Hunny Shah",
      description: "Join us as we celebrate our special day!",
      isActive: true,
    },
  });

  // Create events
  const ceremony = await prisma.event.create({
    data: {
      lineupId: wedding.id,
      slug: "ceremony",
      name: "Wedding Ceremony",
      date: new Date("2025-12-15T16:00:00Z"),
      time: "4:00 PM",
      epochTime: BigInt(new Date("2025-12-15T16:00:00Z").getTime()),
      timezone: "America/New_York",
      venue: "The Grand Ballroom",
      address: "123 Wedding Lane, New York, NY 10001",
      addressUrl: "https://maps.google.com/?q=123+Wedding+Lane+New+York+NY",
      dressCode: "Formal",
      isActive: true,
    },
  });

  const reception = await prisma.event.create({
    data: {
      lineupId: wedding.id,
      slug: "reception",
      name: "Reception Dinner",
      date: new Date("2025-12-15T19:00:00Z"),
      time: "7:00 PM",
      epochTime: BigInt(new Date("2025-12-15T19:00:00Z").getTime()),
      timezone: "America/New_York",
      venue: "The Grand Ballroom",
      address: "123 Wedding Lane, New York, NY 10001",
      addressUrl: "https://maps.google.com/?q=123+Wedding+Lane+New+York+NY",
      dressCode: "Cocktail Attire",
      isActive: true,
    },
  });

  // Create guests with invitations
  const guest1 = await prisma.guest.create({
    data: {
      lineupId: wedding.id,
      fullName: "John Doe",
      email: "john.doe@example.com",
    },
  });

  await prisma.invitation.create({
    data: {
      guestId: guest1.id,
      eventId: ceremony.id,
      attendeeLimit: 2,
    },
  });

  await prisma.invitation.create({
    data: {
      guestId: guest1.id,
      eventId: reception.id,
      attendeeLimit: -1, // unlimited
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      lineupId: wedding.id,
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
    },
  });

  await prisma.invitation.create({
    data: {
      guestId: guest2.id,
      eventId: ceremony.id,
      attendeeLimit: 4,
    },
  });

  await prisma.invitation.create({
    data: {
      guestId: guest2.id,
      eventId: reception.id,
      attendeeLimit: 4,
    },
  });

  console.log("✅ Created host:", host.email);
  console.log("✅ Created event lineup:", wedding.title);
  console.log("✅ Created 2 events");
  console.log("✅ Created 2 guests with invitations");
  console.log("🎉 Seed completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

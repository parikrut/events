import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  const wedding = await prisma.eventOrganizer.create({
    data: {
      title: "Krutik & Hunny's Wedding",
      slug: "krutik-hunny-wedding",
      eventCategory: "wedding",
      organizerName: "Krutik Parikh & Hunny Shah",
      organizerEmail: "krutik@example.com",
      groomName: "Krutik Parikh",
      brideName: "Hunny Shah",
      description: "Join us as we celebrate our special day!",
      theme: "romantic-blue-pink",
      isActive: true,
    },
  });

  const ceremony = await prisma.event.create({
    data: {
      organizerId: wedding.id,
      slug: "ceremony",
      name: "Wedding Ceremony",
      date: new Date("2025-12-15T16:00:00Z"),
      time: "4:00 PM",
      epochTime: BigInt(new Date("2025-12-15T16:00:00Z").getTime()),
      timezone: "America/New_York",
      country: "United States",
      venue: "The Grand Ballroom",
      address: "123 Wedding Lane, New York, NY 10001",
      addressUrl: "https://maps.google.com/?q=123+Wedding+Lane+New+York+NY",
      dressCode: "Formal",
      capacity: 200,
      isActive: true,
    },
  });

  const reception = await prisma.event.create({
    data: {
      organizerId: wedding.id,
      slug: "reception",
      name: "Reception Dinner",
      date: new Date("2025-12-15T19:00:00Z"),
      time: "7:00 PM",
      epochTime: BigInt(new Date("2025-12-15T19:00:00Z").getTime()),
      timezone: "America/New_York",
      country: "United States",
      venue: "The Grand Ballroom",
      address: "123 Wedding Lane, New York, NY 10001",
      addressUrl: "https://maps.google.com/?q=123+Wedding+Lane+New+York+NY",
      dressCode: "Cocktail Attire",
      capacity: 200,
      isActive: true,
    },
  });

  // Create guests with invitations
  const guest1 = await prisma.guest.create({
    data: {
      organizerId: wedding.id,
      fullName: "John Doe",
      email: "john.doe@example.com",
      phone: "+1-555-0001",
      attendeeLimit: 2,
    },
  });

  await prisma.invitation.create({
    data: {
      guestId: guest1.id,
      eventId: ceremony.id,
    },
  });

  await prisma.invitation.create({
    data: {
      guestId: guest1.id,
      eventId: reception.id,
    },
  });

  const guest2 = await prisma.guest.create({
    data: {
      organizerId: wedding.id,
      fullName: "Jane Smith",
      email: "jane.smith@example.com",
      phone: "+1-555-0002",
      attendeeLimit: 4,
    },
  });

  await prisma.invitation.create({
    data: {
      guestId: guest2.id,
      eventId: ceremony.id,
    },
  });

  await prisma.invitation.create({
    data: {
      guestId: guest2.id,
      eventId: reception.id,
    },
  });

  console.log("✅ Created:", wedding.title);
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

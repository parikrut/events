import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function removeDuplicateGuests() {
    console.log('🔍 Finding duplicate guests...\n');

    // Find all guests
    const guests = await prisma.guest.findMany({
        orderBy: [
            { lineupId: 'asc' },
            { fullName: 'asc' },
            { createdAt: 'asc' }
        ],
    });

    // Group by lineupId + fullName
    const grouped = new Map<string, any[]>();

    guests.forEach(guest => {
        const key = `${guest.lineupId}::${guest.fullName}`;
        if (!grouped.has(key)) {
            grouped.set(key, []);
        }
        grouped.get(key)!.push(guest);
    });

    // Find duplicates
    const duplicates = Array.from(grouped.entries())
        .filter(([_, guests]) => guests.length > 1);

    if (duplicates.length === 0) {
        console.log('✅ No duplicate guests found!');
        return;
    }

    console.log(`Found ${duplicates.length} duplicate guest names:\n`);

    for (const [key, guestList] of duplicates) {
        const [lineupId, fullName] = key.split('::');
        console.log(`\n📋 Guest: "${fullName}" (${guestList.length} duplicates)`);
        console.log(`   Lineup ID: ${lineupId}`);

        // Keep the first one (oldest), delete the rest
        const [keepGuest, ...deleteGuests] = guestList;

        console.log(`   ✅ Keeping: ${keepGuest.id} (created ${keepGuest.createdAt})`);

        for (const guest of deleteGuests) {
            console.log(`   ❌ Deleting: ${guest.id} (created ${guest.createdAt})`);
            await prisma.guest.delete({
                where: { id: guest.id }
            });
        }
    }

    console.log('\n✅ Duplicate removal complete!');
}

removeDuplicateGuests()
    .catch(console.error)
    .finally(() => prisma.$disconnect());

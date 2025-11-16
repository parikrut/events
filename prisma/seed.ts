import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🌱 Seeding database...')

    // Create a sample wedding event organizer
    const weddingOrganizer = await prisma.eventOrganizer.create({
        data: {
            title: "Sarah & John's Wedding",
            slug: 'sarah-john-wedding',
            organizerName: 'Sarah Johnson',
            organizerEmail: 'sarah.johnson@example.com',
            groomName: 'John Smith',
            brideName: 'Sarah Johnson',
            description: 'Join us as we celebrate our special day!',
            theme: 'romantic-rose',
            isActive: true,
        },
    })

    console.log('✅ Created Event Organizer:', weddingOrganizer.title)

    // Create event types for the wedding
    const ceremony = await prisma.eventType.create({
        data: {
            organizerId: weddingOrganizer.id,
            slug: 'ceremony',
            name: 'Wedding Ceremony',
            description: 'Join us as we exchange our vows',
            date: new Date('2025-06-15T16:00:00Z'),
            time: '4:00 PM',
            epochTime: BigInt(new Date('2025-06-15T16:00:00Z').getTime()),
            timezone: 'America/New_York',
            country: 'United States',
            venue: 'Grand Oak Gardens',
            address: '123 Wedding Lane, Brooklyn, NY 11201',
            addressUrl: 'https://maps.google.com/?q=123+Wedding+Lane+Brooklyn+NY',
            dressCode: 'Formal / Black Tie Optional',
            capacity: 200,
            isActive: true,
        },
    })

    const reception = await prisma.eventType.create({
        data: {
            organizerId: weddingOrganizer.id,
            slug: 'reception',
            name: 'Reception Dinner',
            description: 'Dinner, dancing, and celebration!',
            date: new Date('2025-06-15T19:00:00Z'),
            time: '7:00 PM',
            epochTime: BigInt(new Date('2025-06-15T19:00:00Z').getTime()),
            timezone: 'America/New_York',
            country: 'United States',
            venue: 'Grand Oak Gardens - Ballroom',
            address: '123 Wedding Lane, Brooklyn, NY 11201',
            addressUrl: 'https://maps.google.com/?q=123+Wedding+Lane+Brooklyn+NY',
            dressCode: 'Formal / Black Tie Optional',
            capacity: 200,
            isActive: true,
        },
    })

    const brunch = await prisma.eventType.create({
        data: {
            organizerId: weddingOrganizer.id,
            slug: 'brunch',
            name: 'Sunday Farewell Brunch',
            description: 'Casual brunch with the newlyweds',
            date: new Date('2025-06-16T11:00:00Z'),
            time: '11:00 AM',
            epochTime: BigInt(new Date('2025-06-16T11:00:00Z').getTime()),
            timezone: 'America/New_York',
            country: 'United States',
            venue: 'The Garden Cafe',
            address: '456 Brunch Ave, Brooklyn, NY 11201',
            addressUrl: 'https://maps.google.com/?q=456+Brunch+Ave+Brooklyn+NY',
            dressCode: 'Casual',
            capacity: 50,
            isActive: true,
        },
    })

    console.log('✅ Created Event Types:', ceremony.name, reception.name, brunch.name)

    // Create sample guests
    const guests = [
        {
            fullName: 'Emily Davis',
            email: 'emily.davis@example.com',
            phone: '+1-555-0101',
            attendeeLimit: 2,
            inviteCode: 'EMILY2025',
            invitedTo: [ceremony.id, reception.id, brunch.id], // All events
        },
        {
            fullName: 'Michael Brown',
            email: 'michael.brown@example.com',
            phone: '+1-555-0102',
            attendeeLimit: 1,
            inviteCode: 'MICHAEL2025',
            invitedTo: [ceremony.id, reception.id], // Only ceremony and reception
        },
        {
            fullName: 'The Johnson Family',
            email: 'johnson.family@example.com',
            phone: '+1-555-0103',
            attendeeLimit: 4,
            inviteCode: 'JOHNSON2025',
            invitedTo: [ceremony.id, reception.id, brunch.id], // All events
        },
    ]

    for (const guestData of guests) {
        const { invitedTo, ...guestInfo } = guestData
        const guest = await prisma.guestList.create({
            data: {
                ...guestInfo,
                organizerId: weddingOrganizer.id,
            },
        })

        // Create event invitations
        for (const eventId of invitedTo) {
            await prisma.eventInvitation.create({
                data: {
                    guestListId: guest.id,
                    eventTypeId: eventId,
                    isInvited: true,
                },
            })
        }

        console.log('✅ Created Guest:', guest.fullName, `- Invited to ${invitedTo.length} events`)
    }

    // Create a house warming event organizer
    const houseWarmingOrganizer = await prisma.eventOrganizer.create({
        data: {
            title: "The Miller's New Home Celebration",
            slug: 'miller-house-warming',
            organizerName: 'David Miller',
            organizerEmail: 'david.miller@example.com',
            hostName: 'David & Lisa Miller',
            description: "We're excited to share our new home with you!",
            theme: 'modern-blue',
            isActive: true,
        },
    })

    console.log('✅ Created Event Organizer:', houseWarmingOrganizer.title)

    // Create house warming event
    await prisma.eventType.create({
        data: {
            organizerId: houseWarmingOrganizer.id,
            slug: 'house-warming',
            name: 'House Warming Party',
            description: 'Come tour our new home and celebrate with us!',
            date: new Date('2025-07-20T15:00:00Z'),
            time: '3:00 PM',
            epochTime: BigInt(new Date('2025-07-20T15:00:00Z').getTime()),
            timezone: 'America/Los_Angeles',
            country: 'United States',
            venue: 'The Miller Residence',
            address: '789 New Home Street, San Francisco, CA 94102',
            addressUrl: 'https://maps.google.com/?q=789+New+Home+Street+San+Francisco+CA',
            dressCode: 'Casual',
            isActive: true,
        },
    })

    console.log('✅ Database seeded successfully!')
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

/**
 * JSON Import Utility for Event Management System
 * 
 * This script imports a complete event (organizer, events, guests) from a JSON file.
 * Usage: npx tsx scripts/import-json.ts <path-to-json-file>
 * Example: npx tsx scripts/import-json.ts templates/event-template.json
 */

import { PrismaClient } from '@prisma/client'
import { readFileSync } from 'fs'
import { generateInviteCode, dateToEpoch } from '../lib/utils'

const prisma = new PrismaClient()

interface EventOrganizerData {
    title: string
    slug: string
    organizerName: string
    organizerEmail: string
    groomName?: string
    brideName?: string
    hostName?: string
    description?: string
    theme?: string
    logoUrl?: string
}

interface EventData {
    slug: string
    name: string
    description?: string
    date: string
    time: string
    timezone: string
    country?: string
    venue: string
    address: string
    addressUrl?: string
    dressCode?: string
    capacity?: number
}

interface GuestData {
    fullName: string
    email: string
    phone?: string
    attendeeLimit: number
    invitedToEvents: string[]
    notes?: string
}

interface EventTemplate {
    eventOrganizer: EventOrganizerData
    events: EventData[]
    guests: GuestData[]
    instructions?: any
}

async function importFromJSON(filePath: string) {
    console.log('🚀 Starting JSON import...\n')

    // Read JSON file
    const fileContent = readFileSync(filePath, 'utf-8')
    const data: EventTemplate = JSON.parse(fileContent)

    console.log('📋 Importing event:', data.eventOrganizer.title)
    console.log('📊 Events to create:', data.events.length)
    console.log('👥 Guests to import:', data.guests.length)
    console.log('')

    // 1. Create Event Organizer
    console.log('🎯 Step 1: Creating Event Organizer...')
    const organizer = await prisma.eventOrganizer.create({
        data: {
            title: data.eventOrganizer.title,
            slug: data.eventOrganizer.slug,
            organizerName: data.eventOrganizer.organizerName,
            organizerEmail: data.eventOrganizer.organizerEmail,
            groomName: data.eventOrganizer.groomName || undefined,
            brideName: data.eventOrganizer.brideName || undefined,
            hostName: data.eventOrganizer.hostName || undefined,
            description: data.eventOrganizer.description || undefined,
            theme: data.eventOrganizer.theme || undefined,
            logoUrl: data.eventOrganizer.logoUrl || undefined,
            isActive: true,
        },
    })
    console.log(`  ✅ Created organizer: ${organizer.title}`)
    console.log(`  📧 Contact: ${organizer.organizerEmail}`)
    console.log('')

    // 2. Create Event Types
    console.log('📅 Step 2: Creating Event Types...')
    const eventMap = new Map<string, string>() // slug -> id

    for (const eventData of data.events) {
        const date = new Date(eventData.date)

        const eventType = await prisma.eventType.create({
            data: {
                organizerId: organizer.id,
                slug: eventData.slug,
                name: eventData.name,
                description: eventData.description || undefined,
                date,
                time: eventData.time,
                epochTime: dateToEpoch(date),
                timezone: eventData.timezone,
                country: eventData.country || undefined,
                venue: eventData.venue,
                address: eventData.address,
                addressUrl: eventData.addressUrl || undefined,
                dressCode: eventData.dressCode || undefined,
                capacity: eventData.capacity || undefined,
                isActive: true,
            },
        })

        eventMap.set(eventData.slug, eventType.id)
        console.log(`  ✅ ${eventType.name}`)
        console.log(`     📍 ${eventType.venue}`)
        console.log(`     📅 ${eventType.date.toLocaleDateString()} at ${eventType.time}`)
    }
    console.log('')

    // 3. Create Guests and Event Invitations
    console.log('👥 Step 3: Creating Guests and Invitations...')
    let guestCount = 0
    let invitationCount = 0

    for (const guestData of data.guests) {
        // Create guest
        const guest = await prisma.guestList.create({
            data: {
                organizerId: organizer.id,
                fullName: guestData.fullName,
                email: guestData.email,
                phone: guestData.phone || undefined,
                attendeeLimit: guestData.attendeeLimit,
                inviteCode: generateInviteCode(),
                notes: guestData.notes || undefined,
            },
        })

        guestCount++

        // Create event invitations
        const invitedEventNames: string[] = []
        for (const eventSlug of guestData.invitedToEvents) {
            const eventId = eventMap.get(eventSlug)

            if (!eventId) {
                console.log(`  ⚠️  Warning: Event '${eventSlug}' not found for ${guest.fullName}`)
                continue
            }

            await prisma.eventInvitation.create({
                data: {
                    guestListId: guest.id,
                    eventTypeId: eventId,
                    isInvited: true,
                },
            })

            invitationCount++
            const eventName = data.events.find(e => e.slug === eventSlug)?.name || eventSlug
            invitedEventNames.push(eventName)
        }

        const limitDisplay = guest.attendeeLimit === -1 ? 'Unlimited' : guest.attendeeLimit.toString()
        console.log(`  ✅ ${guest.fullName}`)
        console.log(`     📧 ${guest.email}`)
        console.log(`     🎟️  Invite Code: ${guest.inviteCode}`)
        console.log(`     👥 Attendee Limit: ${limitDisplay}`)
        console.log(`     🎪 Invited to: ${invitedEventNames.join(', ')}`)
    }

    console.log('')
    console.log('═══════════════════════════════════════════════')
    console.log('✅ IMPORT COMPLETED SUCCESSFULLY!')
    console.log('═══════════════════════════════════════════════')
    console.log('')
    console.log('📊 Summary:')
    console.log(`  🎯 Event Organizer: ${organizer.title}`)
    console.log(`  📅 Events Created: ${data.events.length}`)
    console.log(`  👥 Guests Imported: ${guestCount}`)
    console.log(`  🎟️  Invitations Created: ${invitationCount}`)
    console.log('')
    console.log('🔗 Next Steps:')
    console.log(`  1. View data: npm run db:studio`)
    console.log(`  2. Send invite codes to guests via email`)
    console.log(`  3. Share RSVP link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/rsvp/${organizer.slug}`)
    console.log('')
    console.log('💡 Guest RSVP Links:')
    console.log(`  ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/rsvp/${organizer.slug}?code=INVITE_CODE`)
    console.log('')
}

// Get file path from command line
const args = process.argv.slice(2)
if (args.length === 0) {
    console.error('❌ Error: Please provide a JSON file path')
    console.log('Usage: npx tsx scripts/import-json.ts <path-to-json-file>')
    console.log('Example: npx tsx scripts/import-json.ts templates/event-template.json')
    process.exit(1)
}

const filePath = args[0]

importFromJSON(filePath)
    .catch((e) => {
        console.error('❌ Import failed:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

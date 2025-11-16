/**
 * CSV Import Utility for Event Management System
 * 
 * This script imports data from CSV files into the database.
 * Usage: npx tsx scripts/import-csv.ts
 */

import { PrismaClient } from '@prisma/client'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'
import { join } from 'path'
import { generateInviteCode, dateToEpoch } from '../lib/utils'

const prisma = new PrismaClient()

interface OrganizerCSV {
    title: string
    slug: string
    organizerName: string
    organizerEmail: string
    groomName?: string
    brideName?: string
    hostName?: string
    description?: string
    theme?: string
}

interface EventTypeCSV {
    organizerSlug: string
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
    capacity?: string
}

interface GuestListCSV {
    organizerSlug: string
    fullName: string
    email: string
    phone?: string
    attendeeLimit: string
    invitedToEvents: string // Comma-separated event slugs
    notes?: string
}

async function importOrganizers(filePath: string) {
    console.log('📋 Importing Event Organizers...')

    const fileContent = readFileSync(filePath, 'utf-8')
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as OrganizerCSV[]

    const organizers = []

    for (const record of records) {
        const organizer = await prisma.eventOrganizer.create({
            data: {
                title: record.title,
                slug: record.slug,
                organizerName: record.organizerName,
                organizerEmail: record.organizerEmail,
                groomName: record.groomName || undefined,
                brideName: record.brideName || undefined,
                hostName: record.hostName || undefined,
                description: record.description || undefined,
                theme: record.theme || undefined,
                isActive: true,
            },
        })

        console.log(`  ✅ Created: ${organizer.title}`)
        organizers.push(organizer)
    }

    return organizers
}

async function importEventTypes(filePath: string) {
    console.log('📋 Importing Event Types...')

    const fileContent = readFileSync(filePath, 'utf-8')
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as EventTypeCSV[]

    const eventTypes = []

    for (const record of records) {
        // Find organizer by slug
        const organizer = await prisma.eventOrganizer.findUnique({
            where: { slug: record.organizerSlug },
        })

        if (!organizer) {
            console.log(`  ❌ Organizer not found: ${record.organizerSlug}`)
            continue
        }

        const date = new Date(record.date)

        const eventType = await prisma.eventType.create({
            data: {
                organizerId: organizer.id,
                slug: record.slug,
                name: record.name,
                description: record.description || undefined,
                date,
                time: record.time,
                epochTime: dateToEpoch(date),
                timezone: record.timezone,
                country: record.country || undefined,
                venue: record.venue,
                address: record.address,
                addressUrl: record.addressUrl || undefined,
                dressCode: record.dressCode || undefined,
                capacity: record.capacity ? parseInt(record.capacity) : undefined,
                isActive: true,
            },
        })

        console.log(`  ✅ Created: ${eventType.name} (${organizer.title})`)
        eventTypes.push(eventType)
    }

    return eventTypes
}

async function importGuestList(filePath: string) {
    console.log('📋 Importing Guest List...')

    const fileContent = readFileSync(filePath, 'utf-8')
    const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    }) as GuestListCSV[]

    const guests = []

    for (const record of records) {
        // Find organizer by slug
        const organizer = await prisma.eventOrganizer.findUnique({
            where: { slug: record.organizerSlug },
        })

        if (!organizer) {
            console.log(`  ❌ Organizer not found: ${record.organizerSlug}`)
            continue
        }

        // Create guest
        const guest = await prisma.guestList.create({
            data: {
                organizerId: organizer.id,
                fullName: record.fullName,
                email: record.email,
                phone: record.phone || undefined,
                attendeeLimit: parseInt(record.attendeeLimit),
                inviteCode: generateInviteCode(),
                notes: record.notes || undefined,
            },
        })

        // Parse invited events (comma-separated slugs)
        const eventSlugs = record.invitedToEvents
            .split(',')
            .map(s => s.trim())
            .filter(Boolean)

        // Create event invitations
        for (const eventSlug of eventSlugs) {
            const eventType = await prisma.eventType.findFirst({
                where: {
                    slug: eventSlug,
                    organizerId: organizer.id,
                },
            })

            if (!eventType) {
                console.log(`  ⚠️  Event not found: ${eventSlug} for ${guest.fullName}`)
                continue
            }

            await prisma.eventInvitation.create({
                data: {
                    guestListId: guest.id,
                    eventTypeId: eventType.id,
                    isInvited: true,
                },
            })
        }

        console.log(`  ✅ Created: ${guest.fullName} - Invited to: ${eventSlugs.join(', ')} - Code: ${guest.inviteCode}`)
        guests.push(guest)
    }

    return guests
}

async function main() {
    console.log('🚀 Starting CSV Import...\n')

    const templatesDir = join(process.cwd(), 'templates')

    try {
        // Import in order: Organizers -> Event Types -> Guests

        // 1. Import Event Organizers
        const organizersFile = join(templatesDir, 'event-organizer-template.csv')
        await importOrganizers(organizersFile)
        console.log()

        // 2. Import Event Types
        const eventTypesFile = join(templatesDir, 'event-type-template.csv')
        await importEventTypes(eventTypesFile)
        console.log()

        // 3. Import Guest List
        const guestListFile = join(templatesDir, 'guest-list-template.csv')
        const guests = await importGuestList(guestListFile)
        console.log()

        console.log('✅ Import completed successfully!')
        console.log(`\n📊 Summary:`)
        console.log(`  - Event Organizers: Check database`)
        console.log(`  - Event Types: Check database`)
        console.log(`  - Guests: ${guests.length} imported`)
        console.log(`\n💡 Run 'npm run db:studio' to view your data`)

    } catch (error) {
        console.error('❌ Import failed:', error)
        throw error
    }
}

main()
    .catch((e) => {
        console.error('Error:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })

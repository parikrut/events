// Custom types for the Event Management System

import {
    EventOrganizer,
    EventType,
    GuestList,
    EventResponse,
    EmailLog
} from '@prisma/client'

// Extended types with relations

export type EventOrganizerWithRelations = EventOrganizer & {
    eventTypes: EventType[]
    guestLists: GuestList[]
}

export type EventTypeWithRelations = EventType & {
    organizer: EventOrganizer
    eventResponses: EventResponse[]
}

export type GuestListWithRelations = GuestList & {
    organizer: EventOrganizer
    eventResponses: EventResponse[]
    emailLogs: EmailLog[]
}

export type EventResponseWithRelations = EventResponse & {
    guestList: GuestList
    eventType: EventType
}

// Form submission types

export type CreateEventOrganizerInput = {
    title: string
    slug: string
    groomName?: string
    brideName?: string
    hostName?: string
    description?: string
    theme?: string
    logoUrl?: string
}

export type CreateEventTypeInput = {
    organizerId: string
    slug: string
    name: string
    description?: string
    date: Date
    time: string
    timezone: string
    country?: string
    venue: string
    address: string
    addressUrl?: string
    dressCode?: string
    capacity?: number
}

export type CreateGuestListInput = {
    organizerId: string
    fullName: string
    email: string
    phone?: string
    attendeeLimit: number
    notes?: string
}

export type CreateEventResponseInput = {
    guestListId: string
    eventTypeId: string
    isAttending: boolean
    attendeeCount: number
    dietaryReqs?: string
    message?: string
}

export type UpdateEventResponseInput = Partial<CreateEventResponseInput>

// RSVP Form types

export type RSVPFormData = {
    inviteCode: string
    responses: {
        eventTypeId: string
        isAttending: boolean
        attendeeCount: number
        dietaryReqs?: string
    }[]
    message?: string
}

// Email types

export type EmailType = 'invitation' | 'confirmation' | 'reminder' | 'update'
export type EmailStatus = 'sent' | 'failed' | 'pending' | 'delivered' | 'opened'

export type SendEmailInput = {
    guestListId: string
    emailType: EmailType
    subject?: string
}

// Statistics types

export type EventStats = {
    totalInvited: number
    totalResponded: number
    totalAttending: number
    totalNotAttending: number
    responseRate: number
    attendanceRate: number
    totalHeadcount: number
}

export type EventTypeStats = EventStats & {
    eventTypeId: string
    eventTypeName: string
    eventDate: Date
}

// API Response types

export type ApiResponse<T = unknown> = {
    success: boolean
    data?: T
    error?: string
    message?: string
}

// Public event page types

export type PublicEventOrganizer = Omit<EventOrganizer, 'createdAt' | 'updatedAt'> & {
    eventTypes: PublicEventType[]
}

export type PublicEventType = Omit<EventType, 'createdAt' | 'updatedAt' | 'organizerId'>

export type GuestRSVPSession = {
    guestListId: string
    fullName: string
    email: string
    attendeeLimit: number
    organizerId: string
}

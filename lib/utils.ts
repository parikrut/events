/**
 * Utility functions for the Event Management System
 */

/**
 * Generate a unique invite code for guests
 */
export function generateInviteCode(length: number = 8): string {
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Excluding similar-looking chars
    let result = ''
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length))
    }
    return result
}

/**
 * Generate a URL-friendly slug from text
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
}

/**
 * Convert a Date to epoch time (milliseconds)
 */
export function dateToEpoch(date: Date): bigint {
    return BigInt(date.getTime())
}

/**
 * Format date for display
 */
export function formatEventDate(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: timezone,
    }).format(date)
}

/**
 * Format time for display
 */
export function formatEventTime(date: Date, timezone: string): string {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        timeZone: timezone,
        timeZoneName: 'short',
    }).format(date)
}

/**
 * Validate attendee count against limit
 */
export function validateAttendeeCount(count: number, limit: number): boolean {
    if (limit === -1) return true // No limit
    return count > 0 && count <= limit
}

/**
 * Calculate response rate for an event
 */
export function calculateResponseRate(responded: number, total: number): number {
    if (total === 0) return 0
    return Math.round((responded / total) * 100)
}

/**
 * Check if event date is in the past
 */
export function isEventPast(eventDate: Date): boolean {
    return eventDate < new Date()
}

/**
 * Get days until event
 */
export function getDaysUntilEvent(eventDate: Date): number {
    const now = new Date()
    const diffTime = eventDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
}

/**
 * Get timezone abbreviation
 */
export function getTimezoneAbbr(timezone: string, date: Date = new Date()): string {
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        timeZoneName: 'short',
    })
    const parts = formatter.formatToParts(date)
    const timeZonePart = parts.find(part => part.type === 'timeZoneName')
    return timeZonePart?.value || timezone
}

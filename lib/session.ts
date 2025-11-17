import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

const SESSION_COOKIE_NAME = "event-session";

export interface SessionData {
    hostId: string;
    email: string;
}

/**
 * Create a new session for a host
 */
export async function createSession(hostId: string, email: string): Promise<string> {
    // Create JWT token that never expires (or has very long expiration)
    const token = await new SignJWT({ hostId, email })
        .setProtectedHeader({ alg: "HS256" })
        .setIssuedAt()
        .sign(JWT_SECRET);

    // Set HTTP-only cookie (no expiration = session cookie, but we'll set far future)
    const farFuture = new Date();
    farFuture.setFullYear(farFuture.getFullYear() + 10); // 10 years

    (await cookies()).set(SESSION_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        expires: farFuture,
        path: "/",
    });

    return token;
}

/**
 * Get the current session from cookies (JWT only)
 */
export async function getSession(): Promise<SessionData | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) {
        return null;
    }

    try {
        // Verify JWT token
        const { payload } = await jwtVerify(token, JWT_SECRET);

        return {
            hostId: payload.hostId as string,
            email: payload.email as string,
        };
    } catch (error) {
        // Invalid token (wrong signature, expired, etc.) - clear the cookie
        cookieStore.delete(SESSION_COOKIE_NAME);
        return null;
    }
}

/**
 * Get the current session with validation (same as getSession now)
 */
export async function getSessionWithValidation(): Promise<SessionData | null> {
    return getSession();
}

/**
 * Delete the current session (logout)
 */
export async function deleteSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Refresh session (no-op since tokens don't expire)
 */
export async function refreshSession(): Promise<void> {
    // No action needed since JWT doesn't expire
}

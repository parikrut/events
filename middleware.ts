import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession } from "@/lib/session";

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Protect all /dashboard routes
    if (path.startsWith("/dashboard")) {
        const session = await getSession();
        if (!session) {
            return NextResponse.redirect(new URL("/auth/login", request.url));
        }
    }

    // Redirect logged-in users away from auth pages
    if (path.startsWith("/auth")) {
        const session = await getSession();
        if (session) {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/auth/:path*"],
};

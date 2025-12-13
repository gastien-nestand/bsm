import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET, // NextAuth v5 uses AUTH_SECRET
    });

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

    // If accessing admin route
    if (isAdminRoute) {
        // Not authenticated - redirect to login
        if (!token) {
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Authenticated but not admin - forbidden
        if (token.role !== "admin") {
            return NextResponse.redirect(new URL("/", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};

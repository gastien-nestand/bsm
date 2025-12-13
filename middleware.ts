import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
    console.log("[MIDDLEWARE] Checking auth for:", request.nextUrl.pathname);

    const token = await getToken({
        req: request,
        secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET, // NextAuth v5 uses AUTH_SECRET
    });

    console.log("[MIDDLEWARE] Token:", token ? `Found (role: ${token.role})` : "Not found");

    const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

    // If accessing admin route
    if (isAdminRoute) {
        // Not authenticated - redirect to login
        if (!token) {
            console.log("[MIDDLEWARE] No token, redirecting to login");
            const loginUrl = new URL("/login", request.url);
            loginUrl.searchParams.set("callbackUrl", request.nextUrl.pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Authenticated but not admin - forbidden
        if (token.role !== "admin") {
            console.log("[MIDDLEWARE] User is not admin, redirecting to home");
            return NextResponse.redirect(new URL("/", request.url));
        }

        console.log("[MIDDLEWARE] Admin access granted");
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*"],
};

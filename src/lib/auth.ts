import NextAuth, { NextAuthConfig, DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { getUserByEmail } from "../server/db";
import bcrypt from "bcryptjs";

// Extend the built-in session type to include role
declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: string;
        role: string;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
    }
}

export const authConfig: NextAuthConfig = {
    providers: [
        Credentials({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                console.log("[AUTH] Starting authorization...");
                const parsedCredentials = z
                    .object({ email: z.string().email(), password: z.string().min(6) })
                    .safeParse(credentials);

                if (!parsedCredentials.success) {
                    console.log("[AUTH] Credentials validation failed");
                    return null;
                }

                const { email, password } = parsedCredentials.data;
                console.log("[AUTH] Looking up user:", email);
                const user = await getUserByEmail(email);

                if (!user || !user.password) {
                    console.log("[AUTH] User not found or no password");
                    return null;
                }

                console.log("[AUTH] User found, checking password...");
                const isPasswordValid = await bcrypt.compare(password, user.password);

                if (!isPasswordValid) {
                    console.log("[AUTH] Password invalid");
                    return null;
                }

                console.log("[AUTH] Login successful for:", email, "Role:", user.role);
                // Return user object without password
                return {
                    id: String(user.id),
                    name: user.name || undefined,
                    email: user.email || undefined,
                    role: user.role || "user",
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role as string;
            }
            return session;
        },
        async signIn({ user }) {
            // Allow sign in
            return true;
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
    session: {
        strategy: "jwt",
    },
    // Note: In NextAuth v5, the secret is automatically read from AUTH_SECRET env variable
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);

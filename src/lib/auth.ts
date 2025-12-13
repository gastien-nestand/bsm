import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { getUserByEmail } from "../server/db";
import bcrypt from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [
        CredentialsProvider({
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
                return {
                    id: String(user.id),
                    name: user.name || null,
                    email: user.email || null,
                    role: user.role || "user",
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
            }
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
});

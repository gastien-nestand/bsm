import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "./drizzle/schema";
import "dotenv/config";
import * as bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function seedAdmin() {
    console.log("Seeding admin user...");

    const hashedPassword = await bcrypt.hash("admin123", 10);

    const adminUser = {
        openId: crypto.randomUUID(),
        name: "Admin",
        email: "admin@example.com",
        password: hashedPassword,
        role: "admin",
        loginMethod: "email",
    };

    try {
        // Check if admin already exists
        const existing = await db.select().from(users).where(eq(users.email, "admin@example.com")).limit(1);

        if (existing.length > 0) {
            // Update existing admin
            await db.update(users).set({ password: hashedPassword, role: "admin" }).where(eq(users.email, "admin@example.com"));
            console.log("✅ Admin user updated!");
        } else {
            // Create new admin
            await db.insert(users).values(adminUser);
            console.log("✅ Admin user created!");
        }

        console.log("Email: admin@example.com");
        console.log("Password: admin123");
    } catch (error) {
        console.error("❌ Error seeding admin user:", error);
        process.exit(1);
    }

    process.exit(0);
}

seedAdmin();

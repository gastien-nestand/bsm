import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "./drizzle/schema";
import "dotenv/config";
import * as bcrypt from "bcryptjs";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function createAdminUser() {
    console.log("Creating admin user...");

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
        await db.insert(users).values(adminUser).onConflictDoUpdate({
            target: users.email,
            set: { role: "admin", password: hashedPassword },
        });
        console.log("✅ Admin user created/updated successfully!");
        console.log("Email: admin@example.com");
        console.log("Password: admin123");
    } catch (error) {
        console.error("❌ Error creating admin user:", error);
        process.exit(1);
    }

    process.exit(0);
}

createAdminUser();

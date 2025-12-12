import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users } from "./drizzle/schema";

config();

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function checkAdminUsers() {
    try {
        const allUsers = await db.select().from(users);
        console.log("\n=== All Users in Database ===");
        allUsers.forEach(user => {
            console.log(`Email: ${user.email}, Role: ${user.role}, Name: ${user.name}`);
        });

        const adminUsers = allUsers.filter(u => u.role === 'admin');
        console.log(`\n=== Admin Users: ${adminUsers.length} ===`);

        if (adminUsers.length === 0) {
            console.log("\n⚠️  NO ADMIN USERS FOUND!");
            console.log("To create an admin user, you can:");
            console.log("1. Sign up through the app");
            console.log("2. Then run this SQL in your database:");
            console.log("   UPDATE users SET role='admin' WHERE email='youremail@example.com';");
        }
    } catch (error) {
        console.error("Error:", error);
    }
    process.exit(0);
}

checkAdminUsers();

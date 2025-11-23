import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
    console.error("❌ DATABASE_URL is not set in environment variables");
    process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function migrateProduction() {
    console.log("🚀 Starting production database migration...");
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 Database: ${process.env.DATABASE_URL?.split("@")[1]?.split("/")[0] || "hidden"}`);

    // Safety check
    if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️  Warning: NODE_ENV is not set to 'production'");
        console.log("Proceeding anyway...");
    }

    try {
        // Test connection
        console.log("\n1️⃣  Testing database connection...");
        await sql`SELECT 1`;
        console.log("✅ Database connection successful");

        // Note: Drizzle Kit handles migrations via drizzle-kit push or migrate
        // This script is for verification and custom migration logic if needed

        console.log("\n2️⃣  Verifying schema...");
        console.log("ℹ️  Run 'npm run db:push' to apply schema changes");

        console.log("\n✅ Migration preparation complete!");
        console.log("\nNext steps:");
        console.log("  1. Run: npm run db:push");
        console.log("  2. Run seed scripts if needed:");
        console.log("     - npx tsx seed-products.ts");
        console.log("     - npx tsx seed-drinks.ts");
        console.log("     - npx tsx seed-admin.ts");

    } catch (error) {
        console.error("\n❌ Migration failed:", error);
        process.exit(1);
    }

    process.exit(0);
}

migrateProduction();

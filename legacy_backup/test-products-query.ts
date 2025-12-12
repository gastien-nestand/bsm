import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { products } from "./drizzle/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function testProductsQuery() {
    console.log("Testing products query...\n");

    try {
        const allProducts = await db.select().from(products);
        console.log(`✅ Found ${allProducts.length} products in database`);

        if (allProducts.length > 0) {
            console.log("\nFirst product:");
            console.log(JSON.stringify(allProducts[0], null, 2));

            console.log("\nAll product names:");
            allProducts.forEach(p => console.log(`  - ${p.name} (${p.category})`));
        }

    } catch (error) {
        console.error("❌ Error querying products:", error);
    }

    process.exit(0);
}

testProductsQuery();

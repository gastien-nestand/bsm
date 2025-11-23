import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { products } from "./drizzle/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

async function checkProducts() {
    console.log("Checking products in database...");
    try {
        const allProducts = await db.select().from(products);
        console.log(`Found ${allProducts.length} products.`);
        if (allProducts.length > 0) {
            console.log("First product:", allProducts[0]);
        }
    } catch (error) {
        console.error("Error checking products:", error);
    }
    process.exit(0);
}

checkProducts();

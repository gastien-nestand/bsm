import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { products } from "../db/schema.js";
import { sql } from "drizzle-orm";
import * as dotenv from "dotenv";

dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const sqlClient = neon(DATABASE_URL);
const db = drizzle(sqlClient);

async function removeDuplicates() {
    console.log("🔍 Finding duplicate products...");

    // Get all products
    const allProducts = await db.select().from(products);
    console.log(`📦 Total products: ${allProducts.length}`);

    // Group by name to find duplicates
    const productsByName = new Map();

    for (const product of allProducts) {
        if (!productsByName.has(product.name)) {
            productsByName.set(product.name, []);
        }
        productsByName.get(product.name).push(product);
    }

    // Find and remove duplicates (keep the one with lowest ID)
    let duplicatesRemoved = 0;

    for (const [name, productList] of productsByName.entries()) {
        if (productList.length > 1) {
            console.log(`\n🔄 Found ${productList.length} copies of "${name}"`);

            // Sort by ID and keep the first one
            productList.sort((a, b) => a.id - b.id);
            const toKeep = productList[0];
            const toDelete = productList.slice(1);

            console.log(`  ✅ Keeping ID ${toKeep.id}`);

            for (const dup of toDelete) {
                console.log(`  ❌ Deleting ID ${dup.id}`);
                await db.delete(products).where(sql`id = ${dup.id}`);
                duplicatesRemoved++;
            }
        }
    }

    console.log(`\n✨ Removed ${duplicatesRemoved} duplicate products`);

    // Show final count
    const finalProducts = await db.select().from(products);
    console.log(`📦 Final product count: ${finalProducts.length}`);

    // List all unique products
    console.log("\n📋 Unique products:");
    for (const product of finalProducts) {
        console.log(`  - ${product.name} ($${(product.price / 100).toFixed(2)})`);
    }
}

removeDuplicates().catch(console.error);

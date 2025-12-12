import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { products } from "./drizzle/schema";
import "dotenv/config";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set");
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const drinkProducts = [
    {
        name: "Haitian Coffee (Café Haïtien)",
        description: "Rich, aromatic Haitian coffee brewed fresh",
        price: 250, // $2.50
        category: "Drinks",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500",
        available: 1,
    },
    {
        name: "Kremas (Haitian Eggnog)",
        description: "Traditional Haitian coconut and rum-flavored drink",
        price: 450, // $4.50
        category: "Drinks",
        imageUrl: "https://images.unsplash.com/photo-1544145945-f90425340c7e?w=500",
        available: 1,
    },
    {
        name: "Akasan (Corn Drink)",
        description: "Sweet, creamy corn-based traditional Haitian beverage",
        price: 350, // $3.50
        category: "Drinks",
        imageUrl: "https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500",
        available: 1,
    },
    {
        name: "Fresh Lemonade (Citronnade)",
        description: "Freshly squeezed lemonade with a hint of mint",
        price: 300, // $3.00
        category: "Drinks",
        imageUrl: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=500",
        available: 1,
    },
    {
        name: "Passion Fruit Juice",
        description: "Refreshing tropical passion fruit juice",
        price: 350, // $3.50
        category: "Drinks",
        imageUrl: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=500",
        available: 1,
    },
    {
        name: "Coconut Water",
        description: "Fresh coconut water, naturally sweet and hydrating",
        price: 300, // $3.00
        category: "Drinks",
        imageUrl: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500",
        available: 1,
    },
];

async function seed() {
    console.log("Adding drink products to database...");

    try {
        for (const product of drinkProducts) {
            await db.insert(products).values(product);
            console.log(`✓ Added: ${product.name}`);
        }
        console.log("\n✅ Drink products added successfully!");
    } catch (error) {
        console.error("❌ Error adding drink products:", error);
        process.exit(1);
    }

    process.exit(0);
}

seed();

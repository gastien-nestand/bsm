import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { products } from "@/db/schema";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
    console.error("DATABASE_URL is not set in environment variables");
    process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql);

const bakeryProducts = [
    {
        name: "Croissant",
        description: "Buttery, flaky French pastry",
        price: 350, // $3.50
        category: "Pastries",
        available: 1,
    },
    {
        name: "Pain au Chocolat",
        description: "Croissant filled with rich chocolate",
        price: 400, // $4.00
        category: "Pastries",
        available: 1,
    },
    {
        name: "Baguette",
        description: "Traditional French bread with crispy crust",
        price: 450, // $4.50
        category: "Bread",
        available: 1,
    },
    {
        name: "Sourdough Loaf",
        description: "Artisan sourdough with tangy flavor",
        price: 800, // $8.00
        category: "Bread",
        available: 1,
    },
    {
        name: "Almond Croissant",
        description: "Croissant filled with almond cream and topped with sliced almonds",
        price: 475, // $4.75
        category: "Pastries",
        available: 1,
    },
    {
        name: "Éclair",
        description: "Classic French pastry with vanilla cream and chocolate glaze",
        price: 525, // $5.25
        category: "Pastries",
        available: 1,
    },
    {
        name: "Macaron Box (6 pcs)",
        description: "Assorted French macarons in various flavors",
        price: 1800, // $18.00
        category: "Desserts",
        available: 1,
    },
    {
        name: "Chocolate Cake",
        description: "Rich chocolate layer cake with ganache frosting",
        price: 3500, // $35.00
        category: "Cakes",
        available: 1,
    },
    {
        name: "Tarte Tatin",
        description: "Upside-down caramelized apple tart",
        price: 2800, // $28.00
        category: "Cakes",
        available: 1,
    },
    {
        name: "Canelé",
        description: "Small French pastry with rum and vanilla flavor",
        price: 325, // $3.25
        category: "Pastries",
        available: 1,
    },
    {
        name: "Brioche",
        description: "Sweet, enriched bread with a tender crumb",
        price: 650, // $6.50
        category: "Bread",
        available: 1,
    },
    {
        name: "Mille-Feuille",
        description: "Napoleon pastry with layers of puff pastry and custard",
        price: 675, // $6.75
        category: "Pastries",
        available: 1,
    },
];

async function seed() {
    try {
        console.log("🌱 Seeding database with bakery products...");

        for (const product of bakeryProducts) {
            await db.insert(products).values(product);
            console.log(`✅ Added: ${product.name}`);
        }

        console.log("✨ Database seeded successfully!");
        console.log(`📦 Total products added: ${bakeryProducts.length}`);
    } catch (error) {
        console.error("❌ Error seeding database:", error);
        process.exit(1);
    }
}

seed();

import { db } from "@/db";
import { products } from "@/db/schema";

async function seedProducts() {
    const sampleProducts = [
        {
            name: "Classic Croissant",
            description: "Buttery, flaky French croissant baked fresh daily",
            price: 350, // $3.50
            category: "Pastries",
            imageUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400",
            available: 1,
        },
        {
            name: "Sourdough Bread",
            description: "Artisan sourdough with a perfect crust and tangy flavor",
            price: 650, // $6.50
            category: "Bread",
            imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc3c?w=400",
            available: 1,
        },
        {
            name: "Chocolate Éclair",
            description: "Light choux pastry filled with cream and topped with chocolate",
            price: 450, // $4.50
            category: "Pastries",
            imageUrl: "https://images.unsplash.com/photo-1612182062631-c745e24d5042?w=400",
            available: 1,
        },
        {
            name: "Baguette",
            description: "Traditional French baguette with crispy crust",
            price: 400, // $4.00
            category: "Bread",
            imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400",
            available: 1,
        },
        {
            name: "Chocolate Chip Cookies",
            description: "Soft and chewy cookies loaded with chocolate chips",
            price: 250, // $2.50
            category: "Cookies",
            imageUrl: "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400",
            available: 1,
        },
        {
            name: "Strawberry Tart",
            description: "Fresh strawberries on vanilla custard in buttery crust",
            price: 550, // $5.50
            category: "Cakes",
            imageUrl: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=400",
            available: 1,
        },
    ];

    try {
        console.log("Seeding sample products...");
        for (const product of sampleProducts) {
            await db.insert(products).values(product).onConflictDoNothing();
        }
        console.log("✅ Sample products seeded successfully");
    } catch (error) {
        console.error("❌ Error seeding products:", error);
    }
}

seedProducts();

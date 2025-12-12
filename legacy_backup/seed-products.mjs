import { drizzle } from "drizzle-orm/mysql2";
import { products } from "./drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const sampleProducts = [
  {
    name: "Pain Haïtien (Haitian Bread)",
    description: "Traditional Haitian bread with a crispy crust and soft interior, perfect for any meal",
    price: 350, // $3.50
    category: "Bread",
    imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500",
    available: 1,
  },
  {
    name: "Pain Patate (Sweet Potato Bread)",
    description: "Sweet and moist bread made with Haitian sweet potatoes and spices",
    price: 450, // $4.50
    category: "Bread",
    imageUrl: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=500",
    available: 1,
  },
  {
    name: "Kassav (Cassava Bread)",
    description: "Traditional flatbread made from cassava flour, a Haitian staple",
    price: 400, // $4.00
    category: "Bread",
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500",
    available: 1,
  },
  {
    name: "Pate Kode (Haitian Patties)",
    description: "Flaky pastry filled with seasoned meat or vegetables",
    price: 300, // $3.00
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1619740455993-557c40e38d9e?w=500",
    available: 1,
  },
  {
    name: "Pen Patat (Sweet Potato Pudding)",
    description: "Rich and creamy sweet potato pudding with coconut and spices",
    price: 550, // $5.50
    category: "Desserts",
    imageUrl: "https://images.unsplash.com/photo-1464347744102-11db6282f854?w=500",
    available: 1,
  },
  {
    name: "Gateau au Beurre (Butter Cake)",
    description: "Moist butter cake with vanilla, a Haitian celebration favorite",
    price: 600, // $6.00
    category: "Cakes",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500",
    available: 1,
  },
  {
    name: "Pain au Chocolat",
    description: "Flaky croissant pastry with rich chocolate filling",
    price: 350, // $3.50
    category: "Pastries",
    imageUrl: "https://images.unsplash.com/photo-1623334044303-241021148842?w=500",
    available: 1,
  },
  {
    name: "Tablèt (Coconut Candy)",
    description: "Traditional Haitian coconut fudge candy, sweet and delicious",
    price: 250, // $2.50
    category: "Desserts",
    imageUrl: "https://images.unsplash.com/photo-1481391319762-47dff72954d9?w=500",
    available: 1,
  },
  {
    name: "Baguette",
    description: "Classic French-style baguette, fresh and crusty",
    price: 300, // $3.00
    category: "Bread",
    imageUrl: "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=500",
    available: 1,
  },
  {
    name: "Gateau Kremas (Cream Cake)",
    description: "Layered cake with creamy Haitian kremas filling",
    price: 800, // $8.00
    category: "Cakes",
    imageUrl: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500",
    available: 1,
  },
];

async function seed() {
  console.log("Seeding database with sample products...");
  
  try {
    for (const product of sampleProducts) {
      await db.insert(products).values(product);
      console.log(`✓ Added: ${product.name}`);
    }
    console.log("\n✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
  
  process.exit(0);
}

seed();

import { db } from "@/db";
import { products } from "@/db/schema";
import HomeClient from "@/components/HomeClient";

export default async function Page() {
  const allProducts = await db.select().from(products);
  return <HomeClient products={allProducts} />;
}

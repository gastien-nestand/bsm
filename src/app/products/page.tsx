import { db } from "@/db";
import { products } from "@/db/schema";
import ProductsClient from "@/components/ProductsClient";

export default async function ProductsPage() {
    const allProducts = await db.select().from(products);
    return <ProductsClient products={allProducts} />;
}

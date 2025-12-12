import { NextResponse } from "next/server";
import * as db from "@/server/db";

export async function GET() {
    try {
        const products = await db.getAvailableProducts();
        return NextResponse.json(products);
    } catch (error) {
        console.error("Error fetching products:", error);
        return NextResponse.json(
            { error: "Failed to fetch products" },
            { status: 500 }
        );
    }
}

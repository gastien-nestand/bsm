import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as db from "@/server/db";

// GET /api/cart - Get user's cart
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const userId = parseInt(session.user.id, 10);
        const cart = await db.getCart(userId);
        return NextResponse.json(cart || { items: [] });
    } catch (error) {
        console.error("Error fetching cart:", error);
        return NextResponse.json(
            { error: "Failed to fetch cart" },
            { status: 500 }
        );
    }
}

// POST /api/cart - Add item to cart
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { productId, quantity = 1 } = body;

        if (!productId || typeof productId !== "number") {
            return NextResponse.json(
                { error: "Invalid product ID" },
                { status: 400 }
            );
        }

        const userId = parseInt(session.user.id, 10);
        const cart = await db.addToCart(userId, productId, quantity);
        return NextResponse.json(cart);
    } catch (error) {
        console.error("Error adding to cart:", error);
        return NextResponse.json(
            { error: "Failed to add to cart" },
            { status: 500 }
        );
    }
}

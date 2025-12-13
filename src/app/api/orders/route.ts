import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import * as db from "@/server/db";

// POST /api/orders - Create a new order
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
        const {
            customerName,
            customerEmail,
            customerPhone,
            pickupDate,
            notes,
            paymentMethod = "pickup",
            items,
        } = body;

        // Validate required fields
        if (!customerName || !customerEmail || !customerPhone || !items || items.length === 0) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Calculate total amount
        let totalAmount = 0;
        for (const item of items) {
            const product = await db.getProductById(item.productId);
            if (!product) {
                return NextResponse.json(
                    { error: `Product ${item.productId} not found` },
                    { status: 400 }
                );
            }
            totalAmount += product.price * item.quantity;
        }

        // Create the order
        const orderId = await db.createOrder({
            customerName,
            customerEmail,
            customerPhone,
            totalAmount,
            status: "pending",
            paymentMethod,
            paymentStatus: "pending",
            notes: notes || null,
            pickupDate: pickupDate ? new Date(pickupDate) : null,
        });

        // Create order items
        for (const item of items) {
            const product = await db.getProductById(item.productId);
            if (product) {
                await db.createOrderItem({
                    orderId,
                    productId: item.productId,
                    productName: product.name,
                    quantity: item.quantity,
                    priceAtOrder: product.price,
                });
            }
        }

        // Clear the user's cart
        const userId = parseInt(session.user.id, 10);
        await db.clearCart(userId);

        return NextResponse.json({ orderId, success: true });
    } catch (error) {
        console.error("Error creating order:", error);
        return NextResponse.json(
            { error: "Failed to create order" },
            { status: 500 }
        );
    }
}

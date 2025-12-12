import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { users, products, orders, orderItems, carts, cartItems, type User, type InsertUser, type InsertOrderItem, type InsertProduct, type InsertOrder } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const sql = neon(process.env.DATABASE_URL);
      _db = drizzle(sql);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Product queries
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).orderBy(products.category, products.name);
}

export async function getAvailableProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products).where(eq(products.available, 1)).orderBy(products.category, products.name);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(products).values(product).returning({ id: products.id });
  return result[0];
}

export async function updateProduct(id: number, product: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(product).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}

// Order queries
export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order).returning({ id: orders.id });
  return result[0].id;
}

export async function getCart(userId: number) {
  const db = await getDb();
  if (!db) return null; // Added db check
  const userCart = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (userCart.length === 0) {
    return null;
  }
  const items = await db
    .select({
      id: cartItems.id,
      productId: cartItems.productId,
      quantity: cartItems.quantity,
      name: products.name,
      price: products.price,
      imageUrl: products.imageUrl,
    })
    .from(cartItems)
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.cartId, userCart[0].id));

  return { ...userCart[0], items };
}

export async function createCart(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available"); // Added db check
  const result = await db.insert(carts).values({ userId }).returning({ id: carts.id });
  return result[0].id;
}

export async function addToCart(userId: number, productId: number, quantity: number = 1) {
  const db = await getDb();
  if (!db) throw new Error("Database not available"); // Added db check
  let cart = await getCart(userId);
  let cartId = cart?.id;

  if (!cartId) {
    cartId = await createCart(userId);
  }

  // Check if item exists
  const existingItem = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.productId, productId)))
    .limit(1);

  if (existingItem.length > 0) {
    await db
      .update(cartItems)
      .set({ quantity: existingItem[0].quantity + quantity })
      .where(eq(cartItems.id, existingItem[0].id));
  } else {
    await db.insert(cartItems).values({
      cartId,
      productId,
      quantity,
    });
  }
  return getCart(userId);
}

export async function updateCartItem(userId: number, productId: number, quantity: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available"); // Added db check
  const cart = await getCart(userId);
  if (!cart) return null;

  if (quantity <= 0) {
    await db
      .delete(cartItems)
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
  }
  return getCart(userId);
}

export async function removeFromCart(userId: number, productId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available"); // Added db check
  const cart = await getCart(userId);
  if (!cart) return null;

  await db
    .delete(cartItems)
    .where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));

  return getCart(userId);
}

export async function clearCart(userId: number) {
  const db = await getDb();
  if (!db) return; // Added db check
  const cart = await getCart(userId);
  if (!cart) return;

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) return null; // Added db check
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result[0] || null;
}

export async function createUser(data: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(users).values(data).returning({ id: users.id, openId: users.openId, name: users.name });
  return result[0];
}

export async function createOrderItem(item: InsertOrderItem) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(orderItems).values(item);
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStripeSession(orderId: number, sessionId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ stripeSessionId: sessionId }).where(eq(orders.id, orderId));
}

export async function updateOrderPaymentStatus(
  orderId: number,
  paymentStatus: "pending" | "paid" | "failed",
  paymentIntentId?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateData: any = { paymentStatus };
  if (paymentIntentId) {
    updateData.stripePaymentIntentId = paymentIntentId;
  }
  await db.update(orders).set(updateData).where(eq(orders.id, orderId));
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderItems(orderId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
}

export async function updateOrderStatus(id: number, status: "pending" | "confirmed" | "ready" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(orders).set({ status }).where(eq(orders.id, id));
}

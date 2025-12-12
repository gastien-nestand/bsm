import { pgTable, text, serial, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = pgTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: serial("id").primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  password: text("password"), // Hashed password
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: text("role").default("user").notNull(), // enum: "user" | "admin"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Product categories for the bakery
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: integer("price").notNull(), // Price in cents to avoid decimal issues
  category: varchar("category", { length: 100 }).notNull(), // e.g., "Bread", "Pastries", "Cakes"
  imageUrl: varchar("imageUrl", { length: 500 }),
  available: integer("available").default(1).notNull(), // 1 = available, 0 = out of stock
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Orders table for pre-orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  customerPhone: varchar("customerPhone", { length: 20 }).notNull(),
  totalAmount: integer("totalAmount").notNull(), // Total in cents
  status: text("status").default("pending").notNull(), // enum: "pending" | "confirmed" | "ready" | "completed" | "cancelled"
  paymentMethod: text("paymentMethod").default("pickup").notNull(), // enum: "online" | "pickup"
  paymentStatus: text("paymentStatus").default("pending").notNull(), // enum: "pending" | "paid" | "failed"
  stripeSessionId: varchar("stripeSessionId", { length: 255 }), // Stripe checkout session ID
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 255 }), // Stripe payment intent ID
  notes: text("notes"), // Special instructions from customer
  pickupDate: timestamp("pickupDate"), // When customer wants to pick up
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

// Order items - line items for each order
export const orderItems = pgTable("orderItems", {
  id: serial("id").primaryKey(),
  orderId: integer("orderId").notNull(),
  productId: integer("productId").notNull(),
  productName: varchar("productName", { length: 255 }).notNull(), // Store name in case product is deleted
  quantity: integer("quantity").notNull(),
  priceAtOrder: integer("priceAtOrder").notNull(), // Price in cents at time of order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = typeof orderItems.$inferInsert;

// Shopping Cart
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("userId").references(() => users.id), // Nullable for guest carts (optional future feature), but for now linked to user
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Cart = typeof carts.$inferSelect;
export type InsertCart = typeof carts.$inferInsert;

export const cartItems = pgTable("cartItems", {
  id: serial("id").primaryKey(),
  cartId: integer("cartId").notNull().references(() => carts.id, { onDelete: "cascade" }),
  productId: integer("productId").notNull().references(() => products.id),
  quantity: integer("quantity").notNull().default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = typeof cartItems.$inferInsert;
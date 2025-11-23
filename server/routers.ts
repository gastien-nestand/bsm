import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    register: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          email: z.string().email(),
          password: z.string().min(6),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const existingUser = await db.getUserByEmail(input.email);
        if (existingUser) {
          throw new TRPCError({ code: "CONFLICT", message: "Email already exists" });
        }

        const bcrypt = await import("bcryptjs");
        const hashedPassword = await bcrypt.hash(input.password, 10);

        const user = await db.createUser({
          openId: crypto.randomUUID(), // Generate a unique ID for local users
          name: input.name,
          email: input.email,
          password: hashedPassword,
          loginMethod: "email",
          role: "user",
        });

        // Create session
        const { sdk } = await import("./_core/sdk");
        const token = await sdk.createSessionToken(user.openId, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, user };
      }),
    login: publicProcedure
      .input(
        z.object({
          email: z.string().email(),
          password: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const user = await db.getUserByEmail(input.email);
        if (!user || !user.password) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        const bcrypt = await import("bcryptjs");
        const isValid = await bcrypt.compare(input.password, user.password);

        if (!isValid) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid email or password" });
        }

        // Create session
        const { sdk } = await import("./_core/sdk");
        const token = await sdk.createSessionToken(user.openId, { name: user.name || "" });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, cookieOptions);

        return { success: true, user };
      }),
  }),

  cart: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await db.getCart(ctx.user.id);
    }),
    add: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().int().positive().default(1),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.addToCart(ctx.user.id, input.productId, input.quantity);
      }),
    update: protectedProcedure
      .input(
        z.object({
          productId: z.number(),
          quantity: z.number().int().min(0),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await db.updateCartItem(ctx.user.id, input.productId, input.quantity);
      }),
    remove: protectedProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return await db.removeFromCart(ctx.user.id, input.productId);
      }),
    clear: protectedProcedure.mutation(async ({ ctx }) => {
      await db.clearCart(ctx.user.id);
      return { success: true };
    }),
  }),

  // Public product procedures
  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAvailableProducts();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const product = await db.getProductById(input.id);
        if (!product) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Product not found" });
        }
        return product;
      }),
  }),

  // Admin product management
  admin: router({
    products: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.getAllProducts();
      }),
      create: protectedProcedure
        .input(
          z.object({
            name: z.string().min(1),
            description: z.string().optional(),
            price: z.number().int().positive(),
            category: z.string().min(1),
            imageUrl: z.string().optional(),
            available: z.number().int().min(0).max(1).default(1),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          return await db.createProduct(input);
        }),
      update: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            price: z.number().int().positive().optional(),
            category: z.string().min(1).optional(),
            imageUrl: z.string().optional(),
            available: z.number().int().min(0).max(1).optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          const { id, ...data } = input;
          await db.updateProduct(id, data);
          return { success: true };
        }),
      delete: protectedProcedure
        .input(z.object({ id: z.number() }))
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          await db.deleteProduct(input.id);
          return { success: true };
        }),
    }),
    orders: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        if (ctx.user.role !== "admin") {
          throw new TRPCError({ code: "FORBIDDEN" });
        }
        return await db.getAllOrders();
      }),
      getById: protectedProcedure
        .input(z.object({ id: z.number() }))
        .query(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          const order = await db.getOrderById(input.id);
          if (!order) {
            throw new TRPCError({ code: "NOT_FOUND" });
          }
          const items = await db.getOrderItems(input.id);
          return { ...order, items };
        }),
      updateStatus: protectedProcedure
        .input(
          z.object({
            id: z.number(),
            status: z.enum(["pending", "confirmed", "ready", "completed", "cancelled"]),
          })
        )
        .mutation(async ({ ctx, input }) => {
          if (ctx.user.role !== "admin") {
            throw new TRPCError({ code: "FORBIDDEN" });
          }
          await db.updateOrderStatus(input.id, input.status);
          return { success: true };
        }),
    }),
  }),

  // Public order placement
  payment: router({
    createCheckoutSession: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerEmail: z.string().email(),
          customerPhone: z.string().min(1),
          notes: z.string().optional(),
          pickupDate: z.string().optional(),
          items: z.array(
            z.object({
              productId: z.number(),
              quantity: z.number().int().positive(),
            })
          ),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const Stripe = (await import("stripe")).default;
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

        // Calculate total and prepare line items
        const lineItems = [];
        let totalAmount = 0;

        for (const item of input.items) {
          const product = await db.getProductById(item.productId);
          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Product ${item.productId} not found`,
            });
          }
          if (product.available !== 1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Product ${product.name} is not available`,
            });
          }
          totalAmount += product.price * item.quantity;
          lineItems.push({
            price_data: {
              currency: "usd",
              product_data: {
                name: product.name,
                description: product.description || undefined,
              },
              unit_amount: product.price,
            },
            quantity: item.quantity,
          });
        }

        // Create pending order first
        const orderId = await db.createOrder({
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          totalAmount,
          notes: input.notes,
          pickupDate: input.pickupDate ? new Date(input.pickupDate) : undefined,
          status: "pending",
          paymentMethod: "online",
          paymentStatus: "pending",
        });

        // Create order items
        for (const item of input.items) {
          const product = await db.getProductById(item.productId);
          if (product) {
            await db.createOrderItem({
              orderId,
              productId: product.id,
              productName: product.name,
              quantity: item.quantity,
              priceAtOrder: product.price,
            });
          }
        }

        // Create Stripe checkout session
        const origin = ctx.req.headers.origin || "http://localhost:3000";
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          line_items: lineItems,
          mode: "payment",
          success_url: `${origin}/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order_id=${orderId}`,
          cancel_url: `${origin}/checkout`,
          customer_email: input.customerEmail,
          client_reference_id: orderId.toString(),
          metadata: {
            order_id: orderId.toString(),
            customer_name: input.customerName,
            customer_email: input.customerEmail,
            customer_phone: input.customerPhone,
          },
          allow_promotion_codes: true,
        });

        // Update order with Stripe session ID
        await db.updateOrderStripeSession(orderId, session.id);

        return { sessionUrl: session.url, orderId };
      }),
  }),

  order: router({
    create: publicProcedure
      .input(
        z.object({
          customerName: z.string().min(1),
          customerEmail: z.string().email(),
          customerPhone: z.string().min(1),
          notes: z.string().optional(),
          pickupDate: z.string().optional(),
          paymentMethod: z.enum(["online", "pickup"]).default("pickup"),
          items: z.array(
            z.object({
              productId: z.number(),
              quantity: z.number().int().positive(),
            })
          ),
        })
      )
      .mutation(async ({ input }) => {
        // Calculate total and create order
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of input.items) {
          const product = await db.getProductById(item.productId);
          if (!product) {
            throw new TRPCError({
              code: "NOT_FOUND",
              message: `Product ${item.productId} not found`,
            });
          }
          if (product.available !== 1) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: `Product ${product.name} is not available`,
            });
          }
          totalAmount += product.price * item.quantity;
          orderItemsData.push({
            productId: product.id,
            productName: product.name,
            quantity: item.quantity,
            priceAtOrder: product.price,
          });
        }

        // Create order
        const orderId = await db.createOrder({
          customerName: input.customerName,
          customerEmail: input.customerEmail,
          customerPhone: input.customerPhone,
          totalAmount,
          notes: input.notes,
          pickupDate: input.pickupDate ? new Date(input.pickupDate) : undefined,
          status: "pending",
          paymentMethod: input.paymentMethod || "pickup",
          paymentStatus: input.paymentMethod === "pickup" ? "pending" : "pending",
        });

        // Create order items
        for (const item of orderItemsData) {
          await db.createOrderItem({
            orderId,
            ...item,
          });
        }

        return { orderId, success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

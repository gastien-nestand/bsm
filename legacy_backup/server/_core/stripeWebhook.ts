import express from "express";
import Stripe from "stripe";
import * as db from "../db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export function registerStripeWebhook(app: express.Application) {
  // IMPORTANT: This route must be registered BEFORE express.json() middleware
  // because Stripe requires the raw body for signature verification
  app.post(
    "/api/stripe",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];

      if (!sig) {
        console.error("[Stripe Webhook] No signature provided");
        return res.status(400).send("No signature");
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err: any) {
        console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      // Handle the event
      try {
        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log("[Stripe Webhook] Checkout session completed:", session.id);

            // Extract order ID from metadata
            const orderId = session.metadata?.order_id;
            if (orderId) {
              // Update order payment status
              await db.updateOrderPaymentStatus(
                parseInt(orderId),
                "paid",
                session.payment_intent as string
              );
              console.log(`[Stripe Webhook] Order ${orderId} marked as paid`);
            }
            break;
          }

          case "checkout.session.expired": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log("[Stripe Webhook] Checkout session expired:", session.id);

            const orderId = session.metadata?.order_id;
            if (orderId) {
              await db.updateOrderPaymentStatus(parseInt(orderId), "failed");
              console.log(`[Stripe Webhook] Order ${orderId} marked as failed (expired)`);
            }
            break;
          }

          case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            console.log("[Stripe Webhook] Payment failed:", paymentIntent.id);
            // You could add additional handling here if needed
            break;
          }

          default:
            console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (err: any) {
        console.error(`[Stripe Webhook] Error processing event: ${err.message}`);
        res.status(500).send(`Webhook processing error: ${err.message}`);
      }
    }
  );

  console.log("[Stripe Webhook] Registered at /api/stripe");
}

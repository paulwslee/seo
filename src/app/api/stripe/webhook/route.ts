import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      // If no webhook secret is set in local dev, we skip validation (Not recommended for prod)
      event = JSON.parse(body);
    } else {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    }
  } catch (error: any) {
    console.error("Webhook signature verification failed.", error.message);
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        
        // Retrieve the customer from DB using Stripe Customer ID
        if (session.customer && typeof session.customer === "string") {
          const subscriptionId = typeof session.subscription === "string" ? session.subscription : null;
          
          await db.update(users)
            .set({ 
              plan: "premium",
              stripeSubscriptionId: subscriptionId
            })
            .where(eq(users.stripeCustomerId, session.customer));
          
          console.log(`User upgraded to Premium! Customer ID: ${session.customer}`);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        // Downgrade to free if subscription is cancelled
        if (typeof subscription.customer === "string") {
          await db.update(users)
            .set({ 
              plan: "free",
              stripeSubscriptionId: null
            })
            .where(eq(users.stripeCustomerId, subscription.customer));
            
          console.log(`User downgraded to Free. Customer ID: ${subscription.customer}`);
        }
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
  } catch (err) {
    console.error("Error processing webhook:", err);
    return new NextResponse("Webhook handler failed", { status: 500 });
  }

  return new NextResponse("Webhook received", { status: 200 });
}

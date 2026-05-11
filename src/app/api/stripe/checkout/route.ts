import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id || "";
    const email = session.user.email;

    // In a real app, you would retrieve the actual Stripe Price ID from env
    // Example: process.env.STRIPE_PREMIUM_PRICE_ID
    const priceId = "price_mock_premium_123"; 

    // Find if user already has a Stripe Customer ID
    const userDb = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let stripeCustomerId = userDb[0]?.stripeCustomerId;

    if (!stripeCustomerId) {
      // Create a new Stripe Customer
      const customer = await stripe.customers.create({
        email: email,
        name: session.user.name || undefined,
        metadata: {
          userId: userId, // Important: Link Stripe Customer to our DB User
        },
      });
      stripeCustomerId = customer.id;
      
      // Update DB with the new Customer ID
      await db.update(users).set({ stripeCustomerId }).where(eq(users.email, email));
    }

    // Create a Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer: stripeCustomerId,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?canceled=true`,
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error("Stripe Checkout Error:", error);
    return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
  }
}

import { type NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-paystack-signature");

    // Verify webhook signature
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 },
      );
    }

    const hash = crypto
      .createHmac("sha512", secretKey)
      .update(body)
      .digest("hex");

    if (hash !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle different webhook events
    switch (event.event) {
      case "charge.success":
        console.log("Payment successful:", event.data);
        // Here you would typically:
        // 1. Update your database
        // 2. Send confirmation email
        // 3. Update user account
        // 4. Log the transaction
        break;

      case "charge.failed":
        console.log("Payment failed:", event.data);
        // Handle failed payment
        break;

      default:
        console.log("Unhandled webhook event:", event.event);
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

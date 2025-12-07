import { updatePayrollTransfer } from "@/lib/actions/payroll";
import crypto from "crypto";
import { type NextRequest, NextResponse } from "next/server";

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

    const type = event.event;
    const data = event.data;

    console.log(event);

    try {
      if (type.startsWith("transfer.")) {
        await updatePayrollTransfer({ type, data });
      }
    } catch (error) {
      console.error("Webhook error:", error);
    }

    // Handle different webhook events
    // switch (event.event) {
    //   case "charge.success":
    //     console.log("Payment successful:", event.data);
    //     // await prisma.payrollTransactions.update({

    //     // })
    //     // Here you would typically:
    //     // 1. Update your database
    //     // 2. Send confirmation email
    //     // 3. Update user account
    //     // 4. Log the transaction
    //     break;

    //   case "charge.failed":
    //     console.log("Payment failed:", event.data);
    //     // Handle failed payment
    //     break;

    //   default:
    //     console.log("Unhandled webhook event:", event.event);
    // }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

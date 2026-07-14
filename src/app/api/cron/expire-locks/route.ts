import { NextRequest, NextResponse } from "next/server";
import { expireStaleBookings } from "@/lib/db/booking-service";

export async function POST(req: NextRequest) {
  // Simple cron security check
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const count = await expireStaleBookings();
    
    return NextResponse.json({
      status: "success",
      message: `Expired ${count} stale bookings.`,
      expired_count: count,
    });
  } catch (error: any) {
    console.error("[Cron Expire Error]", error);
    return NextResponse.json(
      { status: "error", message: error.message },
      { status: 500 }
    );
  }
}

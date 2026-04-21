import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { scanId, status } = body;

    if (!scanId) {
      return NextResponse.json({ error: "Missing scanId" }, { status: 400 });
    }

    if (status === "completed") {
      const notification = await prisma.notification.create({
        data: {
          scanId: scanId, 
          message: "Your dental scan has been processed and is ready for review.",
          isRead: false,
          type:"scan_completed"
        },
      });

      console.log(`[NOTIFICATION] Created for scan ${scanId}:`, notification.id);

      return NextResponse.json({
        ok: true,
        message: "Notification triggered",
        notificationId: notification.id,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Notification API Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

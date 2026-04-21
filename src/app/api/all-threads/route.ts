import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const threads = await prisma.thread.findMany({
    select: { id: true, patientId: true },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json({ threads });
}
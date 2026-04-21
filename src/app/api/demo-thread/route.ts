import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get("patientId");
  if (!patientId) return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  let thread = await prisma.thread.findFirst({ where: { patientId } });
  if (!thread) return NextResponse.json({ threadId: null });
  return NextResponse.json({ threadId: thread.id });
}

export async function POST(req: NextRequest) {
  const { patientId } = await req.json();
  if (!patientId) return NextResponse.json({ error: "Missing patientId" }, { status: 400 });
  let thread = await prisma.thread.findFirst({ where: { patientId } });
  if (!thread) {
    thread = await prisma.thread.create({ data: { patientId } });
  }
  return NextResponse.json({ threadId: thread.id });
}
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const threadId = searchParams.get("threadId");

    if (!threadId) {
      return NextResponse.json({ error: "Missing threadId" }, { status: 400 });
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const messages = await prisma.message.findMany({
      where: { threadId },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ messages, count: messages.length });
  } catch (err) {
    console.error("Messaging GET Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { threadId, content, sender } = body;

    if (!threadId || !content || !sender) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: threadId, content, sender",
        },
        { status: 400 }
      );
    }

    if (!["patient", "dentist"].includes(sender)) {
      return NextResponse.json(
        { error: "Sender must be 'patient' or 'dentist'" },
        { status: 400 }
      );
    }

    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
    });

    if (!thread) {
      return NextResponse.json({ error: "Thread not found" }, { status: 404 });
    }

    const message = await prisma.message.create({
      data: {
        threadId,
        content,
        sender,
      },
    });

    console.log(
      `[MESSAGE] New message in thread ${threadId} from ${sender}:`,
      message.id
    );

    return NextResponse.json(
      {
        ok: true,
        message,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Messaging POST Error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

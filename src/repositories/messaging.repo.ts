import { prisma } from "@/lib/prisma";
import { MessageDTO, MessageResponse, ThreadResponse } from "@/types/messaging";

export class MessagingRepository {
  async getThread(threadId: string): Promise<ThreadResponse | null> {
    const thread = await prisma.thread.findUnique({
      where: { id: threadId },
      include: { messages: { orderBy: { createdAt: "asc" } } },
    });
    if (!thread) return null;
    return {
      id: thread.id,
      patientId: thread.patientId,
      updatedAt: thread.updatedAt.toISOString(),
      messages: thread.messages.map((m) => ({
        id: m.id,
        threadId: m.threadId,
        content: m.content,
        sender: m.sender as "patient" | "dentist",
        createdAt: m.createdAt.toISOString(),
      })),
    };
  }

  async createMessage(data: MessageDTO): Promise<MessageResponse> {
    const message = await prisma.message.create({
      data,
    });
    return {
      id: message.id,
      threadId: message.threadId,
      content: message.content,
      sender: message.sender as "patient" | "dentist",
      createdAt: message.createdAt.toISOString(),
    };
  }
}

export const messagingRepository = new MessagingRepository();
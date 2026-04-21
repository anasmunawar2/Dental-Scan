import { messagingRepository } from "@/repositories/messaging.repo";
import { MessageDTO, MessageResponse, ThreadResponse } from "@/types/messaging";

export class MessagingService {
  async getThread(threadId: string): Promise<ThreadResponse | null> {
    return messagingRepository.getThread(threadId);
  }

  async sendMessage(data: MessageDTO): Promise<MessageResponse> {
    return messagingRepository.createMessage(data);
  }
}

export const messagingService = new MessagingService();
import { MessageResponse } from "@/types/messaging";
import { API_ROUTES } from "../constants/apiRoutes";
import { get, post } from "../constants/httpClients";

export async function fetchMessages(threadId: string): Promise<MessageResponse[]> {
  const data = await get<{ messages: MessageResponse[] }>(
    `${API_ROUTES.MESSAGING}?threadId=${threadId}`
  );
  return data.messages || [];
}

export async function sendMessage({
  threadId,
  content,
  sender,
}: {
  threadId: string;
  content: string;
  sender: "patient" | "dentist";
}): Promise<MessageResponse> {
  const data = await post<{ message: MessageResponse }>(API_ROUTES.MESSAGING, {
    threadId,
    content,
    sender,
  });
  return data.message;
}
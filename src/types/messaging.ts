export type Sender = "patient" | "dentist";

export interface MessageDTO {
  threadId: string;
  content: string;
  sender: Sender;
}

export interface MessageResponse {
  id: string;
  threadId: string;
  content: string;
  sender: Sender;
  createdAt: string;
}

export interface ThreadResponse {
  id: string;
  patientId: string;
  updatedAt: string;
  messages: MessageResponse[];
}

export type MessagingProps = {
  threadId: string;
  patientId: string;
  sender: "patient" | "dentist";
};
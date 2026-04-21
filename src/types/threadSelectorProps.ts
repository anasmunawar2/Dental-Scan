import { Thread } from "./thread";

export type ThreadSelectorProps = {
  sender: "patient" | "dentist";
  setSender: (s: "patient" | "dentist") => void;
  threadInput: string;
  setThreadInput: (s: string) => void;
  handleThreadIdLoad: () => void;
  threadId: string | null;
  allThreads: Thread[];
  handleThreadSelect: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onClose: () => void;
};
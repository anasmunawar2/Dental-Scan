import React from "react";
import { X } from "lucide-react";
import { ThreadSelectorProps } from "@/types/threadSelectorProps";


export default function ThreadSelector({
  sender,
  setSender,
  threadInput,
  setThreadInput,
  handleThreadIdLoad,
  threadId,
  allThreads,
  handleThreadSelect,
  onClose,
}: ThreadSelectorProps) {
  return (
    <div className="fixed bottom-4 left-4 bg-zinc-800 rounded p-4 flex flex-col gap-2 z-50 min-w-[320px] shadow-lg">
      <button
        className="absolute top-2 right-2 text-gray-400 hover:text-white"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={20} />
      </button>
      <div className="flex gap-2 items-center mt-2">
        <span className="text-white text-sm">Chat as:</span>
        <button
          className={`px-3 py-1 rounded ${sender === "patient" ? "bg-blue-600 text-white" : "bg-zinc-700 text-gray-300"}`}
          onClick={() => setSender("patient")}
        >
          Patient
        </button>
        <button
          className={`px-3 py-1 rounded ${sender === "dentist" ? "bg-blue-600 text-white" : "bg-zinc-700 text-gray-300"}`}
          onClick={() => setSender("dentist")}
        >
          Dentist
        </button>
      </div>
      <div className="flex gap-2 items-center mt-2">
        <input
          className="px-2 py-1 rounded bg-zinc-800 text-white border border-zinc-700 text-xs"
          placeholder="Enter thread ID"
          value={threadInput}
          onChange={e => setThreadInput(e.target.value)}
        />
        <button
          className="px-2 py-1 bg-blue-700 rounded text-white text-xs"
          onClick={handleThreadIdLoad}
        >
          Load
        </button>
      </div>
      <div className="flex gap-2 items-center mt-2">
        <select
          className="px-2 py-1 rounded bg-zinc-800 text-white border border-zinc-700 text-xs"
          value={threadId || ""}
          onChange={handleThreadSelect}
        >
          <option value="">Select thread</option>
          {allThreads.map((t) => (
            <option key={t.id} value={t.id}>
              {t.id} ({t.patientId})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
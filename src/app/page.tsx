"use client";
import { useEffect, useState } from "react";
import ScanningFlow from "@/app/components/ScanningFlow";
import ThreadSelector from "@/app/components/ThreadSelector";
import { Menu } from "lucide-react";
import { getOrCreateDemoThread, fetchAllThreads } from "@/apiclients/threadApi.client";

const DEMO_PATIENT_ID = "demo-patient-1";

export default function Home() {
  const [threadId, setThreadId] = useState<string | null>(null);
  const [sender, setSender] = useState<"patient" | "dentist">("patient");
  const [allThreads, setAllThreads] = useState<{ id: string; patientId: string }[]>([]);
  const [threadInput, setThreadInput] = useState("");
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    getOrCreateDemoThread(DEMO_PATIENT_ID).then(setThreadId);
    fetchAllThreads().then(setAllThreads);
  }, []);

  const handleThreadIdLoad = () => {
    if (threadInput.trim()) setThreadId(threadInput.trim());
  };

  const handleThreadSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setThreadId(e.target.value);
  };

  return (
    <main className="min-h-screen bg-black relative">
      <ScanningFlow
        threadId={threadId ?? ""}
        patientId={DEMO_PATIENT_ID}
        sender={sender}
      />
      {!showSelector && (
        <button
          className="fixed bottom-4 left-4 bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
          onClick={() => setShowSelector(true)}
          aria-label="Open thread selector"
        >
          <Menu size={24} />
        </button>
      )}
      {showSelector && (
        <ThreadSelector
          sender={sender}
          setSender={setSender}
          threadInput={threadInput}
          setThreadInput={setThreadInput}
          handleThreadIdLoad={handleThreadIdLoad}
          threadId={threadId}
          allThreads={allThreads}
          handleThreadSelect={handleThreadSelect}
          onClose={() => setShowSelector(false)}
        />
      )}
    </main>
  );
}
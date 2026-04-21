import { API_ROUTES } from "../constants/apiRoutes";
import { get, post } from "../constants/httpClients";

export async function getOrCreateDemoThread(patientId: string) {
  try {
    const data = await get<{ threadId?: string }>(
      `${API_ROUTES.DEMO_THREAD}?patientId=${patientId}`
    );
    if (data.threadId) return data.threadId;
  } catch {}
  try {
    const data = await post<{ threadId: string }>(API_ROUTES.DEMO_THREAD, { patientId });
    return data.threadId;
  } catch {}
  return null;
}

export async function fetchAllThreads(): Promise<{ id: string; patientId: string }[]> {
  try {
    const data = await get<{ threads: { id: string; patientId: string }[] }>(API_ROUTES.ALL_THREADS);
    return data.threads || [];
  } catch {
    return [];
  }
}
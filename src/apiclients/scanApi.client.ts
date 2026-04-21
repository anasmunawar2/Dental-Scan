import { API_ROUTES } from "../constants/apiRoutes";
import { post } from "../constants/httpClients";

export async function uploadScan(images: string[]) {
  return post<{ message?: string; error?: string }>(`${API_ROUTES.SCAN_UPLOAD}`, { images });
}
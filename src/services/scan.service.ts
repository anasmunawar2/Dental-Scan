import { prisma } from "@/lib/prisma";
import { notificationService } from "./notification.service";
import { logger } from "@/lib/logger";

export interface CreateScanRequest {
  images: string[];
  status?: string;
}

export interface ScanResponse {
  id: string;
  status: string;
  images: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ScanService {
 
  async uploadScan(data: CreateScanRequest): Promise<ScanResponse> {
    try {
      const scan = await prisma.scan.create({
        data: {
          status: data.status || "pending",
          images: data.images.join(","),
        },
      });

      logger.info("Scan created successfully", { scanId: scan.id });

      this.triggerScanNotification(scan.id).catch((err) => {
        logger.error("Failed to trigger notification for scan", err);
      });

      return scan;
    } catch (error) {
      logger.error("Failed to create scan", error);
      throw error;
    }
  }

  private async triggerScanNotification(scanId: string): Promise<void> {
    try {
      logger.debug("Triggering scan notification", { scanId });
      await notificationService.createNotification({
        scanId,
        type: "scan_completed",
        message: "Your dental scan has been processed successfully!",
      });
    } catch (error) {
      logger.error("Error triggering notification", error);
    }
  }

  
  async getScanById(scanId: string): Promise<ScanResponse | null> {
    try {
      return await prisma.scan.findUnique({
        where: { id: scanId },
      });
    } catch (error) {
      logger.error("Failed to fetch scan", error);
      throw error;
    }
  }

  
  async getAllScans(): Promise<ScanResponse[]> {
    try {
      return await prisma.scan.findMany({
        orderBy: { createdAt: "desc" },
      });
    } catch (error) {
      logger.error("Failed to fetch scans", error);
      throw error;
    }
  }

  
  async updateScanStatus(scanId: string, status: string): Promise<ScanResponse> {
    try {
      const scan = await prisma.scan.update({
        where: { id: scanId },
        data: { status },
      });
      logger.info("Scan status updated", { scanId, status });
      return scan;
    } catch (error) {
      logger.error("Failed to update scan status", error);
      throw error;
    }
  }
}

export const scanService = new ScanService();

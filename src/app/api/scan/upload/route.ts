import { NextRequest, NextResponse } from "next/server";
import { scanService } from "@/services/scan.service";
import { logger } from "@/lib/logger";
import { asyncHandler } from "@/utils/asyncHandler";

export const POST = asyncHandler(async (req: NextRequest) => {
  try {
    const body = await req.json();
    const { images } = body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      logger.warn("Invalid scan upload request", { body });
      return NextResponse.json(
        { error: "Images array is required and must not be empty" },
        { status: 400 }
      );
    }

    const scan = await scanService.uploadScan({
      images,
      status: body.status || "pending",
    });

    logger.info("Scan uploaded successfully", { scanId: scan.id });

    return NextResponse.json(
      {
        success: true,
        scan,
        message: "Scan uploaded successfully. Notification triggered.",
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Error in scan upload endpoint", error);
    return NextResponse.json(
      { error: "Failed to upload scan" },
      { status: 500 }
    );
  }
});


export const GET = asyncHandler(async (req: NextRequest) => {
  try {
    const { searchParams } = new URL(req.url);
    const scanId = searchParams.get("scanId");

    if (!scanId) {
      return NextResponse.json(
        { error: "scanId query parameter is required" },
        { status: 400 }
      );
    }

    const scan = await scanService.getScanById(scanId);

    if (!scan) {
      return NextResponse.json({ error: "Scan not found" }, { status: 404 });
    }

    return NextResponse.json({ scan }, { status: 200 });
  } catch (error) {
    logger.error("Error fetching scan", error);
    return NextResponse.json(
      { error: "Failed to fetch scan" },
      { status: 500 }
    );
  }
});

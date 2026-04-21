import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";

type AsyncRouteHandler = (
  req: NextRequest
) => Promise<Response | NextResponse>;


export function asyncHandler(handler: AsyncRouteHandler) {
  return async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error) {
      logger.error("Unhandled route error", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  };
}

import { NextResponse } from "next/server";
import { PUSH_SERVICE_WORKER_SCRIPT } from "@/lib/push-service-worker";

export async function GET() {
  return new NextResponse(PUSH_SERVICE_WORKER_SCRIPT, {
    headers: {
      "Content-Type": "application/javascript",
      "Service-Worker-Allowed": "/",
    },
  });
}

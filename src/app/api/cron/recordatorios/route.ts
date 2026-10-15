import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { runDueReminders } from "@/lib/reminders/run";

export const dynamic = "force-dynamic";

function bearerMatches(header: string | null, secret: string): boolean {
  if (!header) return false;
  const received = Buffer.from(header);
  const expected = Buffer.from(`Bearer ${secret}`);
  if (received.length !== expected.length) return false;
  return timingSafeEqual(received, expected);
}

export async function POST(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "cron_not_configured" }, { status: 503 });
  }

  if (!bearerMatches(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await runDueReminders();
  if (result.error) {
    return NextResponse.json(result, { status: 500 });
  }

  return NextResponse.json(result);
}

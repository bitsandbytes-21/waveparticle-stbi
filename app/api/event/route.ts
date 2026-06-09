import { NextResponse } from "next/server";
import { logEvent, type EventType } from "@/lib/db";

export const runtime = "nodejs";

const TYPES: EventType[] = ["answer", "result", "cta_click"];
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function str(v: unknown, max: number): string | undefined {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return s ? s.slice(0, max) : undefined;
}

// Record one anonymous quiz event (answer / result / cta_click). No PII — the
// request IP is never read or stored. Always returns 200 (best-effort) so the
// client beacon never sees an error.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const d = body as Record<string, unknown>;
  const sessionId = str(d.sessionId, 40);
  const type = str(d.type, 20) as EventType | undefined;
  if (!sessionId || !UUID_RE.test(sessionId) || !type || !TYPES.includes(type)) {
    return NextResponse.json({ error: "invalid event" }, { status: 400 });
  }

  try {
    await logEvent({
      sessionId,
      type,
      questionId: str(d.questionId, 20),
      optionIndex: typeof d.optionIndex === "number" ? d.optionIndex : undefined,
      optionLabel: str(d.optionLabel, 200),
      companion: str(d.companion, 40),
      buddy: str(d.buddy, 40),
      cluster: str(d.cluster, 40),
      mode: str(d.mode, 40),
      utmSource: str(d.utmSource, 60),
    });
  } catch {
    // analytics is best-effort — never surface DB errors to the client
    return NextResponse.json({ ok: false }, { status: 200 });
  }
  return NextResponse.json({ ok: true });
}

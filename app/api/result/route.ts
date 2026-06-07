import { NextResponse } from "next/server";
import { COMPANIONS, isMbtiType, type CompanionId } from "@/data/mapping";
import { getStore, keys } from "@/lib/redis";

export const runtime = "nodejs";

// Record one anonymous result. No PII — just integer counters.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const data = body as { type?: string; companion?: string };
  const type = String(data.type ?? "").toUpperCase();
  const companion = String(data.companion ?? "");

  if (!isMbtiType(type) || !(companion in COMPANIONS)) {
    return NextResponse.json({ error: "invalid result" }, { status: 400 });
  }

  const store = getStore();
  const [, , total] = await Promise.all([
    store.incr(keys.type(type)),
    store.incr(keys.companion(companion as CompanionId)),
    store.incr(keys.total()),
  ]);

  return NextResponse.json({ ok: true, total });
}

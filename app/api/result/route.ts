import { NextResponse } from "next/server";
import { CLUSTERS, INTERACTION_MODES, isCompanionId } from "@/data/mapping";
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

  const data = body as { companion?: string; cluster?: string; mode?: string };
  const companion = String(data.companion ?? "");
  if (!isCompanionId(companion)) {
    return NextResponse.json({ error: "invalid result" }, { status: 400 });
  }
  const cluster = String(data.cluster ?? "");
  const mode = String(data.mode ?? "");

  const store = getStore();
  const [, total] = await Promise.all([
    store.incr(keys.companion(companion)),
    store.incr(keys.total()),
  ]);
  if (cluster in CLUSTERS) await store.incr(keys.cluster(cluster));
  if (mode in INTERACTION_MODES) await store.incr(keys.mode(mode));

  return NextResponse.json({ ok: true, total });
}

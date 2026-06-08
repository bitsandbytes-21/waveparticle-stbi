import { NextResponse } from "next/server";
import { COMPANIONS, CLUSTERS, INTERACTION_MODES } from "@/data/mapping";
import { ALL_POLLS } from "@/data/polls";
import { getStore, keys } from "@/lib/redis";

export const runtime = "nodejs";

// The "what most users prefer" dashboard data. Lightly protected: when
// STATS_TOKEN is set, require ?token= or x-stats-token. Open in local dev.
export async function GET(req: Request) {
  const token = process.env.STATS_TOKEN;
  if (token) {
    const provided =
      new URL(req.url).searchParams.get("token") ??
      req.headers.get("x-stats-token");
    if (provided !== token) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  const store = getStore();
  const companionIds = Object.keys(COMPANIONS);
  const clusterIds = Object.keys(CLUSTERS);
  const modeIds = Object.keys(INTERACTION_MODES);

  const [clusterCounts, companionCounts, modeCounts, totalArr] = await Promise.all([
    store.mget(clusterIds.map((c) => keys.cluster(c))),
    store.mget(companionIds.map((c) => keys.companion(c))),
    store.mget(modeIds.map((m) => keys.mode(m))),
    store.mget([keys.total()]),
  ]);

  const polls: Record<string, Record<string, number>> = {};
  for (const p of ALL_POLLS) {
    const counts = await store.mget(p.options.map((o) => keys.poll(p.id, o.id)));
    polls[p.id] = Object.fromEntries(p.options.map((o, i) => [o.id, counts[i]]));
  }

  return NextResponse.json({
    total: totalArr[0] ?? 0,
    byCluster: Object.fromEntries(clusterIds.map((c, i) => [c, clusterCounts[i]])),
    byCompanion: Object.fromEntries(companionIds.map((c, i) => [c, companionCounts[i]])),
    byMode: Object.fromEntries(modeIds.map((m, i) => [m, modeCounts[i]])),
    polls,
  });
}

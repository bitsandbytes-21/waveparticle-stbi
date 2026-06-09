import { NextResponse } from "next/server";
import { pollById } from "@/data/polls";
import { getStore, keys } from "@/lib/redis";

export const runtime = "nodejs";

async function talliesFor(pollId: string): Promise<Record<string, number> | null> {
  const poll = pollById(pollId);
  if (!poll) return null;
  const counts = await getStore().mget(
    poll.options.map((o) => keys.poll(pollId, o.id)),
  );
  const tallies: Record<string, number> = {};
  poll.options.forEach((o, i) => {
    tallies[o.id] = counts[i] ?? 0;
  });
  return tallies;
}

export async function GET(req: Request) {
  const pollId = new URL(req.url).searchParams.get("pollId") ?? "";
  const tallies = await talliesFor(pollId);
  if (!tallies) {
    return NextResponse.json({ error: "unknown poll" }, { status: 404 });
  }
  return NextResponse.json({ pollId, tallies });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  const data = body as { pollId?: string; optionId?: string; previousOptionId?: string };
  const pollId = String(data.pollId ?? "");
  const optionId = String(data.optionId ?? "");
  const previousOptionId = data.previousOptionId ? String(data.previousOptionId) : "";

  const poll = pollById(pollId);
  if (!poll || !poll.options.some((o) => o.id === optionId)) {
    return NextResponse.json({ error: "invalid vote" }, { status: 400 });
  }

  // Re-submitting the same choice is a no-op (don't inflate the count).
  if (previousOptionId === optionId) {
    const tallies = await talliesFor(pollId);
    return NextResponse.json({ ok: true, pollId, tallies });
  }

  const store = getStore();
  // Changing an existing vote: move the count off the prior option.
  if (previousOptionId && poll.options.some((o) => o.id === previousOptionId)) {
    await store.decr(keys.poll(pollId, previousOptionId));
  }
  await store.incr(keys.poll(pollId, optionId));
  const tallies = await talliesFor(pollId);
  return NextResponse.json({ ok: true, pollId, tallies });
}

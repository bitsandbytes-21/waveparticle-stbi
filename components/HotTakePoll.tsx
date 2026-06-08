"use client";

import { useEffect, useState } from "react";
import type { Poll } from "@/data/polls";

type Tallies = Record<string, number>;

function pct(n: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((n / total) * 100);
}

export default function HotTakePoll({ polls }: { polls: Poll[] }) {
  return (
    <div className="polls">
      {polls.map((p) => (
        <PollCard key={p.id} poll={p} />
      ))}
    </div>
  );
}

function PollCard({ poll }: { poll: Poll }) {
  const [tallies, setTallies] = useState<Tallies | null>(null);
  const [voted, setVoted] = useState<string | null>(null);
  const storageKey = `wp-vote-${poll.id}`;

  useEffect(() => {
    // Read prior vote synchronously (no setState here — that would trip the
    // set-state-in-effect rule and risk an SSR hydration mismatch); apply it
    // inside the async callbacks alongside the fetched tallies.
    let prior: string | null = null;
    try {
      prior = window.localStorage.getItem(storageKey);
    } catch {
      /* storage blocked */
    }
    fetch(`/api/vote?pollId=${encodeURIComponent(poll.id)}`)
      .then((r) => r.json())
      .then((d) => {
        setTallies(d.tallies ?? {});
        if (prior) setVoted(prior);
      })
      .catch(() => {
        setTallies({});
        if (prior) setVoted(prior);
      });
  }, [poll.id, storageKey]);

  async function vote(optionId: string) {
    if (voted) return;
    setVoted(optionId);
    try {
      window.localStorage.setItem(storageKey, optionId);
    } catch {
      /* storage blocked */
    }
    // optimistic bump
    setTallies((t) => ({ ...(t ?? {}), [optionId]: (t?.[optionId] ?? 0) + 1 }));
    try {
      const r = await fetch("/api/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ pollId: poll.id, optionId }),
      });
      const d = await r.json();
      if (d.tallies) setTallies(d.tallies);
    } catch {
      /* keep optimistic value */
    }
  }

  const showResults = voted !== null;
  const total = tallies
    ? Object.values(tallies).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="poll">
      <p className="poll-kicker">{poll.kicker}</p>
      <p className="poll-q">{poll.question}</p>
      <div className="poll-options">
        {poll.options.map((opt) => {
          const count = tallies?.[opt.id] ?? 0;
          const percent = pct(count, total);
          return (
            <button
              key={opt.id}
              className={`poll-option ${voted === opt.id ? "picked" : ""}`}
              onClick={() => vote(opt.id)}
              disabled={showResults}
            >
              {showResults && (
                <span className="pct" style={{ width: `${percent}%` }} />
              )}
              <span className="label">
                {opt.emoji} {opt.label}
              </span>
              {showResults && <span className="num">{percent}%</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

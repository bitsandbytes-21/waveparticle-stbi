"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const [recorded, setRecorded] = useState<string | null>(null); // the vote saved on the server
  const [selected, setSelected] = useState<string | null>(null); // the option currently highlighted
  const [pending, setPending] = useState(false);
  const storageKey = `wp-vote-${poll.id}`;

  useEffect(() => {
    // Read any prior vote synchronously, then apply it alongside the fetched
    // tallies (avoids set-state-in-effect / SSR hydration mismatches).
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
        if (prior) {
          setRecorded(prior);
          setSelected(prior);
        }
      })
      .catch(() => {
        setTallies({});
        if (prior) {
          setRecorded(prior);
          setSelected(prior);
        }
      });
  }, [poll.id, storageKey]);

  async function submit() {
    if (!selected || selected === recorded || pending) return;
    const previous = recorded;
    setPending(true);

    // Optimistic: move the count off the previous choice onto the new one.
    setTallies((t) => {
      const next = { ...(t ?? {}) };
      if (previous) next[previous] = Math.max(0, (next[previous] ?? 0) - 1);
      next[selected] = (next[selected] ?? 0) + 1;
      return next;
    });
    setRecorded(selected);
    try {
      window.localStorage.setItem(storageKey, selected);
    } catch {
      /* storage blocked */
    }

    try {
      const r = await fetch("/api/vote", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          pollId: poll.id,
          optionId: selected,
          previousOptionId: previous ?? undefined,
        }),
      });
      const d = await r.json();
      if (d.tallies) setTallies(d.tallies);
    } catch {
      /* keep the optimistic value */
    } finally {
      setPending(false);
    }
  }

  const showResults = recorded !== null;
  const total = tallies ? Object.values(tallies).reduce((a, b) => a + b, 0) : 0;
  const canSubmit = !!selected && selected !== recorded && !pending;

  return (
    <div className="poll">
      <p className="poll-kicker">{poll.kicker}</p>
      <p className="poll-q">{poll.question}</p>
      <div className="poll-options">
        {poll.options.map((opt) => {
          const count = tallies?.[opt.id] ?? 0;
          const percent = pct(count, total);
          const isSelected = selected === opt.id;
          const isRecorded = recorded === opt.id;
          return (
            <motion.button
              key={opt.id}
              type="button"
              className={`poll-option ${isSelected ? "picked" : ""} ${isRecorded ? "voted" : ""}`}
              onClick={() => setSelected(opt.id)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              aria-pressed={isSelected}
            >
              {showResults && (
                <motion.span
                  className="pct"
                  initial={false}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span className="label">
                {opt.emoji} {opt.label}
              </span>
              {showResults && <span className="num">{percent}%</span>}
            </motion.button>
          );
        })}
      </div>

      <div className="poll-foot">
        <span className="poll-hint">
          {recorded
            ? "✓ vote counted — change it anytime"
            : selected
              ? "ready when you are"
              : "tap to choose"}
        </span>
        <motion.button
          type="button"
          className="poll-submit"
          onClick={submit}
          disabled={!canSubmit}
          whileTap={canSubmit ? { scale: 0.95 } : undefined}
        >
          {pending ? "Saving…" : recorded ? "Update vote" : "Submit vote"}
        </motion.button>
      </div>
    </div>
  );
}

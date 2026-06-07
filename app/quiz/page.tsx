"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { QUESTIONS, TOTAL_QUESTIONS, type Letter } from "@/data/questions";
import { scoreToType, type Answers } from "@/lib/scoring";
import { companionForType } from "@/data/mapping";

export default function QuizPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);

  const q = QUESTIONS[index];
  const progress = Math.round((index / TOTAL_QUESTIONS) * 100);

  function choose(letter: Letter) {
    const next: Answers = { ...answers, [q.id]: letter };
    setAnswers(next);
    if (index < TOTAL_QUESTIONS - 1) {
      setIndex(index + 1);
    } else {
      void finish(next);
    }
  }

  async function finish(final: Answers) {
    setSubmitting(true);
    const type = scoreToType(final);
    const companion = companionForType(type);
    // Fire-and-forget aggregate counter — never block the reveal on it.
    try {
      await fetch("/api/result", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ type, companion: companion.id }),
        keepalive: true,
      });
    } catch {
      /* analytics is best-effort */
    }
    router.push(`/result/${type}`);
  }

  if (submitting) {
    return (
      <main className="wrap screen center">
        <div className="spin" />
        <p className="kicker">Analyzing your work style…</p>
      </main>
    );
  }

  return (
    <main className="wrap">
      <div style={{ height: 28 }} />
      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>
      <p className="progress-label">
        Question {index + 1} / {TOTAL_QUESTIONS}
      </p>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          className="qcard"
          initial={{ opacity: 0, x: 36 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -36 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <p className="q-meme">{q.meme}</p>
          <h2 className="q-prompt">{q.prompt}</h2>
          <div className="options">
            {q.options.map((opt) => (
              <button
                key={opt.letter}
                className="option"
                onClick={() => choose(opt.letter)}
              >
                <span className="option-emoji">{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="quiz-foot">
        <button
          className="linklike"
          onClick={() => index > 0 && setIndex(index - 1)}
          disabled={index === 0}
          style={{ opacity: index === 0 ? 0.35 : 1 }}
        >
          ← Back
        </button>
        <span className="linklike">no wrong answers</span>
      </div>
    </main>
  );
}

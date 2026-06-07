import type { Axis } from "./mapping";

// Each option pushes one MBTI letter. 3 questions per axis, all weight 1, so a
// single axis can never tie (odd count) and results are fully reproducible.
export type Letter = "E" | "I" | "S" | "N" | "T" | "F" | "J" | "P";

export interface QuizOption {
  emoji: string;
  label: string;
  letter: Letter;
}

export interface QuizQuestion {
  id: string;
  axis: Axis;
  prompt: string;
  meme: string; // small meme-y aside under the prompt
  options: QuizOption[];
}

export const QUESTIONS: QuizQuestion[] = [
  // ---- E / I : do you body-double, or lock in solo? ----
  {
    id: "q1",
    axis: "EI",
    prompt: "It's crunch time. What's the move?",
    meme: "deadline incoming, sirens blaring 🚨",
    options: [
      { emoji: "📣", label: "Open a call, narrate my whole plan out loud, feed off the energy", letter: "E" },
      { emoji: "🚪", label: "Phone face-down, door shut, become completely unreachable", letter: "I" },
    ],
  },
  {
    id: "q2",
    axis: "EI",
    prompt: "You hit a wall mid-task. You…",
    meme: "the brain has left the chat",
    options: [
      { emoji: "🦆", label: "Rubber-duck it out loud / spam the group chat instantly", letter: "E" },
      { emoji: "🧠", label: "Go quiet and grind it out inside my own head first", letter: "I" },
    ],
  },
  {
    id: "q3",
    axis: "EI",
    prompt: "Your real focus environment is…",
    meme: "be honest",
    options: [
      { emoji: "☕", label: "Loud café / coworking buzz — silence is genuinely creepy", letter: "E" },
      { emoji: "🎧", label: "Noise-cancelling everything. Just me and the void.", letter: "I" },
    ],
  },

  // ---- S / N : concrete checklist, or big-picture vision? ----
  {
    id: "q4",
    axis: "SN",
    prompt: "Handed a vague project, you FIRST…",
    meme: '"make it good" — cool, thanks',
    options: [
      { emoji: "📋", label: "Write the literal, boring, beautiful step-by-step checklist", letter: "S" },
      { emoji: "🌌", label: "Sketch the big vision and the vibe — details are future-me's problem", letter: "N" },
    ],
  },
  {
    id: "q5",
    axis: "SN",
    prompt: "When in doubt, you trust…",
    meme: "gut vs receipts",
    options: [
      { emoji: "📖", label: "What worked last time. Proven recipe, follow it.", letter: "S" },
      { emoji: "🔮", label: "A hunch about where this could actually go", letter: "N" },
    ],
  },
  {
    id: "q6",
    axis: "SN",
    prompt: "The brief says 'be creative.' You…",
    meme: "dangerous words",
    options: [
      { emoji: "🧱", label: "Need one concrete example to anchor on. Show me.", letter: "S" },
      { emoji: "🪁", label: "Am already five wild tangents deep into possibilities", letter: "N" },
    ],
  },

  // ---- T / F : logic & efficiency, or mood & meaning? ----
  {
    id: "q7",
    axis: "TF",
    prompt: "You pick what to do next based on…",
    meme: "the eternal struggle",
    options: [
      { emoji: "📈", label: "Cold ROI — whatever's the most efficient move", letter: "T" },
      { emoji: "❤️‍🔥", label: "Whatever I actually have the heart for right now", letter: "F" },
    ],
  },
  {
    id: "q8",
    axis: "TF",
    prompt: "A plan is technically correct but feels… off. You…",
    meme: "vibes are data, actually",
    options: [
      { emoji: "🤖", label: "Technically right wins. Ship it.", letter: "T" },
      { emoji: "🫶", label: "If it doesn't sit right with people, it's wrong", letter: "F" },
    ],
  },
  {
    id: "q9",
    axis: "TF",
    prompt: "The reward that hits hardest when you finish…",
    meme: "dopamine source check",
    options: [
      { emoji: "✅", label: "The metric going up. Clean, measurable, undeniable win.", letter: "T" },
      { emoji: "🌟", label: "Knowing it mattered / someone's genuinely glad I did it", letter: "F" },
    ],
  },

  // ---- J / P : plan-the-plan, or improvise and sprint? ----
  {
    id: "q10",
    axis: "JP",
    prompt: "Deadline is Friday. Realistically you finish…",
    meme: "no judgment (some judgment)",
    options: [
      { emoji: "🗓️", label: "Comfortably Wednesday. Planned it Monday, obviously.", letter: "J" },
      { emoji: "🔥", label: "11:58pm Friday. Gloriously. On pure adrenaline.", letter: "P" },
    ],
  },
  {
    id: "q11",
    axis: "JP",
    prompt: "Your to-do list is…",
    meme: "describe it in one word: chaos? or cathedral?",
    options: [
      { emoji: "🛐", label: "Sacred. Sorted, dated, checked off with deep joy.", letter: "J" },
      { emoji: "🌀", label: "A vague suggestion I keep rewriting and ignoring", letter: "P" },
    ],
  },
  {
    id: "q12",
    axis: "JP",
    prompt: "Plans change last-minute. You feel…",
    meme: "the true personality test",
    options: [
      { emoji: "😤", label: "Personally attacked. I had a SYSTEM.", letter: "J" },
      { emoji: "🕊️", label: "Free, honestly. Improvising is when I'm actually good.", letter: "P" },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

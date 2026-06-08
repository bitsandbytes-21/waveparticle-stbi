import type { AxisId, Pole } from "./mapping";

// Each option carries one or more "effects" — a vote for a pole on an axis. A
// single option can feed multiple axes (e.g. Q4 informs both EX and TM), and ER
// questions offer three choices. Scoring tallies these votes; see lib/scoring.ts.
export interface OptionEffect {
  axis: AxisId;
  pole: Pole;
}

export interface QuizOption {
  emoji: string;
  label: string;
  effects: OptionEffect[];
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  meme: string; // small meme-y aside under the prompt
  options: QuizOption[];
}

// Shorthand helpers for readable effect lists.
const e = (axis: AxisId, pole: Pole): OptionEffect => ({ axis, pole });

export const QUESTIONS: QuizQuestion[] = [
  // ---- SE · Social Energy : presence vs solitude --------------------------
  {
    id: "q1",
    prompt: "It's crunch time. What's the move?",
    meme: "deadline incoming, sirens blaring 🚨",
    options: [
      { emoji: "📣", label: "Open a call, narrate my whole plan out loud, feed off the energy", effects: [e("SE", "presence")] },
      { emoji: "🚪", label: "Phone face-down, door shut, become completely unreachable", effects: [e("SE", "solitude")] },
    ],
  },
  {
    id: "q2",
    prompt: "You hit a wall mid-task. You…",
    meme: "the brain has left the chat",
    options: [
      { emoji: "🦆", label: "Rubber-duck it out loud / spam the group chat instantly", effects: [e("SE", "presence")] },
      { emoji: "🧠", label: "Go quiet and grind it out inside my own head first", effects: [e("SE", "solitude")] },
    ],
  },
  {
    id: "q3",
    prompt: "Your real focus environment is…",
    meme: "no notes, just vibes",
    options: [
      { emoji: "☕", label: "Loud café / coworking buzz — silence is genuinely creepy", effects: [e("SE", "presence")] },
      { emoji: "🎧", label: "Noise-cancelling everything. Just me and the void.", effects: [e("SE", "solitude")] },
    ],
  },

  // ---- EX + TM · Execution Style & Thinking Mode --------------------------
  {
    id: "q4",
    prompt: "Handed a vague project, you FIRST…",
    meme: '"make it good" — cool, thanks',
    options: [
      { emoji: "📋", label: "Write the literal, boring, beautiful step-by-step checklist", effects: [e("EX", "checklist"), e("TM", "structured")] },
      { emoji: "🌌", label: "Sketch the big vision and the vibe — details are future-me's problem", effects: [e("EX", "flow"), e("TM", "intuitive")] },
    ],
  },
  {
    id: "q5",
    prompt: "When in doubt, you trust…",
    meme: "gut vs receipts",
    options: [
      { emoji: "📖", label: "What worked last time. Proven recipe, follow it.", effects: [e("TM", "structured")] },
      { emoji: "🔮", label: "A hunch about where this could actually go", effects: [e("TM", "intuitive")] },
    ],
  },
  {
    id: "q6",
    prompt: "The brief says 'be creative.' You…",
    meme: "dangerous words",
    options: [
      { emoji: "🧱", label: "Need one concrete example to anchor on. Show me.", effects: [e("TM", "structured")] },
      { emoji: "🪁", label: "Am already five wild tangents deep into possibilities", effects: [e("TM", "intuitive")] },
    ],
  },

  // ---- ER · Emotional Regulation : self / accountability / supported (3-way)
  {
    id: "q7",
    prompt: "What actually keeps you moving on a hard task?",
    meme: "the real fuel, be honest-ish",
    options: [
      { emoji: "🚀", label: "Nothing fancy — I lock in and drive myself", effects: [e("ER", "self")] },
      { emoji: "👮", label: "Knowing someone's checking. Don't make me look bad.", effects: [e("ER", "accountability")] },
      { emoji: "🫶", label: "Someone in my corner going 'you've got this'", effects: [e("ER", "supported")] },
    ],
  },
  {
    id: "q8",
    prompt: "Motivation has fully left the building. What brings it back?",
    meme: "tank on empty",
    options: [
      { emoji: "🧗", label: "I white-knuckle it solo. My problem to solve.", effects: [e("ER", "self")] },
      { emoji: "⏰", label: "A hard deadline and people waiting on me", effects: [e("ER", "accountability")] },
      { emoji: "☕", label: "A pep talk and a little company", effects: [e("ER", "supported")] },
    ],
  },
  {
    id: "q9",
    prompt: "The finish-line feeling you secretly chase…",
    meme: "dopamine source check",
    options: [
      { emoji: "🏁", label: "Quiet private satisfaction. I know what I did.", effects: [e("ER", "self")] },
      { emoji: "📊", label: "Reporting it DONE to someone who held me to it", effects: [e("ER", "accountability")] },
      { emoji: "🌟", label: "Someone genuinely glad I pulled it off", effects: [e("ER", "supported")] },
    ],
  },

  // ---- EX + ER · how you respond to structure / deadlines -----------------
  {
    id: "q10",
    prompt: "Deadline is Friday. Realistically you finish…",
    meme: "no judgment (some judgment)",
    options: [
      { emoji: "🗓️", label: "Comfortably Wednesday. Planned it Monday, obviously.", effects: [e("EX", "checklist"), e("ER", "accountability")] },
      { emoji: "🔥", label: "11:58pm Friday. Gloriously. On pure adrenaline.", effects: [e("EX", "flow"), e("ER", "self")] },
    ],
  },
  {
    id: "q11",
    prompt: "Your to-do list is…",
    meme: "one word: chaos? or cathedral?",
    options: [
      { emoji: "🛐", label: "Sacred. Sorted, dated, checked off with deep joy.", effects: [e("EX", "checklist"), e("ER", "accountability")] },
      { emoji: "🌀", label: "A vague suggestion I keep rewriting and ignoring", effects: [e("EX", "flow"), e("ER", "self")] },
    ],
  },
  {
    id: "q12",
    prompt: "Plans change last-minute. You feel…",
    meme: "the true vibe check",
    options: [
      { emoji: "😤", label: "Personally attacked. I had a SYSTEM.", effects: [e("EX", "checklist"), e("ER", "accountability")] },
      { emoji: "🕊️", label: "Free, honestly. Improvising is when I'm actually good.", effects: [e("EX", "flow"), e("ER", "self")] },
    ],
  },

  // ---- SI · Story Immersion : narrative vs ignore (the moat) --------------
  {
    id: "q13",
    prompt: "When you're working, your companion should feel like…",
    meme: "tool or teammate?",
    options: [
      { emoji: "🔧", label: "A tool that helps me finish tasks, efficiently", effects: [e("SI", "ignore")] },
      { emoji: "🎭", label: "A character I actually build a bond with over time", effects: [e("SI", "narrative"), e("ER", "supported")] },
    ],
  },
  {
    id: "q14",
    prompt: "You're stuck. You want your companion to…",
    meme: "drive, or co-pilot?",
    options: [
      { emoji: "🧭", label: "Give me the direct next step and structure my move", effects: [e("ER", "accountability"), e("EX", "checklist")] },
      { emoji: "🗣️", label: "Talk it through with me and evolve the plan together", effects: [e("ER", "supported"), e("EX", "flow")] },
    ],
  },
  {
    id: "q15",
    prompt: "You finish a task. You want your companion to…",
    meme: "the one that actually matters ⭐",
    options: [
      { emoji: "✔️", label: "Just confirm it's done and move to the next thing", effects: [e("SI", "ignore")] },
      { emoji: "🌍", label: "Update the story world based on what I just did", effects: [e("SI", "narrative")] },
    ],
  },
];

export const TOTAL_QUESTIONS = QUESTIONS.length;

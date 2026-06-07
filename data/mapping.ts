// ---------------------------------------------------------------------------
// The 16 -> 8 core: MBTI type -> Wave Particle companion, plus all the persona
// copy the result card needs. Tunable by design — edit COMPANIONS / TYPE_META /
// MBTI_TO_COMPANION here without touching the scoring or UI logic.
// ---------------------------------------------------------------------------

export type Axis = "EI" | "SN" | "TF" | "JP";

export type MbtiType =
  | "INTJ" | "INTP" | "ENTJ" | "ENTP"
  | "INFJ" | "INFP" | "ENFJ" | "ENFP"
  | "ISTJ" | "ISFJ" | "ESTJ" | "ESFJ"
  | "ISTP" | "ISFP" | "ESTP" | "ESFP";

export type CompanionId =
  | "heisenberg" | "oppenheimer" | "moriarty" | "villanelle"
  | "snape" | "olivia" | "zhenhuan" | "iggy";

export interface Companion {
  id: CompanionId;
  name: string; // short display name
  fullName: string; // canonical character name
  origin: string; // where they're from
  avatar: string; // /companions/<id>.webp
  accent: string; // hex used for gradients / glow
  emoji: string; // meme shorthand
  tagline: string; // who they are, in one breath
  quote: string; // signature line for the result + share card
  workStyle: string; // HOW they get you to finish under a deadline
  greenFlag: string; // why working with them rules
  redFlag: string; // the (funny) catch
}

export const COMPANIONS: Record<CompanionId, Companion> = {
  heisenberg: {
    id: "heisenberg",
    name: "Heisenberg",
    fullName: "Walter White",
    origin: "Breaking Bad",
    avatar: "/companions/heisenberg.webp",
    accent: "#7ed957",
    emoji: "🧪",
    tagline: "The methodical mastermind who turns every task into precise chemistry.",
    quote: "The chemistry doesn't lie. Neither does your deadline.",
    workStyle:
      "Breaks the chaos into exact steps, applies relentless pressure, and refuses to let one loose variable ruin the batch. No improvising — purity, yield, control.",
    greenFlag: "Will not let you half-finish anything. Ever.",
    redFlag: "Mildly terrifying about your color-coded spreadsheet.",
  },
  oppenheimer: {
    id: "oppenheimer",
    name: "Oppenheimer",
    fullName: "J. Robert Oppenheimer",
    origin: "Oppenheimer",
    avatar: "/companions/oppenheimer.webp",
    accent: "#ff8c42",
    emoji: "💥",
    tagline: "The haunted genius who makes finishing the work feel like destiny.",
    quote: "Theory will only take you so far. Now do the work.",
    workStyle:
      "Zooms out to the meaning of the thing, then channels existential dread into focus. Big-picture first, then a sudden, total commitment to the deliverable.",
    greenFlag: "Makes a boring task feel world-historically important.",
    redFlag: "May spiral about the ethics of your inbox.",
  },
  moriarty: {
    id: "moriarty",
    name: "Moriarty",
    fullName: "James Moriarty",
    origin: "Sherlock",
    avatar: "/companions/moriarty.webp",
    accent: "#b06cff",
    emoji: "🃏",
    tagline: "The charming chaos agent who turns your to-do list into a game worth winning.",
    quote: "Every fairy tale needs a good old-fashioned to-do list.",
    workStyle:
      "Reframes the grind as a delicious game with stakes, twists, and a rival to beat. Thrives on improvisation and a little theatrical pressure.",
    greenFlag: "Makes deep work weirdly fun and a bit dangerous.",
    redFlag: "Might gamify your taxes for the drama.",
  },
  villanelle: {
    id: "villanelle",
    name: "Villanelle",
    fullName: "Oksana Astankova",
    origin: "Killing Eve",
    avatar: "/companions/villanelle.webp",
    accent: "#ff4f9a",
    emoji: "💅",
    tagline: "The impulsive icon who makes finishing fast look effortlessly chic.",
    quote: "Boring is the only real crime. Try to keep up.",
    workStyle:
      "Hates the dull part as much as you do — so she makes it stylish, fast, and over with. Sprints of bold, in-the-moment energy. Zero patience for busywork.",
    greenFlag: "Kills procrastination on sight.",
    redFlag: "Will judge your shoes mid-task.",
  },
  snape: {
    id: "snape",
    name: "Severus Snape",
    fullName: "Severus Snape",
    origin: "Harry Potter",
    avatar: "/companions/snape.webp",
    accent: "#1f9d6b",
    emoji: "🧙",
    tagline: "The exacting perfectionist who accepts precisely zero excuses.",
    quote: "Obviously, you'll finish. The alternative is... disappointing.",
    workStyle:
      "Demands standards, follows the recipe to the letter, and dispenses dry, withering accountability until the work is correct. Quietly, ruthlessly devoted to your success.",
    greenFlag: "Catches the mistake you'd have shipped.",
    redFlag: "The silence after a typo is deafening.",
  },
  olivia: {
    id: "olivia",
    name: "Olivia Dunham",
    fullName: "Olivia Dunham",
    origin: "Fringe",
    avatar: "/companions/olivia.webp",
    accent: "#4f9dff",
    emoji: "🕵️‍♀️",
    tagline: "The steady investigator who walks you through it, calmly, until it's done.",
    quote: "Let's walk through it again. One step. Then the next.",
    workStyle:
      "Methodical, warm, and unshakeable under pressure. Breaks the impossible into a clear sequence and keeps you grounded when it gets weird.",
    greenFlag: "The calmest voice in your most chaotic deadline.",
    redFlag: "Suspiciously good at noticing you're avoiding the hard task.",
  },
  zhenhuan: {
    id: "zhenhuan",
    name: "Zhen Huan",
    fullName: "Zhen Huan",
    origin: "Empresses in the Palace",
    avatar: "/companions/zhenhuan.webp",
    accent: "#e0b03b",
    emoji: "🏯",
    tagline: "The patient strategist who reads the room and plays the long game flawlessly.",
    quote: "Patience is a weapon. Use it, and the work bends to you.",
    workStyle:
      "Graceful, composed, endlessly strategic. Sequences your moves so the hardest part lands at exactly the right moment. Never rushed, never beaten.",
    greenFlag: "Turns a messy project into elegant, winning strategy.",
    redFlag: "Three moves ahead of your excuses.",
  },
  iggy: {
    id: "iggy",
    name: "Iggy",
    fullName: "Iggy the Boston Terrier",
    origin: "JoJo's Bizarre Adventure",
    avatar: "/companions/iggy.webp",
    accent: "#ff6a3d",
    emoji: "🐶",
    tagline: "Pure instinct and reluctant courage — zero plan, all heart, somehow wins.",
    quote: "*snort*. We're doing this. Don't make it weird.",
    workStyle:
      "No overthinking. Smells the one thing that matters, locks on, and stubbornly refuses to quit until it's done. Runs on instinct and spite.",
    greenFlag: "Gets the impossible thing done by sheer refusal to stop.",
    redFlag: "Will absolutely ignore your beautiful Gantt chart.",
  },
};

export interface TypeMeta {
  nickname: string; // classic MBTI flavor title
  blurb: string; // one-line work-style read
}

// All 16 types -> flavor copy used on the result card.
export const TYPE_META: Record<MbtiType, TypeMeta> = {
  INTJ: { nickname: "The Architect", blurb: "Strategy first. You build the whole plan in your head before you move." },
  ENTJ: { nickname: "The Commander", blurb: "You take charge, set the pace, and drag the deadline to its knees." },
  ENTP: { nickname: "The Debater", blurb: "You hack the task into a game and win on improvisation." },
  ESTP: { nickname: "The Daredevil", blurb: "You thrive at the last possible second, full throttle." },
  INTP: { nickname: "The Logician", blurb: "You need the idea to make sense before the work makes progress." },
  INFJ: { nickname: "The Advocate", blurb: "You finish things that mean something — purpose is your fuel." },
  ESFP: { nickname: "The Entertainer", blurb: "You make the grind fun and sprint through the boring bits." },
  ISFP: { nickname: "The Adventurer", blurb: "Quiet, stylish, in-the-moment — you do it your own way." },
  ISTJ: { nickname: "The Logistician", blurb: "Checklist, order, follow-through. The recipe gets followed." },
  ISTP: { nickname: "The Virtuoso", blurb: "You learn by doing and fix it with cool, hands-on precision." },
  ISFJ: { nickname: "The Defender", blurb: "Steady, reliable, quietly relentless until it's truly done." },
  ESTJ: { nickname: "The Executive", blurb: "You organize the chaos and hold everyone (yourself first) to it." },
  ENFJ: { nickname: "The Protagonist", blurb: "You read the room and rally momentum toward the finish." },
  ESFJ: { nickname: "The Consul", blurb: "You keep the wheels turning and the team (or just you) on track." },
  ENFP: { nickname: "The Campaigner", blurb: "Big-hearted bursts of inspiration, fueled by what excites you." },
  INFP: { nickname: "The Mediator", blurb: "You finish what you believe in — instinct and meaning lead." },
};

// The 16 -> 8 mapping. Each companion owns exactly two types.
export const MBTI_TO_COMPANION: Record<MbtiType, CompanionId> = {
  INTJ: "heisenberg",
  ENTJ: "heisenberg",
  ENTP: "moriarty",
  ESTP: "moriarty",
  INTP: "oppenheimer",
  INFJ: "oppenheimer",
  ESFP: "villanelle",
  ISFP: "villanelle",
  ISTJ: "snape",
  ISTP: "snape",
  ISFJ: "olivia",
  ESTJ: "olivia",
  ENFJ: "zhenhuan",
  ESFJ: "zhenhuan",
  ENFP: "iggy",
  INFP: "iggy",
};

export const ALL_TYPES = Object.keys(MBTI_TO_COMPANION) as MbtiType[];

export function isMbtiType(value: string): value is MbtiType {
  return Object.prototype.hasOwnProperty.call(MBTI_TO_COMPANION, value);
}

export function companionForType(type: MbtiType): Companion {
  return COMPANIONS[MBTI_TO_COMPANION[type]];
}

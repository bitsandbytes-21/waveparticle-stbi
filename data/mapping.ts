// ---------------------------------------------------------------------------
// The product-axis core: 5 axes -> nearest-profile companion match -> archetype
// cluster (the companion's own label) -> interaction mode. All tunable by design —
// edit COMPANIONS / CLUSTERS / INTERACTION_MODES / the per-companion `profile` here
// without touching the scoring or UI logic.
// ---------------------------------------------------------------------------

// ---- The 5 product axes (replacing the 4 MBTI axes) -----------------------
// Four axes are binary (a value in [-1, +1], + = the "pos" pole). ER is 3-way.
export type AxisId = "SE" | "EX" | "TM" | "ER" | "SI";
export type BinaryAxisId = "SE" | "EX" | "TM" | "SI";

// The 3 states of Emotional Regulation. Order is the deterministic tiebreak order.
export type ErState = "self" | "accountability" | "supported";
export const ER_STATES: ErState[] = ["self", "accountability", "supported"];

export type Pole =
  | "presence" | "solitude" // SE — Social Energy
  | "checklist" | "flow" // EX — Execution Style
  | "structured" | "intuitive" // TM — Thinking Mode
  | ErState // ER — Emotional Regulation (3-way)
  | "narrative" | "ignore"; // SI — Story Immersion (the moat)

export const BINARY_AXES: BinaryAxisId[] = ["SE", "EX", "TM", "SI"];

// For each binary axis: which pole is the +1 ("pos") end, plus short display labels.
export const AXIS_POLES: Record<
  BinaryAxisId,
  { pos: Pole; neg: Pole; posLabel: string; negLabel: string }
> = {
  SE: { pos: "presence", neg: "solitude", posLabel: "Presence", negLabel: "Solitude" },
  EX: { pos: "checklist", neg: "flow", posLabel: "Checklist", negLabel: "Flow" },
  TM: { pos: "structured", neg: "intuitive", posLabel: "Structured", negLabel: "Intuitive" },
  SI: { pos: "narrative", neg: "ignore", posLabel: "Story", negLabel: "Just the task" },
};

export interface AxisMeta {
  id: AxisId;
  name: string;
  blurb: string;
}

export const AXIS_META: Record<AxisId, AxisMeta> = {
  SE: { id: "SE", name: "Social Energy", blurb: "Do you need presence or solitude to function?" },
  EX: { id: "EX", name: "Execution Style", blurb: "Checklist-driven or flow-driven?" },
  TM: { id: "TM", name: "Thinking Mode", blurb: "Structured logic or intuitive exploration?" },
  ER: { id: "ER", name: "Emotional Regulation", blurb: "What keeps you moving when it's hard?" },
  SI: { id: "SI", name: "Story Immersion", blurb: "Do you engage with the narrative, or ignore it?" },
};

export const ER_LABEL: Record<ErState, string> = {
  self: "Self-driven",
  accountability: "Accountability-driven",
  supported: "Emotionally supported",
};

// How each ER style should shape the companion's nudging — turns the axis into a
// concrete product recommendation on the result page (conversion copy).
export const ER_SUPPORT: Record<ErState, string> = {
  self: "set your own pace — your companion stays out of the way until you call it in.",
  accountability: "lean on deadlines and check-ins — let your companion hold the line.",
  supported: "let your companion talk it through and hype you up when momentum dips.",
};

// ---- Archetype clusters (a labeling layer over the 8 companions) ----------
export type ClusterId =
  | "strategist"
  | "narrative-driver"
  | "chaos-partner"
  | "soft-accountability"
  | "high-pressure";

export interface ClusterMeta {
  id: ClusterId;
  name: string;
  emoji: string;
  blurb: string;
}

export const CLUSTERS: Record<ClusterId, ClusterMeta> = {
  strategist: {
    id: "strategist",
    name: "The Strategist",
    emoji: "🧭",
    blurb: "You build the whole plan before you move. Order in, chaos out.",
  },
  "narrative-driver": {
    id: "narrative-driver",
    name: "The Narrative Driver",
    emoji: "📖",
    blurb: "You finish what means something. Story is your fuel.",
  },
  "chaos-partner": {
    id: "chaos-partner",
    name: "The Chaos Partner",
    emoji: "🎲",
    blurb: "You run on improvisation and stakes. Make it a game, then win it.",
  },
  "soft-accountability": {
    id: "soft-accountability",
    name: "Soft Accountability",
    emoji: "🫂",
    blurb: "You go furthest when someone's calmly in your corner.",
  },
  "high-pressure": {
    id: "high-pressure",
    name: "The High-Pressure Performer",
    emoji: "🔥",
    blurb: "Standards, stakes, zero excuses — the pressure is the point.",
  },
};

// ---- Interaction mode (how story-heavy the companion experience should be) -
export type ModeId = "story-heavy" | "task-heavy" | "hybrid";

export interface ModeMeta {
  id: ModeId;
  name: string;
  emoji: string;
  blurb: string;
  setup: string; // how to run Wave Particle in this mode (conversion copy)
}

export const INTERACTION_MODES: Record<ModeId, ModeMeta> = {
  "story-heavy": {
    id: "story-heavy",
    name: "Story-heavy",
    emoji: "🎭",
    blurb: "The world evolves with every task you finish.",
    setup: "Turn on the living story so your companion's world grows every time you finish something.",
  },
  "task-heavy": {
    id: "task-heavy",
    name: "Task-heavy",
    emoji: "✅",
    blurb: "Less lore, more done. Confirm and move on.",
    setup: "Keep it lean — crisp plans, fast check-offs, minimal lore between you and done.",
  },
  hybrid: {
    id: "hybrid",
    name: "Hybrid",
    emoji: "⚖️",
    blurb: "A little story, a lot of finishing.",
    setup: "Run a light story thread over a focused task flow — momentum first, flavor second.",
  },
};

// ---- Companions ------------------------------------------------------------
export type CompanionId =
  | "heisenberg" | "oppenheimer" | "moriarty" | "villanelle"
  | "snape" | "olivia" | "zhenhuan" | "iggy";

// A companion's target position on each axis. Used for nearest-profile matching.
// Each profile is unique, so every companion is reachable from the quiz.
export interface CompanionProfile {
  SE: "presence" | "solitude";
  EX: "checklist" | "flow";
  TM: "structured" | "intuitive";
  SI: "narrative" | "ignore";
  ER: ErState;
}

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
  cluster: ClusterId; // archetype label shown on the result
  buddy: CompanionId; // complementary companion who patches this one's weak loop
  pairingPitch: string; // why that buddy covers your gap (shown on the result)
  profile: CompanionProfile; // 5-axis target for matching
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
    cluster: "strategist",
    buddy: "moriarty",
    pairingPitch:
      "Your control is airtight — Moriarty keeps it from curdling into burnout by turning the grind into a game worth playing.",
    profile: { SE: "solitude", EX: "checklist", TM: "structured", ER: "self", SI: "ignore" },
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
    cluster: "narrative-driver",
    buddy: "olivia",
    pairingPitch:
      "When you spiral into what it all means, Olivia calmly walks you back to the next single step.",
    profile: { SE: "solitude", EX: "flow", TM: "intuitive", ER: "supported", SI: "narrative" },
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
    cluster: "chaos-partner",
    buddy: "snape",
    pairingPitch:
      "You'll gamify anything — Snape holds the standards you can't charm your way past.",
    profile: { SE: "presence", EX: "flow", TM: "intuitive", ER: "accountability", SI: "narrative" },
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
    cluster: "chaos-partner",
    buddy: "zhenhuan",
    pairingPitch:
      "You sprint and skip the boring bits — Zhen Huan's patience makes sure the careful moves still happen.",
    profile: { SE: "presence", EX: "flow", TM: "intuitive", ER: "self", SI: "ignore" },
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
    cluster: "high-pressure",
    buddy: "oppenheimer",
    pairingPitch:
      "Your standards are merciless — Oppenheimer reminds you why the work matters, so it isn't just cold correctness.",
    profile: { SE: "solitude", EX: "checklist", TM: "structured", ER: "accountability", SI: "ignore" },
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
    cluster: "soft-accountability",
    buddy: "villanelle",
    pairingPitch:
      "You're calm and methodical — Villanelle brings the urgency that turns 'one more step' into 'done, today.'",
    profile: { SE: "presence", EX: "checklist", TM: "structured", ER: "supported", SI: "narrative" },
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
    cluster: "strategist",
    buddy: "iggy",
    pairingPitch:
      "You play the long game beautifully — Iggy is the nudge that makes you start now instead of waiting for the perfect moment.",
    profile: { SE: "presence", EX: "checklist", TM: "structured", ER: "self", SI: "narrative" },
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
    cluster: "narrative-driver",
    buddy: "heisenberg",
    pairingPitch:
      "You run on pure instinct — Heisenberg hands you the exact plan so all that heart actually lands the result.",
    profile: { SE: "solitude", EX: "flow", TM: "intuitive", ER: "self", SI: "narrative" },
  },
};

export const ALL_COMPANIONS = Object.keys(COMPANIONS) as CompanionId[];

export function isCompanionId(value: string): value is CompanionId {
  return Object.prototype.hasOwnProperty.call(COMPANIONS, value);
}

export function clusterForCompanion(id: CompanionId): ClusterMeta {
  return CLUSTERS[COMPANIONS[id].cluster];
}

/** The complementary companion paired to patch this one's weak loop (hybrid result). */
export function buddyFor(id: CompanionId): Companion {
  return COMPANIONS[COMPANIONS[id].buddy];
}

/**
 * Inverse of buddyFor: the matched companion whose study buddy is `buddyId`.
 * The pairings form a single cycle (no fixed points), so this is always unique.
 * Lets the result page pick a buddy directly via the matched-companion route.
 */
export function companionForBuddy(buddyId: CompanionId): CompanionId {
  return ALL_COMPANIONS.find((id) => COMPANIONS[id].buddy === buddyId) ?? buddyId;
}

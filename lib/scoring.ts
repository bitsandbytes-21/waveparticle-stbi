import { QUESTIONS } from "@/data/questions";
import {
  AXIS_POLES,
  BINARY_AXES,
  ER_STATES,
  ALL_COMPANIONS,
  COMPANIONS,
  INTERACTION_MODES,
  clusterForCompanion,
  type BinaryAxisId,
  type ErState,
  type Pole,
  type CompanionId,
  type Companion,
  type CompanionProfile,
  type ClusterMeta,
  type ModeMeta,
} from "@/data/mapping";

// questionId -> chosen option index. Index handles both 2- and 3-choice questions.
export type Answers = Record<string, number>;

// A scored answer set. Binary axes are a value in [-1, +1] (+ = the axis "pos"
// pole); ER is one of three categorical states.
export interface AxisVector {
  SE: number;
  EX: number;
  TM: number;
  SI: number;
  ER: ErState;
}

export interface ScoreResult {
  vector: AxisVector;
  companion: Companion;
  cluster: ClusterMeta;
  mode: ModeMeta;
}

/** Pick the ER state with the most votes; ties resolve by ER_STATES order. */
function erWinner(counts: Record<ErState, number>): ErState {
  let best: ErState = ER_STATES[0];
  for (const state of ER_STATES) {
    if (counts[state] > counts[best]) best = state;
  }
  return best;
}

/** Tally every chosen option's effects into a 5-axis vector. Fully reproducible. */
export function scoreVector(answers: Answers): AxisVector {
  const binary: Record<BinaryAxisId, { pos: number; neg: number }> = {
    SE: { pos: 0, neg: 0 },
    EX: { pos: 0, neg: 0 },
    TM: { pos: 0, neg: 0 },
    SI: { pos: 0, neg: 0 },
  };
  const er: Record<ErState, number> = { self: 0, accountability: 0, supported: 0 };

  for (const q of QUESTIONS) {
    const idx = answers[q.id];
    if (idx == null) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    for (const eff of opt.effects) {
      if (eff.axis === "ER") {
        er[eff.pole as ErState] += 1;
      } else {
        const axis = eff.axis as BinaryAxisId;
        if (eff.pole === AXIS_POLES[axis].pos) binary[axis].pos += 1;
        else if (eff.pole === AXIS_POLES[axis].neg) binary[axis].neg += 1;
      }
    }
  }

  const val = (a: BinaryAxisId): number => {
    const { pos, neg } = binary[a];
    const total = pos + neg;
    return total === 0 ? 0 : (pos - neg) / total;
  };

  return { SE: val("SE"), EX: val("EX"), TM: val("TM"), SI: val("SI"), ER: erWinner(er) };
}

// ---- Nearest-profile companion match --------------------------------------
// Distance = sum of |user - target| over the 4 binary axes (each in [-1,1], so a
// per-axis contribution of 0..2) plus a flat penalty when the ER state differs.
const ER_MISMATCH_PENALTY = 1.0;

function poleSign(axis: BinaryAxisId, pole: Pole): number {
  return pole === AXIS_POLES[axis].pos ? 1 : -1;
}

/** A companion's profile expressed as the same shape as a scored AxisVector. */
export function profileToVector(profile: CompanionProfile): AxisVector {
  return {
    SE: poleSign("SE", profile.SE),
    EX: poleSign("EX", profile.EX),
    TM: poleSign("TM", profile.TM),
    SI: poleSign("SI", profile.SI),
    ER: profile.ER,
  };
}

export function companionDistance(vector: AxisVector, profile: CompanionProfile): number {
  const t = profileToVector(profile);
  let d = 0;
  for (const a of BINARY_AXES) d += Math.abs(vector[a] - t[a]);
  if (vector.ER !== t.ER) d += ER_MISMATCH_PENALTY;
  return d;
}

/** Closest companion to the vector; ties resolve by ALL_COMPANIONS order. */
export function selectCompanion(vector: AxisVector): Companion {
  let bestId: CompanionId = ALL_COMPANIONS[0];
  let bestD = Infinity;
  for (const id of ALL_COMPANIONS) {
    const d = companionDistance(vector, COMPANIONS[id].profile);
    if (d < bestD) {
      bestD = d;
      bestId = id;
    }
  }
  return COMPANIONS[bestId];
}

/** Story Immersion drives the interaction mode. */
export function deriveMode(vector: AxisVector): ModeMeta {
  if (vector.SI >= 0.34) return INTERACTION_MODES["story-heavy"];
  if (vector.SI <= -0.34) return INTERACTION_MODES["task-heavy"];
  return INTERACTION_MODES.hybrid;
}

/** Full result: vector -> companion (nearest) -> cluster (its label) -> mode. */
export function score(answers: Answers): ScoreResult {
  const vector = scoreVector(answers);
  const companion = selectCompanion(vector);
  return {
    vector,
    companion,
    cluster: clusterForCompanion(companion.id),
    mode: deriveMode(vector),
  };
}

// ---- Compact URL encoding ---------------------------------------------------
// The quiz attaches the taker's real vector to the result URL so the page can
// show their exact axes/mode. Shared/cold links omit it and fall back to the
// companion's own profile (see ResultDetails).
export function encodeVector(vector: AxisVector): Record<string, string> {
  return {
    se: String(Math.round(vector.SE * 100)),
    ex: String(Math.round(vector.EX * 100)),
    tm: String(Math.round(vector.TM * 100)),
    si: String(Math.round(vector.SI * 100)),
    er: vector.ER,
  };
}

export function decodeVector(get: (key: string) => string | null): AxisVector | null {
  const raw = { se: get("se"), ex: get("ex"), tm: get("tm"), si: get("si"), er: get("er") };
  if (raw.se == null || raw.ex == null || raw.tm == null || raw.si == null || raw.er == null) {
    return null;
  }
  if (!ER_STATES.includes(raw.er as ErState)) return null;
  const nums = [raw.se, raw.ex, raw.tm, raw.si].map(Number);
  if (nums.some((n) => Number.isNaN(n))) return null;
  const clamp = (n: number) => Math.max(-1, Math.min(1, n / 100));
  return {
    SE: clamp(nums[0]),
    EX: clamp(nums[1]),
    TM: clamp(nums[2]),
    SI: clamp(nums[3]),
    ER: raw.er as ErState,
  };
}

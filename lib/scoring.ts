import { QUESTIONS, type Letter } from "@/data/questions";
import {
  type Axis,
  type MbtiType,
  type Companion,
  companionForType,
  isMbtiType,
} from "@/data/mapping";

// questionId -> chosen letter
export type Answers = Record<string, Letter>;

const AXIS_ORDER: Axis[] = ["EI", "SN", "TF", "JP"];

// Left pole listed first; ties resolve to the left pole for reproducibility.
const AXIS_POLES: Record<Axis, [Letter, Letter]> = {
  EI: ["E", "I"],
  SN: ["S", "N"],
  TF: ["T", "F"],
  JP: ["J", "P"],
};

export interface AxisScore {
  axis: Axis;
  left: { letter: Letter; count: number };
  right: { letter: Letter; count: number };
  winner: Letter;
}

export interface ScoreResult {
  type: MbtiType;
  companion: Companion;
  axes: AxisScore[];
}

function tallyLetters(answers: Answers): Record<Letter, number> {
  const counts: Record<Letter, number> = {
    E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
  };
  for (const q of QUESTIONS) {
    const chosen = answers[q.id];
    if (chosen) counts[chosen] += 1;
  }
  return counts;
}

/** Turn a set of answers into a 4-letter MBTI type. Ties default to the left pole. */
export function scoreToType(answers: Answers): MbtiType {
  const counts = tallyLetters(answers);
  let type = "";
  for (const axis of AXIS_ORDER) {
    const [left, right] = AXIS_POLES[axis];
    type += counts[left] >= counts[right] ? left : right;
  }
  if (!isMbtiType(type)) {
    // Should be unreachable: every 4-letter combo of the poles is a valid type.
    throw new Error(`Computed an invalid MBTI type: ${type}`);
  }
  return type;
}

/** Full result including the per-axis breakdown and matched companion. */
export function score(answers: Answers): ScoreResult {
  const counts = tallyLetters(answers);
  const type = scoreToType(answers);
  const axes: AxisScore[] = AXIS_ORDER.map((axis) => {
    const [left, right] = AXIS_POLES[axis];
    return {
      axis,
      left: { letter: left, count: counts[left] },
      right: { letter: right, count: counts[right] },
      winner: counts[left] >= counts[right] ? left : right,
    };
  });
  return { type, companion: companionForType(type), axes };
}

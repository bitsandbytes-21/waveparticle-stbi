import { describe, it, expect } from "vitest";
import { QUESTIONS, type Letter } from "@/data/questions";
import {
  ALL_TYPES,
  COMPANIONS,
  MBTI_TO_COMPANION,
  companionForType,
  type Axis,
  type CompanionId,
} from "@/data/mapping";
import { score, scoreToType, type Answers } from "@/lib/scoring";

// Build a full answer set by forcing every question of an axis to one letter.
function answersFor(letters: Record<Axis, Letter>): Answers {
  const a: Answers = {};
  for (const q of QUESTIONS) a[q.id] = letters[q.axis];
  return a;
}

describe("scoreToType", () => {
  it("maps all-left answers (E/S/T/J) to ESTJ -> Olivia", () => {
    const type = scoreToType(answersFor({ EI: "E", SN: "S", TF: "T", JP: "J" }));
    expect(type).toBe("ESTJ");
    expect(companionForType(type).id).toBe("olivia");
  });

  it("maps all-right answers (I/N/F/P) to INFP -> Iggy", () => {
    const type = scoreToType(answersFor({ EI: "I", SN: "N", TF: "F", JP: "P" }));
    expect(type).toBe("INFP");
    expect(companionForType(type).id).toBe("iggy");
  });

  it("maps I/N/T/J to INTJ -> Heisenberg", () => {
    const type = scoreToType(answersFor({ EI: "I", SN: "N", TF: "T", JP: "J" }));
    expect(type).toBe("INTJ");
    expect(companionForType(type).id).toBe("heisenberg");
  });

  it("resolves an axis tie toward the left pole (deterministic)", () => {
    // EI: 1 E vs 1 I (q3 unanswered) -> tie -> E. Other axes decisive.
    const answers: Answers = { q1: "E", q2: "I", q4: "S", q5: "S", q6: "S",
      q7: "T", q8: "T", q9: "T", q10: "J", q11: "J", q12: "J" };
    const type = scoreToType(answers);
    expect(type[0]).toBe("E");
    expect(type).toBe("ESTJ");
  });

  it("is reproducible — same answers, same type", () => {
    const a = answersFor({ EI: "I", SN: "N", TF: "T", JP: "P" });
    expect(scoreToType(a)).toBe(scoreToType(a));
  });
});

describe("score (full breakdown)", () => {
  it("returns matched companion and per-axis counts summing to questions answered", () => {
    const result = score(answersFor({ EI: "I", SN: "N", TF: "T", JP: "J" }));
    expect(result.type).toBe("INTJ");
    expect(result.companion.id).toBe("heisenberg");
    expect(result.axes).toHaveLength(4);
    for (const axis of result.axes) {
      // 3 questions per axis, all answered
      expect(axis.left.count + axis.right.count).toBe(3);
    }
  });
});

describe("16 -> 8 mapping integrity", () => {
  it("covers all 16 MBTI types", () => {
    expect(ALL_TYPES).toHaveLength(16);
    expect(new Set(ALL_TYPES).size).toBe(16);
  });

  it("assigns every type to a valid companion, exactly two types each", () => {
    const counts: Record<string, number> = {};
    for (const type of ALL_TYPES) {
      const companion = companionForType(type);
      expect(companion).toBeDefined();
      expect(companion.avatar).toMatch(/^\/companions\/.+\.webp$/);
      counts[companion.id] = (counts[companion.id] ?? 0) + 1;
    }
    const ids = Object.keys(COMPANIONS) as CompanionId[];
    expect(ids).toHaveLength(8);
    for (const id of ids) {
      expect(counts[id]).toBe(2);
    }
  });

  it("MBTI_TO_COMPANION only references real companions", () => {
    for (const id of Object.values(MBTI_TO_COMPANION)) {
      expect(COMPANIONS[id]).toBeDefined();
    }
  });
});

describe("question set", () => {
  it("has 12 questions, 3 per axis, each option pushing the correct axis", () => {
    expect(QUESTIONS).toHaveLength(12);
    const perAxis: Record<string, number> = {};
    const axisLetters: Record<Axis, Letter[]> = {
      EI: ["E", "I"], SN: ["S", "N"], TF: ["T", "F"], JP: ["J", "P"],
    };
    for (const q of QUESTIONS) {
      perAxis[q.axis] = (perAxis[q.axis] ?? 0) + 1;
      for (const opt of q.options) {
        expect(axisLetters[q.axis]).toContain(opt.letter);
      }
    }
    expect(perAxis).toEqual({ EI: 3, SN: 3, TF: 3, JP: 3 });
  });
});

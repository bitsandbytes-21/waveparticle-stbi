import { describe, it, expect } from "vitest";
import { QUESTIONS, TOTAL_QUESTIONS } from "@/data/questions";
import {
  ALL_COMPANIONS,
  COMPANIONS,
  CLUSTERS,
  INTERACTION_MODES,
  AXIS_POLES,
  BINARY_AXES,
  ER_STATES,
  clusterForCompanion,
  isCompanionId,
} from "@/data/mapping";
import {
  scoreVector,
  selectCompanion,
  companionDistance,
  deriveMode,
  score,
  profileToVector,
  encodeVector,
  decodeVector,
  type Answers,
} from "@/lib/scoring";

// Choose the option index on a question whose effects include a given pole.
function optionIndexForPole(qId: string, pole: string): number {
  const q = QUESTIONS.find((x) => x.id === qId)!;
  const idx = q.options.findIndex((o) => o.effects.some((e) => e.pole === pole));
  if (idx < 0) throw new Error(`no option for ${pole} on ${qId}`);
  return idx;
}

describe("scoreVector", () => {
  it("maps all-presence SE answers to SE = +1", () => {
    const a: Answers = {
      q1: optionIndexForPole("q1", "presence"),
      q2: optionIndexForPole("q2", "presence"),
      q3: optionIndexForPole("q3", "presence"),
    };
    expect(scoreVector(a).SE).toBe(1);
  });

  it("maps all-solitude SE answers to SE = -1", () => {
    const a: Answers = {
      q1: optionIndexForPole("q1", "solitude"),
      q2: optionIndexForPole("q2", "solitude"),
      q3: optionIndexForPole("q3", "solitude"),
    };
    expect(scoreVector(a).SE).toBe(-1);
  });

  it("returns a neutral 0 for an axis with no answers", () => {
    expect(scoreVector({}).SI).toBe(0);
  });

  it("picks the ER state with the most votes", () => {
    const a: Answers = {
      q7: optionIndexForPole("q7", "supported"),
      q8: optionIndexForPole("q8", "supported"),
      q9: optionIndexForPole("q9", "self"),
    };
    expect(scoreVector(a).ER).toBe("supported");
  });

  it("resolves an ER tie by ER_STATES order (self first)", () => {
    // one self, one accountability, nothing else -> self wins the tie.
    const a: Answers = {
      q7: optionIndexForPole("q7", "self"),
      q8: optionIndexForPole("q8", "accountability"),
    };
    expect(scoreVector(a).ER).toBe("self");
  });

  it("is reproducible — same answers, same vector", () => {
    const a: Answers = { q1: 0, q4: 0, q7: 1, q15: 1 };
    expect(scoreVector(a)).toEqual(scoreVector(a));
  });
});

describe("selectCompanion (nearest profile)", () => {
  it("returns each companion exactly when fed its own profile vector", () => {
    for (const id of ALL_COMPANIONS) {
      const vector = profileToVector(COMPANIONS[id].profile);
      expect(selectCompanion(vector).id).toBe(id);
    }
  });

  it("every companion is reachable — all 8 profiles are unique", () => {
    const seen = new Set(
      ALL_COMPANIONS.map((id) => selectCompanion(profileToVector(COMPANIONS[id].profile)).id),
    );
    expect(seen.size).toBe(8);
  });

  it("scores distance 0 against an exactly-matching profile", () => {
    const c = COMPANIONS.heisenberg;
    expect(companionDistance(profileToVector(c.profile), c.profile)).toBe(0);
  });

  it("is deterministic on ties (falls to ALL_COMPANIONS order)", () => {
    const neutral = scoreVector({}); // all-zero binary, ER defaults to self
    expect(selectCompanion(neutral).id).toBe(selectCompanion(neutral).id);
  });
});

describe("deriveMode", () => {
  it("strong narrative -> story-heavy", () => {
    expect(deriveMode({ SE: 0, EX: 0, TM: 0, SI: 1, ER: "self" }).id).toBe("story-heavy");
  });
  it("strong ignore -> task-heavy", () => {
    expect(deriveMode({ SE: 0, EX: 0, TM: 0, SI: -1, ER: "self" }).id).toBe("task-heavy");
  });
  it("balanced SI -> hybrid", () => {
    expect(deriveMode({ SE: 0, EX: 0, TM: 0, SI: 0, ER: "self" }).id).toBe("hybrid");
  });
});

describe("score (full result)", () => {
  it("ties cluster to the matched companion and returns a valid mode", () => {
    const result = score({ q1: 0, q4: 0, q7: 1, q13: 1, q15: 1 });
    expect(isCompanionId(result.companion.id)).toBe(true);
    expect(result.cluster.id).toBe(clusterForCompanion(result.companion.id).id);
    expect(INTERACTION_MODES[result.mode.id]).toBeDefined();
  });
});

describe("URL vector codec", () => {
  it("round-trips a vector through encode/decode", () => {
    const vector = { SE: 1, EX: -1, TM: 0.5, SI: -0.5, ER: "supported" as const };
    const encoded = encodeVector(vector);
    const decoded = decodeVector((k) => encoded[k] ?? null);
    expect(decoded).toEqual(vector);
  });

  it("returns null when params are missing or invalid", () => {
    expect(decodeVector(() => null)).toBeNull();
    const bad = { se: "0", ex: "0", tm: "0", si: "0", er: "nope" } as Record<string, string>;
    expect(decodeVector((k) => bad[k] ?? null)).toBeNull();
  });
});

describe("companion + cluster integrity", () => {
  it("has 8 companions, each with a real avatar, cluster, and profile", () => {
    expect(ALL_COMPANIONS).toHaveLength(8);
    for (const id of ALL_COMPANIONS) {
      const c = COMPANIONS[id];
      expect(c.avatar).toMatch(/^\/companions\/.+\.webp$/);
      expect(CLUSTERS[c.cluster]).toBeDefined();
      expect(ER_STATES).toContain(c.profile.ER);
      for (const a of BINARY_AXES) {
        expect([AXIS_POLES[a].pos, AXIS_POLES[a].neg]).toContain(c.profile[a]);
      }
    }
  });

  it("uses all 5 clusters across the 8 companions", () => {
    const used = new Set<string>(ALL_COMPANIONS.map((id) => COMPANIONS[id].cluster));
    expect(used).toEqual(new Set(Object.keys(CLUSTERS)));
  });
});

describe("question set", () => {
  it("has 15 questions with valid, non-empty effects on every option", () => {
    expect(TOTAL_QUESTIONS).toBe(15);
    const validPoles = new Set<string>([
      ...ER_STATES,
      ...BINARY_AXES.flatMap((a) => [AXIS_POLES[a].pos, AXIS_POLES[a].neg]),
    ]);
    for (const q of QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      for (const opt of q.options) {
        expect(opt.effects.length).toBeGreaterThan(0);
        for (const eff of opt.effects) expect(validPoles.has(eff.pole)).toBe(true);
      }
    }
  });

  it("has at least one 3-choice ER question", () => {
    const threeChoice = QUESTIONS.filter((q) => q.options.length === 3);
    expect(threeChoice.length).toBeGreaterThanOrEqual(1);
    for (const q of threeChoice) {
      const poles = q.options.flatMap((o) => o.effects.map((e) => e.pole));
      expect(poles).toEqual(expect.arrayContaining([...ER_STATES]));
    }
  });
});

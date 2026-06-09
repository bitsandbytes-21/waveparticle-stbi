import { neon } from "@neondatabase/serverless";

// Event-level analytics sink (Neon Postgres). Stores only anonymous data: a
// random session id, which option was selected, the computed result, and
// whether the app CTA was clicked. No PII (no IP / name / email) is stored.
//
// No-ops when DATABASE_URL is unset, so local dev / previews without a DB behave
// exactly as before — same graceful-fallback pattern as lib/redis.ts.
export type EventType = "answer" | "result" | "cta_click";

export interface QuizEvent {
  sessionId: string;
  type: EventType;
  questionId?: string;
  optionIndex?: number;
  optionLabel?: string;
  companion?: string;
  buddy?: string;
  cluster?: string;
  mode?: string;
  utmSource?: string;
}

const url = process.env.DATABASE_URL;
const sql = url ? neon(url) : null;

export function analyticsEnabled(): boolean {
  return sql !== null;
}

export async function logEvent(ev: QuizEvent): Promise<void> {
  if (!sql) return; // no DB configured — silently skip
  await sql`
    insert into quiz_events
      (session_id, type, question_id, option_index, option_label,
       companion, buddy, cluster, mode, utm_source)
    values
      (${ev.sessionId}, ${ev.type}, ${ev.questionId ?? null}, ${ev.optionIndex ?? null},
       ${ev.optionLabel ?? null}, ${ev.companion ?? null}, ${ev.buddy ?? null},
       ${ev.cluster ?? null}, ${ev.mode ?? null}, ${ev.utmSource ?? null})
  `;
}

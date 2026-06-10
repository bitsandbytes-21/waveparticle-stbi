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

// Upserts keep the table duplicate-free (see scripts/db-dedupe.sql for the
// partial unique indexes): double-fired beacons are absorbed, and a re-answer
// via the Back button overwrites the old row — one FINAL state per session.
export async function logEvent(ev: QuizEvent): Promise<void> {
  if (!sql) return; // no DB configured — silently skip
  if (ev.type === "answer") {
    // Latest answer wins (editable votes).
    await sql`
      insert into quiz_events
        (session_id, type, question_id, option_index, option_label, utm_source)
      values
        (${ev.sessionId}, 'answer', ${ev.questionId ?? null}, ${ev.optionIndex ?? null},
         ${ev.optionLabel ?? null}, ${ev.utmSource ?? null})
      on conflict (session_id, question_id) where type = 'answer'
      do update set option_index = excluded.option_index,
                    option_label = excluded.option_label,
                    created_at = now()
    `;
  } else if (ev.type === "result") {
    // Latest result wins (re-answers / retakes recompute it).
    await sql`
      insert into quiz_events
        (session_id, type, companion, buddy, cluster, mode, utm_source)
      values
        (${ev.sessionId}, 'result', ${ev.companion ?? null}, ${ev.buddy ?? null},
         ${ev.cluster ?? null}, ${ev.mode ?? null}, ${ev.utmSource ?? null})
      on conflict (session_id) where type = 'result'
      do update set companion = excluded.companion, buddy = excluded.buddy,
                    cluster = excluded.cluster, mode = excluded.mode,
                    created_at = now()
    `;
  } else {
    // First CTA click wins — conversion is binary per session.
    await sql`
      insert into quiz_events (session_id, type, utm_source)
      values (${ev.sessionId}, 'cta_click', ${ev.utmSource ?? null})
      on conflict (session_id) where type = 'cta_click' do nothing
    `;
  }
}

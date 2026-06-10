import { neon } from "@neondatabase/serverless";

// Event-level analytics sink (Neon Postgres). Stores only anonymous data keyed
// by a random session id. No PII (no IP / name / email) is stored.
//
// One narrow table per event type — every column NOT NULL (see
// scripts/db-reshape.sql for the schema):
//   quiz_answers      latest answer per (session, question) — Back-button edits overwrite
//   quiz_results      latest computed result per session (buddy/cluster/mode)
//   quiz_buddy_picks  the user's OWN buddy choice from the result-page override
//                     grid — the "who do people actually want" popularity signal
//   quiz_cta_clicks   first app-CTA click per session (conversion is binary)
//
// No-ops when DATABASE_URL is unset, so local dev / previews without a DB behave
// exactly as before — same graceful-fallback pattern as lib/redis.ts.
export type EventType = "answer" | "result" | "buddy_pick" | "cta_click";

export interface QuizEvent {
  sessionId: string;
  type: EventType;
  questionId?: string;
  optionIndex?: number;
  optionLabel?: string;
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

// Throws on a payload missing its type's required fields, so the API route's
// catch logs it instead of silently writing a junk row.
export async function logEvent(ev: QuizEvent): Promise<void> {
  if (!sql) return; // no DB configured — silently skip
  switch (ev.type) {
    case "answer": {
      const { questionId, optionIndex, optionLabel } = ev;
      if (!questionId || optionIndex === undefined || !optionLabel) {
        throw new Error("answer event missing questionId/optionIndex/optionLabel");
      }
      await sql`
        insert into quiz_answers (session_id, question_id, option_index, option_label)
        values (${ev.sessionId}, ${questionId}, ${optionIndex}, ${optionLabel})
        on conflict (session_id, question_id)
        do update set option_index = excluded.option_index,
                      option_label = excluded.option_label,
                      created_at = now()
      `;
      return;
    }
    case "result": {
      if (!ev.buddy) throw new Error("result event missing buddy");
      await sql`
        insert into quiz_results (session_id, buddy, cluster, mode, utm_source)
        values (${ev.sessionId}, ${ev.buddy}, ${ev.cluster ?? ""}, ${ev.mode ?? ""},
                ${ev.utmSource ?? ""})
        on conflict (session_id)
        do update set buddy = excluded.buddy, cluster = excluded.cluster,
                      mode = excluded.mode, created_at = now()
      `;
      return;
    }
    case "buddy_pick": {
      if (!ev.buddy) throw new Error("buddy_pick event missing buddy");
      await sql`
        insert into quiz_buddy_picks (session_id, buddy)
        values (${ev.sessionId}, ${ev.buddy})
        on conflict (session_id)
        do update set buddy = excluded.buddy, created_at = now()
      `;
      return;
    }
    case "cta_click":
      await sql`
        insert into quiz_cta_clicks (session_id, buddy)
        values (${ev.sessionId}, ${ev.buddy ?? ""})
        on conflict (session_id) do nothing
      `;
      return;
  }
}

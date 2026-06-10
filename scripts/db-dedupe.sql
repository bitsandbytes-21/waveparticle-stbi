-- Dedupe quiz_events + enforce uniqueness going forward.
--
-- Why: sendBeacon can double-fire (double-tap during the card exit animation —
-- see rows like two identical q8 answers 246ms apart), and the Back button lets
-- users legitimately re-answer a question. The table should hold the FINAL
-- state per session: latest answer per question, latest result, first CTA click.
-- lib/db.ts upserts against these indexes (ON CONFLICT), and Postgres REJECTS
-- an ON CONFLICT clause whose target index doesn't exist — so this MUST run
-- before deploying that change, or every event insert will fail.
--
-- Run in Neon's SQL Editor.

-- 1) Drop older duplicate answers — keep the most recent per (session, question).
delete from quiz_events a
using quiz_events b
where a.type = 'answer' and b.type = 'answer'
  and a.session_id = b.session_id
  and a.question_id = b.question_id
  and (a.created_at, a.id) < (b.created_at, b.id);

-- 2) Drop older duplicate results — keep the most recent per session.
delete from quiz_events a
using quiz_events b
where a.type = 'result' and b.type = 'result'
  and a.session_id = b.session_id
  and (a.created_at, a.id) < (b.created_at, b.id);

-- 3) Drop repeat CTA clicks — keep the FIRST per session (conversion is binary).
delete from quiz_events a
using quiz_events b
where a.type = 'cta_click' and b.type = 'cta_click'
  and a.session_id = b.session_id
  and (a.created_at, a.id) > (b.created_at, b.id);

-- 4) Enforce: one answer per question, one result, one cta_click — per session.
create unique index if not exists quiz_events_answer_uniq
  on quiz_events (session_id, question_id) where type = 'answer';
create unique index if not exists quiz_events_result_uniq
  on quiz_events (session_id) where type = 'result';
create unique index if not exists quiz_events_cta_uniq
  on quiz_events (session_id) where type = 'cta_click';

-- Verify: every count should be 0.
select
  (select count(*) - count(distinct (session_id, question_id))
     from quiz_events where type = 'answer')  as dup_answers,
  (select count(*) - count(distinct session_id)
     from quiz_events where type = 'result')  as dup_results,
  (select count(*) - count(distinct session_id)
     from quiz_events where type = 'cta_click') as dup_ctas;

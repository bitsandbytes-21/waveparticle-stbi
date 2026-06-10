-- Reshape: replace the single wide quiz_events table (answer/result/cta rows
-- forced nulls into each other's columns) with one narrow table per event type.
-- Every column is NOT NULL. companion is dropped — buddy is a 1:1 mapping of it
-- (data/mapping.ts), so it carried no extra information. quiz_buddy_picks is
-- new: the user's own explicit buddy choice from the result-page override grid,
-- the direct popularity signal.
--
-- lib/db.ts writes to these tables, so run this BEFORE deploying that change.
-- Safe to run whether or not the old dedupe migration ran (distinct on dedupes).
-- Run in Neon's SQL Editor.

-- 1) New shape. Primary keys double as the dedupe guarantee:
--    one final answer per question, one result, one pick, one CTA — per session.
create table if not exists quiz_answers (
  session_id   uuid        not null,
  question_id  text        not null,
  option_index int         not null,
  option_label text        not null,
  created_at   timestamptz not null default now(),
  primary key (session_id, question_id)
);

create table if not exists quiz_results (
  session_id uuid        primary key,
  buddy      text        not null,
  cluster    text        not null,
  mode       text        not null,
  utm_source text        not null default '',
  created_at timestamptz not null default now()
);

-- The user's OWN choice from the "pick a different study buddy" grid — measures
-- which character people actively want, vs quiz_results which is who they got.
create table if not exists quiz_buddy_picks (
  session_id uuid        primary key,
  buddy      text        not null,
  created_at timestamptz not null default now()
);

create table if not exists quiz_cta_clicks (
  session_id uuid        primary key,
  buddy      text        not null default '',
  created_at timestamptz not null default now()
);

-- 2) Migrate existing rows (latest answer/result per session, first CTA click;
--    skips __db_check__ diagnostics and rows missing required fields).
insert into quiz_answers (session_id, question_id, option_index, option_label, created_at)
select distinct on (session_id, question_id)
       session_id::uuid, question_id, option_index, option_label, created_at
from quiz_events
where type = 'answer'
  and question_id is not null and option_index is not null and option_label is not null
order by session_id, question_id, created_at desc
on conflict do nothing;

insert into quiz_results (session_id, buddy, cluster, mode, utm_source, created_at)
select distinct on (session_id)
       session_id::uuid, buddy, coalesce(cluster, ''), coalesce(mode, ''),
       coalesce(utm_source, ''), created_at
from quiz_events
where type = 'result' and buddy is not null and buddy <> '__db_check__'
order by session_id, created_at desc
on conflict do nothing;

insert into quiz_cta_clicks (session_id, buddy, created_at)
select distinct on (session_id)
       session_id::uuid, coalesce(buddy, ''), created_at
from quiz_events
where type = 'cta_click'
order by session_id, created_at asc
on conflict do nothing;

-- 3) Keep the old table as a read-only backup. After verifying the new tables,
--    drop it with:  drop table quiz_events_legacy;
alter table quiz_events rename to quiz_events_legacy;

-- ---------------------------------------------------------------------------
-- Popularity queries (the reason quiz_buddy_picks exists):
--
-- Who the quiz matches most:
--   select buddy, count(*) from quiz_results group by buddy order by 2 desc;
--
-- Who users actively CHOOSE for themselves:
--   select buddy, count(*) from quiz_buddy_picks group by buddy order by 2 desc;
--
-- Final buddy per session (own pick overrides the match):
--   select coalesce(p.buddy, r.buddy) as final_buddy, count(*)
--   from quiz_results r
--   left join quiz_buddy_picks p using (session_id)
--   group by 1 order by 2 desc;

-- Fix: Neon SQL Editor exports showed quiz_events.created_at in UTC (+00),
-- so quizzes taken in the evening (US Eastern) appeared dated the NEXT day.
--
-- created_at is timestamptz: the stored instant is correct; only the display
-- timezone was UTC (Neon's default). This sets the database default so every
-- future session — including the Neon SQL Editor and CSV exports — renders
-- timestamps in US Eastern, with daylight saving handled automatically.
-- Existing rows are unaffected on disk and will simply display correctly.
--
-- Run in Neon's SQL Editor. If your database isn't named "neondb",
-- check with:  select current_database();
ALTER DATABASE neondb SET timezone = 'America/New_York';

-- Verify (run in a NEW SQL Editor session/tab — the setting applies to
-- connections opened after the ALTER):
--   show timezone;                                   -- America/New_York
--   select created_at from quiz_events limit 5;      -- now shows -04 / -05

-- Note for one-off queries elsewhere (or if you ever want UTC back per-query):
--   select created_at at time zone 'America/New_York' from quiz_events;

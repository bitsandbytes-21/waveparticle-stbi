// Diagnostic: verifies the Neon connection, the quiz_events table, an insert,
// and a read — printing the REAL error if anything fails (the API route swallows
// errors on purpose). Run from the repo root:  node scripts/db-check.mjs
// It reads DATABASE_URL from the environment or from .env.local.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";
import { randomUUID } from "node:crypto";

function loadEnvLocal() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  try {
    const txt = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
    for (const line of txt.split("\n")) {
      const m = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);
      if (m) return m[1].trim().replace(/^["']|["']$/g, "");
    }
  } catch {
    /* no .env.local */
  }
  return undefined;
}

const url = loadEnvLocal();
if (!url) {
  console.error("✗ DATABASE_URL not found (set it in the environment or .env.local).");
  process.exit(1);
}
console.log("• Using DATABASE_URL host:", new URL(url).host);

const sql = neon(url);

try {
  await sql`select 1 as ok`;
  console.log("✓ Connected to Neon.");
} catch (e) {
  console.error("✗ CONNECTION FAILED:", e.message);
  process.exit(1);
}

const exists = await sql`select to_regclass('public.quiz_events') as t`;
if (!exists[0].t) {
  console.error("✗ Table 'quiz_events' does NOT exist. Run the CREATE TABLE SQL in Neon's SQL Editor.");
  process.exit(1);
}
console.log("✓ Table 'quiz_events' exists.");

// lib/db.ts upserts with ON CONFLICT against these partial unique indexes —
// if they're missing, EVERY insert fails. Created by scripts/db-dedupe.sql.
const want = ["quiz_events_answer_uniq", "quiz_events_result_uniq", "quiz_events_cta_uniq"];
const have = (await sql`select indexname from pg_indexes where tablename = 'quiz_events'`).map((r) => r.indexname);
const missing = want.filter((n) => !have.includes(n));
if (missing.length) {
  console.error("✗ Missing dedupe indexes:", missing.join(", "));
  console.error("  Run scripts/db-dedupe.sql in Neon's SQL Editor — inserts FAIL without them.");
  process.exit(1);
}
console.log("✓ Dedupe indexes present.");

try {
  const sid = randomUUID();
  await sql`insert into quiz_events (session_id, type, companion, buddy)
            values (${sid}, 'result', '__db_check__', '__db_check__')`;
  console.log("✓ Insert succeeded (session", sid + ").");
} catch (e) {
  console.error("✗ INSERT FAILED:", e.message);
  process.exit(1);
}

const counts = await sql`select type, count(*)::int as n from quiz_events group by type order by type`;
console.log("✓ Read succeeded. Row counts by type:", counts);

// Timezone sanity: created_at is timestamptz (stored UTC — correct), but if the
// database default timezone is UTC, Neon SQL Editor exports show "+00" times.
// Fix once with scripts/db-timezone.sql.
const [{ timezone }] = await sql`show timezone`;
if (timezone === "America/New_York") {
  console.log("✓ Database timezone is America/New_York — exports show local time.");
} else {
  console.warn(`⚠ Database timezone is '${timezone}' — exports will show that zone, not US Eastern.`);
  console.warn("  Run scripts/db-timezone.sql in Neon's SQL Editor to fix the display.");
}
const recent = await sql`
  select type, coalesce(question_id, companion, '') as what,
         to_char(created_at at time zone 'America/New_York', 'YYYY-MM-DD HH12:MI:SS AM') as eastern_time
  from quiz_events order by created_at desc limit 3`;
console.log("• Latest events (US Eastern):", recent);
console.log("\nAll good. (Delete the __db_check__ test rows with: delete from quiz_events where companion = '__db_check__';)");

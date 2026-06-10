// Diagnostic: verifies the Neon connection, the per-event-type tables, an
// insert, and a read — printing the REAL error if anything fails (the API route
// swallows errors on purpose). Run from the repo root:  node scripts/db-check.mjs
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

// lib/db.ts writes to these — created by scripts/db-reshape.sql.
const TABLES = ["quiz_answers", "quiz_results", "quiz_buddy_picks", "quiz_cta_clicks"];
for (const t of TABLES) {
  const exists = await sql`select to_regclass(${"public." + t}) as t`;
  if (!exists[0].t) {
    console.error(`✗ Table '${t}' does NOT exist. Run scripts/db-reshape.sql in Neon's SQL Editor.`);
    process.exit(1);
  }
}
console.log("✓ Tables exist:", TABLES.join(", "));

try {
  const sid = randomUUID();
  await sql`insert into quiz_results (session_id, buddy, cluster, mode)
            values (${sid}, '__db_check__', '', '')`;
  console.log("✓ Insert succeeded (session", sid + ").");
} catch (e) {
  console.error("✗ INSERT FAILED:", e.message);
  process.exit(1);
}

const counts = await sql`
  select 'answers' as what, count(*)::int as n from quiz_answers
  union all select 'results', count(*)::int from quiz_results
  union all select 'buddy_picks', count(*)::int from quiz_buddy_picks
  union all select 'cta_clicks', count(*)::int from quiz_cta_clicks`;
console.log("✓ Read succeeded. Row counts:", counts);

// Timezone sanity: timestamps are stored UTC (correct); if the database default
// timezone is UTC, Neon SQL Editor exports show "+00" times. Fix once with
// scripts/db-timezone.sql.
const [{ timezone }] = await sql`show timezone`;
if (timezone === "America/New_York") {
  console.log("✓ Database timezone is America/New_York — exports show local time.");
} else {
  console.warn(`⚠ Database timezone is '${timezone}' — exports will show that zone, not US Eastern.`);
  console.warn("  Run scripts/db-timezone.sql in Neon's SQL Editor to fix the display.");
}

const popularity = await sql`
  select r.buddy, count(*)::int as matched,
         (select count(*)::int from quiz_buddy_picks p where p.buddy = r.buddy) as picked
  from quiz_results r
  where r.buddy <> '__db_check__'
  group by r.buddy order by matched desc`;
console.log("• Buddy popularity (matched by quiz vs picked by user):", popularity);

console.log("\nAll good. (Delete the __db_check__ test rows with: delete from quiz_results where buddy = '__db_check__';)");

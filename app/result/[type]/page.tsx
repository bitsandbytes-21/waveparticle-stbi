/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ALL_TYPES,
  TYPE_META,
  companionForType,
  isMbtiType,
} from "@/data/mapping";
import { pollsForCompanion } from "@/data/polls";
import { APP_URL } from "@/lib/constants";
import ShareButtons from "@/components/ShareButtons";
import HotTakePoll from "@/components/HotTakePoll";

// Pre-render all 16 result pages as static HTML — perfect for share crawlers.
export function generateStaticParams() {
  return ALL_TYPES.map((type) => ({ type }));
}

const AXIS_DECODE = [
  { left: "E", right: "I" },
  { left: "S", right: "N" },
  { left: "T", right: "F" },
  { left: "J", right: "P" },
] as const;

type Params = { params: Promise<{ type: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { type: raw } = await params;
  const type = raw.toUpperCase();
  if (!isMbtiType(type)) return { title: "Unknown type" };
  const companion = companionForType(type);
  const meta = TYPE_META[type];
  const title = `${type} — ${companion.name}`;
  const description = `I'm ${type} (${meta.nickname}). My Wave Particle work companion is ${companion.name}: "${companion.quote}" Which fictional menace finishes YOUR to-do list?`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: Params) {
  const { type: raw } = await params;
  const type = raw.toUpperCase();
  if (!isMbtiType(type)) notFound();

  const companion = companionForType(type);
  const meta = TYPE_META[type];
  const polls = pollsForCompanion(companion.id);
  const accentStyle = { "--accent": companion.accent } as CSSProperties;

  const shareText = `I'm ${type} — my Wave Particle work companion is ${companion.name} ${companion.emoji}. Which fictional menace finishes YOUR to-do list?`;

  return (
    <main className="wrap" style={accentStyle}>
      <article className="result-card">
        <p className="kicker center">your work-style type</p>
        <div className="center">
          <span className="type-code">{type.split("").join(" ")}</span>
          <h1 className="type-nick">{meta.nickname}</h1>
          <p className="type-blurb">{meta.blurb}</p>
        </div>

        <p className="match-label center">— your companion is —</p>

        <div className="companion-avatar">
          <img src={companion.avatar} alt={companion.name} />
        </div>

        <div className="center">
          <div className="companion-name">{companion.name}</div>
          <div className="companion-origin">{companion.origin}</div>
        </div>

        <blockquote className="companion-quote">“{companion.quote}”</blockquote>

        <p className="workstyle">
          <span className="tag mono">how they get you to finish: </span>
          {companion.workStyle}
        </p>

        <div className="flag-grid">
          <div className="flag">
            <span className="tag">green flag ✅</span>
            {companion.greenFlag}
          </div>
          <div className="flag">
            <span className="tag">the catch 😅</span>
            {companion.redFlag}
          </div>
        </div>

        <div className="axes">
          {AXIS_DECODE.map((ax, i) => {
            const winner = type[i];
            const leftWins = winner === ax.left;
            return (
              <div className="axis" key={ax.left + ax.right}>
                <span className={`pole ${leftWins ? "win" : ""}`}>{ax.left}</span>
                <div className="axis-track">
                  <div
                    className="axis-fill"
                    style={{ left: leftWins ? 0 : "50%", width: "50%" }}
                  />
                </div>
                <span className={`pole ${!leftWins ? "win" : ""}`}>{ax.right}</span>
              </div>
            );
          })}
        </div>

        <ShareButtons text={shareText} />
      </article>

      <section className="cta-app">
        <h3>Now go finish something with {companion.name}.</h3>
        <p>
          {companion.name} is a real companion inside Wave Particle — set a goal,
          get a timed plan, and let them push you to the finish line.
        </p>
        <a
          className="btn btn-primary btn-lg btn-block"
          href={APP_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          Try Wave Particle →
        </a>
      </section>

      <div className="section-head">
        <h2>🔥 Hot Takes</h2>
        <p>Settle the debate (and tell us how the stories should go).</p>
      </div>
      <HotTakePoll polls={polls} />

      <p className="foot-note">
        <Link href="/quiz">↺ Retake the test</Link> · Fan-made &amp; not affiliated
        with the original rights holders.
      </p>
    </main>
  );
}

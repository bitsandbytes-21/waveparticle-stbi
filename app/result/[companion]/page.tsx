/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ALL_COMPANIONS,
  COMPANIONS,
  clusterForCompanion,
  isCompanionId,
} from "@/data/mapping";
import { pollsForCompanion } from "@/data/polls";
import { appUrlFor } from "@/lib/constants";
import { deriveMode, profileToVector } from "@/lib/scoring";
import ShareButtons from "@/components/ShareButtons";
import HotTakePoll from "@/components/HotTakePoll";
import ResultDetails from "@/components/ResultDetails";

// Pre-render all 8 companion result pages as static HTML — perfect for share crawlers.
export function generateStaticParams() {
  return ALL_COMPANIONS.map((companion) => ({ companion }));
}

type Params = { params: Promise<{ companion: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { companion: raw } = await params;
  const id = raw.toLowerCase();
  if (!isCompanionId(id)) return { title: "Unknown companion" };
  const companion = COMPANIONS[id];
  const cluster = clusterForCompanion(id);
  const title = `${companion.name} — ${cluster.name}`;
  const description = `I'm ${cluster.name} ${cluster.emoji}. My Wave Particle work companion is ${companion.name}: "${companion.quote}" Which fictional menace finishes YOUR to-do list?`;
  return {
    title,
    description,
    openGraph: { title, description, type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function ResultPage({ params }: Params) {
  const { companion: raw } = await params;
  const id = raw.toLowerCase();
  if (!isCompanionId(id)) notFound();

  const companion = COMPANIONS[id];
  const cluster = clusterForCompanion(id);
  const polls = pollsForCompanion(id);
  const accentStyle = { "--accent": companion.accent } as CSSProperties;

  // Companion-canonical mode for the always-static CTA (a taker's exact mode also
  // shows in ResultDetails). Drives the personalized, attributable app handoff.
  const mode = deriveMode(profileToVector(companion.profile));
  const ctaUrl = appUrlFor({ companion: id, cluster: companion.cluster, mode: mode.id });

  const shareText = `I'm ${cluster.name} ${cluster.emoji} — matched with ${companion.name} ${companion.emoji} in Wave Particle. Which fictional menace finishes YOUR to-do list?`;

  return (
    <main className="wrap" style={accentStyle}>
      <article className="result-card">
        <p className="kicker center">your work-style archetype</p>
        <div className="center">
          <div className="cluster-emoji">{cluster.emoji}</div>
          <h1 className="type-nick">{cluster.name}</h1>
          <p className="type-blurb">{cluster.blurb}</p>
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

        <Suspense fallback={<div className="spin" />}>
          <ResultDetails companionId={id} />
        </Suspense>

        <ShareButtons text={shareText} />
      </article>

      <section className="cta-app">
        <h3>Now go finish something with {companion.name}.</h3>
        <p>
          {companion.name} is a real companion inside Wave Particle — set a goal,
          get a timed plan, and let them push you to the finish line. They&apos;ll
          run <strong>{mode.name.toLowerCase()}</strong> mode for the way you work.
        </p>
        <a
          className="btn btn-primary btn-lg btn-block"
          href={ctaUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Start with {companion.name} →
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

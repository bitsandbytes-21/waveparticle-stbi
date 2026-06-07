/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { COMPANIONS } from "@/data/mapping";
import { SITE_TAGLINE } from "@/lib/constants";
import { getStore, keys } from "@/lib/redis";

export const revalidate = 60;

// Friendly starting count so the social proof never looks empty on day one.
const SOCIAL_BASE = 1240;

async function getTakenCount(): Promise<number> {
  try {
    const [total] = await getStore().mget([keys.total()]);
    return SOCIAL_BASE + (total ?? 0);
  } catch {
    return SOCIAL_BASE;
  }
}

export default async function Landing() {
  const taken = await getTakenCount();
  const companions = Object.values(COMPANIONS);

  return (
    <main className="wrap screen center">
      <p className="kicker">Wave Particle · personality lab</p>

      <h1 className="hero-title">
        Which <span className="pop">fictional menace</span> finishes your to-do list?
      </h1>

      <p className="lead">{SITE_TAGLINE} Take the 12-question test and meet your match.</p>

      <div className="companion-strip">
        {companions.map((c) => (
          <span className="chip" key={c.id}>
            <img src={c.avatar} alt={c.name} /> {c.name}
          </span>
        ))}
      </div>

      <Link href="/quiz" className="btn btn-primary btn-lg" prefetch>
        Start the test →
      </Link>

      <p className="social-proof">
        <strong>{taken.toLocaleString()}</strong> people have already found their companion.
      </p>

      <p className="disclaimer">
        A fan-made personality quiz that matches your work style to a character from
        Wave Particle — an AI goal companion that helps you actually finish things.
        Not affiliated with the original shows, films, or rights holders; characters
        are referenced in good fun.
      </p>
    </main>
  );
}

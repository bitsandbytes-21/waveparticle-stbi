/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { COMPANIONS } from "@/data/mapping";
import { SITE_TAGLINE } from "@/lib/constants";

export default function Landing() {
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
        12 questions, no sign-up — just find your companion.
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

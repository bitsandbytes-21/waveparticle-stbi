import type { Metadata } from "next";
import Link from "next/link";
import CharacterGrid from "@/components/CharacterGrid";

export const metadata: Metadata = {
  title: "Meet the Cast",
  description:
    "The eight fictional menaces who'll get your to-do list done in Wave Particle — and the study buddy each one pairs with.",
};

export default function CharactersPage() {
  return (
    <main className="wrap wrap-wide">
      <p className="kicker center">Wave Particle · the cast</p>
      <h1 className="hero-title center">
        Meet the <span className="pop">menaces</span>
      </h1>
      <p className="lead">
        Eight companions. Each finishes your work a different way — and patches a
        different weak spot.
      </p>

      <CharacterGrid />

      <div className="cast-cta center">
        <Link href="/quiz" className="btn btn-primary btn-lg" prefetch>
          Find your match →
        </Link>
        <p className="foot-note">
          <Link href="/">← Back home</Link>
        </p>
      </div>
    </main>
  );
}

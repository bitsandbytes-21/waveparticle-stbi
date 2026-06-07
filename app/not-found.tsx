import Link from "next/link";

export default function NotFound() {
  return (
    <main className="wrap screen center">
      <p className="kicker">404 · lost in the multiverse</p>
      <h1 className="hero-title">
        No <span className="pop">such</span> type.
      </h1>
      <p className="lead">
        That companion doesn&apos;t exist (yet). Take the test and meet a real one.
      </p>
      <div style={{ height: 24 }} />
      <Link href="/quiz" className="btn btn-primary btn-lg">
        Take the test →
      </Link>
    </main>
  );
}

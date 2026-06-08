"use client";

/* eslint-disable @next/next/no-img-element */
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ALL_COMPANIONS,
  COMPANIONS,
  AXIS_POLES,
  AXIS_META,
  BINARY_AXES,
  ER_STATES,
  ER_LABEL,
  ER_SUPPORT,
  type CompanionId,
} from "@/data/mapping";
import { decodeVector, deriveMode, profileToVector } from "@/lib/scoring";

export default function ResultDetails({ companionId }: { companionId: CompanionId }) {
  const searchParams = useSearchParams();
  const companion = COMPANIONS[companionId];

  // The taker's real vector rides in via query params; cold/shared links fall
  // back to this companion's own profile so the page is always meaningful.
  const decoded = decodeVector((k) => searchParams.get(k));
  const vector = decoded ?? profileToVector(companion.profile);
  const mode = deriveMode(vector);
  const picked = searchParams.get("picked") === "1";

  // Preserve the vector when jumping to another companion via the override grid.
  function overrideHref(id: CompanionId): string {
    const params = new URLSearchParams(searchParams.toString());
    params.set("picked", "1");
    const qs = params.toString();
    return qs ? `/result/${id}?${qs}` : `/result/${id}`;
  }

  return (
    <div className="details">
      <div className="badge-row">
        <span className="badge">{mode.emoji} {mode.name}</span>
        <span className="badge-note">{mode.blurb}</span>
      </div>

      <div className="axis5-group">
        {BINARY_AXES.map((axis) => {
          const value = vector[axis];
          const poles = AXIS_POLES[axis];
          const pct = ((value + 1) / 2) * 100;
          return (
            <div className="axis5" key={axis}>
              <span className="axis5-name">{AXIS_META[axis].name}</span>
              <div className="axis5-row">
                <span className={`axis5-pole ${value < 0 ? "win" : ""}`}>{poles.negLabel}</span>
                <div className="axis5-track">
                  <span className="axis5-thumb" style={{ left: `${pct}%` }} />
                </div>
                <span className={`axis5-pole right ${value > 0 ? "win" : ""}`}>{poles.posLabel}</span>
              </div>
            </div>
          );
        })}

        <div className="axis5">
          <span className="axis5-name">{AXIS_META.ER.name}</span>
          <div className="er-states">
            {ER_STATES.map((state) => (
              <span key={state} className={`er-state ${state === vector.ER ? "win" : ""}`}>
                {ER_LABEL[state]}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="setup-card">
        <span className="tag mono">your wave particle setup</span>
        <p>
          {mode.setup} And because you&apos;re {ER_LABEL[vector.ER].toLowerCase()},{" "}
          {ER_SUPPORT[vector.ER]}
        </p>
      </div>

      <div className="override">
        <p className="override-head">
          {picked ? "you picked this one 💁" : "not feeling it? pick your own"}
        </p>
        <div className="override-grid">
          {ALL_COMPANIONS.map((id) => {
            const c = COMPANIONS[id];
            const isCurrent = id === companionId;
            return (
              <Link
                key={id}
                href={overrideHref(id)}
                className={`override-chip ${isCurrent ? "current" : ""}`}
                aria-current={isCurrent ? "true" : undefined}
              >
                <img src={c.avatar} alt={c.name} />
                <span>{c.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

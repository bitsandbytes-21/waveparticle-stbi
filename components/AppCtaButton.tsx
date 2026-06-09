"use client";

import type { MouseEvent } from "react";
import { getSessionId, track } from "@/lib/analytics";

// The "Start with {buddy}" CTA. Logs an anonymous cta_click event and appends
// the session id to the outbound app URL so WaveParticle can close the funnel
// loop (quiz session -> app landing). Opens in a new tab, like the old link.
export default function AppCtaButton({
  href,
  buddy,
  label,
}: {
  href: string;
  buddy: string;
  label: string;
}) {
  function go(e: MouseEvent<HTMLAnchorElement>) {
    const sid = getSessionId();
    track({ sessionId: sid, type: "cta_click", buddy });
    try {
      const u = new URL(href);
      u.searchParams.set("sid", sid);
      e.preventDefault();
      window.open(u.toString(), "_blank", "noopener,noreferrer");
    } catch {
      /* URL parse failed — let the plain href navigation proceed */
    }
  }

  return (
    <a
      className="btn btn-primary btn-lg btn-block"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={go}
    >
      {label}
    </a>
  );
}

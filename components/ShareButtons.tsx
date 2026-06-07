"use client";

import { useState } from "react";

export default function ShareButtons({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function currentUrl() {
    return typeof window !== "undefined" ? window.location.href : "";
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(`${text} ${currentUrl()}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  async function nativeShare() {
    const url = currentUrl();
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "Wave Particle Quiz", text, url });
      } catch {
        /* user dismissed */
      }
    } else {
      void copy();
    }
  }

  function openIntent(intent: "x" | "wa") {
    const u = encodeURIComponent(currentUrl());
    const t = encodeURIComponent(text);
    const href =
      intent === "x"
        ? `https://twitter.com/intent/tweet?text=${t}&url=${u}`
        : `https://wa.me/?text=${t}%20${u}`;
    window.open(href, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="share-row">
      <button className="share-btn" onClick={nativeShare}>
        📣 Share my result
      </button>
      <button className="share-btn" onClick={copy}>
        {copied ? "✓ Copied!" : "🔗 Copy link"}
      </button>
      <button className="share-btn" onClick={() => openIntent("x")}>
        𝕏 Post
      </button>
      <button className="share-btn" onClick={() => openIntent("wa")}>
        💬 WhatsApp
      </button>
    </div>
  );
}

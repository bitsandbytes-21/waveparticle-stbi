import { ImageResponse } from "next/og";
import {
  ALL_COMPANIONS,
  COMPANIONS,
  clusterForCompanion,
  isCompanionId,
} from "@/data/mapping";

export const runtime = "nodejs";
export const alt = "Your Wave Particle companion result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Prerender all 8 share cards at build time so social crawlers get them instantly.
export function generateStaticParams() {
  return ALL_COMPANIONS.map((companion) => ({ companion }));
}

export default async function Image({
  params,
}: {
  params: Promise<{ companion: string }>;
}) {
  const { companion: raw } = await params;
  const id = raw.toLowerCase();
  const valid = isCompanionId(id);
  const companion = valid ? COMPANIONS[id] : null;
  const cluster = valid ? clusterForCompanion(id) : null;
  const accent = companion?.accent ?? "#ff735a";
  const name = companion?.name ?? "Wave Particle";
  const origin = companion?.origin ?? "AI goal companion";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "70px 80px",
          background:
            `radial-gradient(800px 500px at 50% -10%, ${accent}40, transparent), ` +
            "linear-gradient(160deg, #0b0a09, #161210)",
          color: "#f6eee1",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 6, color: accent }}>
          WHICH WAVE PARTICLE COMPANION ARE YOU?
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 40, color: accent, fontWeight: 800 }}>
            {cluster ? `${cluster.emoji} ${cluster.name}` : ""}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 900,
              lineHeight: 1,
              textTransform: "uppercase",
              marginTop: 12,
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              alignSelf: "flex-start",
              marginTop: 22,
              padding: "10px 22px",
              borderRadius: 999,
              border: `2px solid ${accent}`,
              color: accent,
              fontSize: 28,
            }}
          >
            {origin}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#f6eee188" }}>
          <div style={{ display: "flex" }}>Find your AI work companion →</div>
          <div style={{ display: "flex", fontWeight: 700 }}>waveparticle.app</div>
        </div>
      </div>
    ),
    size,
  );
}

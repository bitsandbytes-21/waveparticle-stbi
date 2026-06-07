import { ImageResponse } from "next/og";
import { TYPE_META, companionForType, isMbtiType } from "@/data/mapping";

export const runtime = "nodejs";
export const alt = "Your Wave Particle companion result";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: raw } = await params;
  const type = raw.toUpperCase();
  const valid = isMbtiType(type);
  const companion = valid ? companionForType(type) : null;
  const meta = valid ? TYPE_META[type] : null;
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
          <div style={{ display: "flex", fontSize: 56, letterSpacing: 24, color: accent, fontWeight: 800 }}>
            {type.split("").join(" ")}
          </div>
          <div style={{ display: "flex", fontSize: 34, color: "#f6eee1aa", marginTop: 4 }}>
            {meta?.nickname ?? ""}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 132,
              fontWeight: 900,
              lineHeight: 1,
              textTransform: "uppercase",
              marginTop: 18,
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
          <div style={{ display: "flex", fontWeight: 700 }}>waveparticle.onrender.com</div>
        </div>
      </div>
    ),
    size,
  );
}

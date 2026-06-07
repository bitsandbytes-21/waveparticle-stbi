// The ONLY coupling to the main product: an outbound link to the live app.
// This project never imports from or modifies the Waveparticle-python repo.
export const APP_URL = "https://waveparticle.onrender.com";

export const SITE_NAME = "Which Wave Particle Companion Are You?";
export const SITE_TAGLINE = "Which fictional menace actually gets your to-do list done?";

// Public base URL of THIS quiz site (used for share links + OG image absolute URLs).
// Override in Vercel with NEXT_PUBLIC_SITE_URL once the domain is known.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://waveparticle-quiz.vercel.app";

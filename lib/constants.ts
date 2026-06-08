// The ONLY coupling to the main product: an outbound link to the live app.
// This project never imports from or modifies the Waveparticle-python repo.
export const APP_URL = "https://waveparticle.app";

// Build the quiz -> app handoff link. Carries UTM attribution (so the funnel is
// measurable) plus the matched companion / cluster / mode so the app can greet a
// new user already configured for how they work. Forward-compatible: the app can
// ignore the params today and consume them when ready.
export function appUrlFor(result: {
  companion: string;
  cluster: string;
  mode: string;
}): string {
  const url = new URL(APP_URL);
  url.searchParams.set("utm_source", "companion-quiz");
  url.searchParams.set("utm_medium", "referral");
  url.searchParams.set("utm_campaign", "which-companion");
  url.searchParams.set("ref", "companion-quiz");
  url.searchParams.set("companion", result.companion);
  url.searchParams.set("cluster", result.cluster);
  url.searchParams.set("mode", result.mode);
  return url.toString();
}

export const SITE_NAME = "Which Wave Particle Companion Are You?";
export const SITE_TAGLINE = "Which fictional menace actually gets your to-do list done?";

// Public base URL of THIS quiz site (used for share links + OG image absolute URLs).
// Override in Vercel with NEXT_PUBLIC_SITE_URL once the domain is known.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://waveparticle-quiz.vercel.app";

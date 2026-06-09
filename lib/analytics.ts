// Client-side analytics helpers. The session id is a random UUID (NOT tied to
// any identity) kept in localStorage so a session's events can be connected:
// answers -> result -> app click. Everything here is best-effort and never
// throws into the UI.

const SID_KEY = "wp-sid";

/** Stable anonymous session id for this browser. */
export function getSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.localStorage.getItem(SID_KEY);
    if (!id) {
      id = crypto.randomUUID();
      window.localStorage.setItem(SID_KEY, id);
    }
    return id;
  } catch {
    // storage blocked — ephemeral id, still anonymous
    return crypto.randomUUID();
  }
}

/** Fire-and-forget event to /api/event. Uses sendBeacon so it survives navigation. */
export function track(event: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const body = JSON.stringify(event);
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/event", new Blob([body], { type: "application/json" }));
    } else {
      void fetch("/api/event", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body,
        keepalive: true,
      });
    }
  } catch {
    /* best-effort — analytics must never break the UX */
  }
}

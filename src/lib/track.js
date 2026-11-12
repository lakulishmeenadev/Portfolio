import { db } from "@/lib/dataClient";
// Privacy-friendly event tracking — no personal data leaves the browser.
export async function track(type) {
  try {
    await db.functions.invoke("trackEvent", { type });
  } catch (e) {
    // analytics must never break the experience
  }
}
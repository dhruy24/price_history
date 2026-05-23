import cron from "node-cron";

// Runs every 6 hours in development
// In production, use Vercel Cron Jobs (vercel.json) to hit /api/cron instead
export function startScheduler(baseUrl: string, cronSecret: string) {
  cron.schedule("0 */6 * * *", async () => {
    console.log("[scheduler] Running price scrape...");
    try {
      const res = await fetch(`${baseUrl}/api/cron`, {
        headers: { "x-cron-secret": cronSecret },
      });
      const data = await res.json();
      console.log(`[scheduler] Done. Scraped ${data.scraped} products.`);
    } catch (err) {
      console.error("[scheduler] Error:", err);
    }
  });

  console.log("[scheduler] Started — scrapes every 6 hours.");
}

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" && process.env.NODE_ENV === "development") {
    const { startScheduler } = await import("@/lib/scheduler");
    const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) throw new Error("CRON_SECRET env var is not set");
    startScheduler(baseUrl, cronSecret);
  }
}

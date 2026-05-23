import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeAmazonProduct } from "@/lib/scraper";
import { checkAndFireAlerts } from "@/lib/alerts";

export async function GET(req: NextRequest) {
  const secret = req.headers.get("x-cron-secret");
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const products = await prisma.product.findMany({
    where: { alerts: { some: { triggered: false } } },
  });
  const results: { id: string; name: string; price?: number; error?: string }[] = [];

  for (const product of products) {
    try {
      const scraped = await scrapeAmazonProduct(product.url);

      await prisma.pricePoint.create({
        data: { productId: product.id, price: scraped.price },
      });

      await checkAndFireAlerts(product.id, scraped.price, scraped.currency);

      results.push({ id: product.id, name: product.name, price: scraped.price });
    } catch (err) {
      results.push({
        id: product.id,
        name: product.name,
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }

    // Delay between scrapes to avoid rate-limiting
    await new Promise((r) => setTimeout(r, 3000 + Math.random() * 2000));
  }

  return NextResponse.json({ scraped: results.length, results });
}

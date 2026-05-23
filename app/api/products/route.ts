import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { scrapeAmazonProduct } from "@/lib/scraper";

export async function GET() {
  const products = await prisma.product.findMany({
    include: {
      priceHistory: { orderBy: { scrapedAt: "desc" }, take: 1 },
      alerts: { where: { triggered: false } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(products);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { url } = body as { url: string };

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  // Reuse existing product if already tracked
  let product = await prisma.product.findUnique({ where: { url } });

  if (!product) {
    const scraped = await scrapeAmazonProduct(url);
    console.log("scraped", scraped);
    product = await prisma.product.create({
      data: {
        url,
        name: scraped.name,
        imageUrl: scraped.imageUrl,
        priceHistory: { create: { price: scraped.price } },
      },
    });
  }

  return NextResponse.json(product, { status: 201 });
}

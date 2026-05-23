import UrlForm from "@/components/UrlForm";
import { prisma } from "@/lib/db";
import ProductCard from "@/components/ProductCard";
import { getCurrencySymbol } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const products = await prisma.product.findMany({
    include: {
      priceHistory: { orderBy: { scrapedAt: "desc" }, take: 1 },
      alerts: { where: { triggered: false } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex flex-col items-center gap-12">
      {/* Hero URL input */}
      <div className="flex flex-col items-center gap-4 pt-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Track Amazon prices
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Paste a product URL to see its price history and set up email alerts.
        </p>
        <UrlForm />
      </div>

      {/* Recently tracked */}
      {products.length > 0 && (
        <div className="w-full">
          <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Recently tracked
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                id={p.id}
                name={p.name}
                imageUrl={p.imageUrl}
                currentPrice={p.priceHistory[0]?.price ?? null}
                alertCount={p.alerts.length}
                currency={getCurrencySymbol(p.url)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import PriceChart from "@/components/PriceChart";
import AlertForm from "@/components/AlertForm";
import { getCurrencySymbol } from "@/lib/currency";

export const dynamic = "force-dynamic";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      priceHistory: { orderBy: { scrapedAt: "asc" } },
      alerts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) notFound();
  console.log("product", product);

  const latestPrice = product.priceHistory.at(-1)?.price ?? null;
  const lowestPrice = product.priceHistory.length
    ? Math.min(...product.priceHistory.map((p) => p.price))
    : null;
  const activeAlerts = product.alerts.filter((a) => !a.triggered);
  const currency = getCurrencySymbol(product.url);

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-blue-600 hover:underline">
        ← Back
      </Link>

      {/* Product name + Amazon link */}
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white line-clamp-3 flex-1">
          {product.name}
        </h1>
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:underline whitespace-nowrap shrink-0"
        >
          View on Amazon →
        </a>
      </div>

      {/* Two-column layout on desktop */}
      <div className="flex flex-col gap-6 lg:flex-row lg:gap-8 lg:items-start">

        {/* Left: stats + chart */}
        <div className="flex-1 min-w-0 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-wrap gap-x-8 gap-y-4 mb-6">
            <div className="shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Current</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                {latestPrice != null ? `${currency}${latestPrice.toFixed(2)}` : "—"}
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">All-time low</p>
              <p className="text-lg sm:text-2xl font-bold text-green-600 dark:text-green-400">
                {lowestPrice != null ? `${currency}${lowestPrice.toFixed(2)}` : "—"}
              </p>
            </div>
            <div className="shrink-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Data points</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-600 dark:text-gray-300">
                {product.priceHistory.length}
              </p>
            </div>
          </div>

          {product.priceHistory.length > 1 ? (
            <PriceChart
              data={product.priceHistory}
              threshold={activeAlerts[0]?.threshold}
            />
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-10 text-center">
              Not enough data for a chart yet — check back after the next scrape (every 6h).
            </p>
          )}
        </div>

        {/* Right: alert form + active alerts */}
        <div className="flex flex-col gap-6 lg:w-82 lg:shrink-0 lg:sticky lg:top-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-4">Set a price alert</h2>
            <AlertForm productId={product.id} currency={currency} />
          </div>

          {product.alerts.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <h2 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">Your alerts</h2>
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {product.alerts.map((a) => (
                  <li key={a.id} className="flex justify-between items-center py-2 text-sm">
                    <span className="text-gray-600 dark:text-gray-400">{a.email}</span>
                    <span className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400 text-xs capitalize">{a.direction}</span>
                      <span className="font-medium dark:text-gray-200">{currency}{a.threshold.toFixed(2)}</span>
                      {a.triggered ? (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                          Sent
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/40 dark:text-green-400">
                          Active
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

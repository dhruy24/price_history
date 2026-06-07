"use client";

import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { getCurrencySymbol } from "@/lib/currency";

const STORAGE_KEY = "tracked_product_ids";

export function addTrackedProduct(id: string) {
  if (typeof window === "undefined") return;
  const ids: string[] = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  if (!ids.includes(id)) {
    ids.unshift(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  }
}

interface Product {
  id: string;
  url: string;
  name: string;
  imageUrl: string | null;
  priceHistory: { price: number }[];
  alerts: { triggered: boolean }[];
}

export default function RecentlyTracked() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const ids: string[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY) ?? "[]"
    );
    if (ids.length === 0) return;

    fetch("/api/products")
      .then((r) => r.json())
      .then((all: Product[]) => {
        const byId = new Map(all.map((p) => [p.id, p]));
        setProducts(ids.flatMap((id) => (byId.has(id) ? [byId.get(id)!] : [])));
      });
  }, []);

  if (products.length === 0) return null;

  return (
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
  );
}

"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

interface DataPoint {
  scrapedAt: string | Date;
  price: number;
}

interface Props {
  data: DataPoint[];
  threshold?: number;
}

export default function PriceChart({ data, threshold }: Props) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDark(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsDark(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const gridColor = isDark ? "#374151" : "#f0f0f0";
  const axisColor = isDark ? "#9ca3af" : "#6b7280";
  const tooltipBg = isDark ? "#1f2937" : "#ffffff";
  const tooltipBorder = isDark ? "#374151" : "#e5e7eb";
  const tooltipText = isDark ? "#f9fafb" : "#111827";

  const formatted = data.map((d) => ({
    date: new Date(d.scrapedAt).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
    price: d.price,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: axisColor }} />
        <YAxis
          tick={{ fontSize: 12, fill: axisColor }}
          tickFormatter={(v) => `$${v}`}
          domain={["auto", "auto"]}
        />
        <Tooltip
          formatter={(v: unknown) => [`$${(v as number).toFixed(2)}`, "Price"]}
          contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, color: tooltipText }}
          labelStyle={{ color: tooltipText }}
        />
        {threshold != null && (
          <ReferenceLine
            y={threshold}
            stroke="#ef4444"
            strokeDasharray="4 2"
            label={{ value: `Alert $${threshold}`, fill: "#ef4444", fontSize: 11 }}
          />
        )}
        <Line
          type="monotone"
          dataKey="price"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={{ r: 3 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

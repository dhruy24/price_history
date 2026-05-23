import Link from "next/link";
import Image from "next/image";

interface Props {
  id: string;
  name: string;
  imageUrl: string | null;
  currentPrice: number | null;
  alertCount: number;
  currency?: string;
}

export default function ProductCard({
  id,
  name,
  imageUrl,
  currentPrice,
  alertCount,
  currency = "$",
}: Props) {
  console.log("imageUrl", imageUrl);
  return (
    <Link
      href={`/product/${id}`}
      className="flex gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900 dark:hover:shadow-gray-900"
    >
      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
        {imageUrl ? (
          <Image src={imageUrl} alt={name} fill className="object-contain" />
        ) : (
          <div className="flex h-full items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
            No image
          </div>
        )}
      </div>

      <div className="flex flex-col justify-between min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 line-clamp-2">{name}</p>
        <div className="flex items-center gap-3 mt-1">
          {currentPrice != null ? (
            <span className="text-lg font-bold text-green-600 dark:text-green-400">
              {currency}{currentPrice.toFixed(2)}
            </span>
          ) : (
            <span className="text-sm text-gray-500 dark:text-gray-400">No price yet</span>
          )}
          {alertCount > 0 && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
              {alertCount} alert{alertCount > 1 ? "s" : ""}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

import UrlForm from "@/components/UrlForm";
import RecentlyTracked from "@/components/RecentlyTracked";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center gap-12">
      <div className="flex flex-col items-center gap-4 pt-8 w-full">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
          Track Amazon prices
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-center">
          Paste a product URL to see its price history and set up email alerts.
        </p>
        <UrlForm />
      </div>
      <RecentlyTracked />
    </div>
  );
}

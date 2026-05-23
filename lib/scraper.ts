import { chromium } from "playwright";

export interface ScrapeResult {
  name: string;
  price: number;
  currency: string;
  imageUrl: string | null;
}

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

const PRICE_SELECTORS = [
  ".a-price .a-offscreen",
  "#priceblock_ourprice",
  "#priceblock_dealprice",
  "#corePriceDisplay_desktop_feature_div .a-offscreen",
  ".apexPriceToPay .a-offscreen",
];

function randomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

const CURRENCY_SYMBOLS: [RegExp, string][] = [
  [/₹/, "₹"],
  [/£/, "£"],
  [/€/, "€"],
  [/\$/, "$"],
];

function parsePrice(raw: string): { price: number | null; currency: string } {
  let currency = "$";
  for (const [regex, symbol] of CURRENCY_SYMBOLS) {
    if (regex.test(raw)) {
      currency = symbol;
      break;
    }
  }
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleaned);
  return { price: isNaN(parsed) ? null : parsed, currency };
}

export async function scrapeAmazonProduct(url: string): Promise<ScrapeResult> {
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({
      userAgent: randomUserAgent(),
      extraHTTPHeaders: {
        "Accept-Language": "en-US,en;q=0.9",
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
      },
    });
    const page = await context.newPage();

    // Random delay to appear more human
    await new Promise((r) => setTimeout(r, 2000 + Math.random() * 3000));

    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });

    const name = await page
      .$eval("#productTitle", (el: Element) => el.textContent?.trim() ?? "")
      .catch(() => "Unknown Product");

    let price: number | null = null;
    let currency = "$";
    for (const selector of PRICE_SELECTORS) {
      try {
        const raw = await page.$eval(
          selector,
          (el: Element) => el.textContent?.trim() ?? ""
        );
        const parsed = parsePrice(raw);
        if (parsed.price !== null) {
          price = parsed.price;
          currency = parsed.currency;
          break;
        }
      } catch {
        // try next selector
      }
    }

    if (price === null) {
      throw new Error("Could not find price on page. Amazon may have blocked the request.");
    }

    const imageUrl = await page
      .$eval("#landingImage", (el: Element) => el.getAttribute("src"))
      .catch(() => null);

    return { name, price, currency, imageUrl };
  } finally {
    await browser.close();
  }
}

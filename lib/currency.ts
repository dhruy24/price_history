const DOMAIN_CURRENCY: Record<string, string> = {
  "amazon.in": "₹",
  "amazon.com": "$",
  "amazon.co.uk": "£",
  "amazon.de": "€",
  "amazon.fr": "€",
  "amazon.it": "€",
  "amazon.es": "€",
  "amazon.co.jp": "¥",
  "amazon.ca": "CA$",
  "amazon.com.au": "A$",
  "amazon.com.br": "R$",
  "amazon.com.mx": "MX$",
  "amazon.ae": "AED ",
  "amazon.sg": "S$",
};

export function getCurrencySymbol(url: string): string {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, "");
    return DOMAIN_CURRENCY[hostname] ?? "$";
  } catch {
    return "$";
  }
}

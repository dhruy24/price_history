import { prisma } from "./db";
import { sendPriceAlert } from "./mailer";

export async function checkAndFireAlerts(
  productId: string,
  newPrice: number,
  currency: string = "$"
): Promise<void> {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return;

  const pendingAlerts = await prisma.alert.findMany({
    where: { productId, triggered: false },
  });

  for (const alert of pendingAlerts) {
    const triggered =
      alert.direction === "below"
        ? newPrice <= alert.threshold
        : newPrice >= alert.threshold;

    if (!triggered) continue;

    await sendPriceAlert({
      to: alert.email,
      productName: product.name,
      productUrl: product.url,
      currentPrice: newPrice,
      threshold: alert.threshold,
      direction: alert.direction as "below" | "above",
      currency,
    });

    await prisma.alert.update({
      where: { id: alert.id },
      data: { triggered: true },
    });
  }
}

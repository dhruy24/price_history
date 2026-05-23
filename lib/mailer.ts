import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendPriceAlert({
  to,
  productName,
  productUrl,
  currentPrice,
  threshold,
  direction,
  currency = "$",
}: {
  to: string;
  productName: string;
  productUrl: string;
  currentPrice: number;
  threshold: number;
  direction: "below" | "above";
  currency?: string;
}) {
  const label = direction === "below" ? "dropped below" : "risen above";
  const subject =
    direction === "below"
      ? `Price drop alert: ${productName}`
      : `Price rise alert: ${productName}`;

  await transporter.sendMail({
    from: `"PriceWatch" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: `
      <h2>Price Alert!</h2>
      <p><strong>${productName}</strong> has ${label} your target of <strong>${currency}${threshold.toFixed(2)}</strong>.</p>
      <p>Current price: <strong>${currency}${currentPrice.toFixed(2)}</strong></p>
      <p><a href="${productUrl}">View on Amazon</a></p>
      <hr/>
      <p style="color:#888;font-size:12px">You set this alert on PriceWatch. You won't receive another alert for this product unless you add a new one.</p>
    `,
  });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { productId, email, threshold, direction } = body as {
    productId: string;
    email: string;
    threshold: number;
    direction: "below" | "above";
  };

  if (!productId || !email || threshold == null || !direction) {
    return NextResponse.json(
      { error: "productId, email, threshold, and direction are required" },
      { status: 400 }
    );
  }

  if (direction !== "below" && direction !== "above") {
    return NextResponse.json(
      { error: "direction must be 'below' or 'above'" },
      { status: 400 }
    );
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const alert = await prisma.alert.create({
    data: { productId, email, threshold, direction },
  });

  return NextResponse.json(alert, { status: 201 });
}

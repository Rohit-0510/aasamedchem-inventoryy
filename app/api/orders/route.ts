import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Decimal } from "@prisma/client/runtime/library";
import { generateOrderNumber } from "@/lib/utils";
import { convertToBase, getUnitPrice } from "@/lib/unitConversion";
import { z } from "zod";

const CreateOrderSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      orderedUnit: z.enum(["g", "kg", "L", "mL", "unit"]),
      orderedQuantity: z.string().or(z.number()),
    })
  ),
  notes: z.string().optional(),
});

// GET /api/orders - List orders (seller sees own, admin sees all)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const userRole = (session.user as any).role;

    let where: any = {};

    if (userRole === "SELLER") {
      where.sellerId = userId;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        seller: { select: { name: true, email: true } },
        orderItems: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

// POST /api/orders - Create order (seller only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if ((session.user as any).role !== "SELLER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const data = CreateOrderSchema.parse(body);

    if (!data.items || data.items.length === 0) {
      return NextResponse.json(
        { error: "Order must have at least one item" },
        { status: 400 }
      );
    }

    // Fetch all products to calculate totals
    const productIds = data.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { error: "One or more products not found" },
        { status: 404 }
      );
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Calculate order items and total
    let totalAmount = new Decimal(0);
    const orderItemsData: any[] = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product ${item.productId} not found` },
          { status: 404 }
        );
      }

      const orderedQty = new Decimal(item.orderedQuantity.toString());
      const baseQty = convertToBase(orderedQty, item.orderedUnit as any, product.baseUnit as any);
      const unitPrice = getUnitPrice(product.basePricePerUnit, item.orderedUnit as any, product.baseUnit as any);
      const totalPrice = unitPrice.mul(orderedQty);

      totalAmount = totalAmount.add(totalPrice);

      orderItemsData.push({
        productId: item.productId,
        orderedUnit: item.orderedUnit,
        orderedQuantity: orderedQty,
        baseQuantity: baseQty,
        unitPrice: unitPrice,
        totalPrice: totalPrice,
      });
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        sellerId: userId,
        totalAmount: totalAmount,
        notes: data.notes,
        orderItems: {
          create: orderItemsData,
        },
      },
      include: {
        orderItems: { include: { product: true } },
        seller: { select: { name: true, email: true } },
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

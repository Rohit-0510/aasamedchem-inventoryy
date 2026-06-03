import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcrypt.hash("admin123", 10);
  const sellerPassword = await bcrypt.hash("seller123", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@aasa.com",
      password: adminPassword,
      name: "Admin User",
      role: "ADMIN",
    },
  });

  const seller = await prisma.user.create({
    data: {
      email: "seller@aasa.com",
      password: sellerPassword,
      name: "Seller User",
      role: "SELLER",
    },
  });

  console.log("✅ Created users");

  // Sample products with different categories and units
  const products = [
    {
      name: "Aspirin Tablets",
      sku: "ASP-500",
      description: "Aspirin 500mg tablets",
      category: "Tablets",
      baseUnit: "unit" as const,
      basePricePerUnit: new Decimal("2.50"),
      stockQuantity: new Decimal("5000"),
    },
    {
      name: "Paracetamol Powder",
      sku: "PAR-100G",
      description: "Paracetamol powder, pharmaceutical grade",
      category: "Powders",
      baseUnit: "g" as const,
      basePricePerUnit: new Decimal("150.00"),
      stockQuantity: new Decimal("50000"),
    },
    {
      name: "Ibuprofen Gel",
      sku: "IBU-500ML",
      description: "Ibuprofen 5% gel for topical use",
      category: "Gels",
      baseUnit: "mL" as const,
      basePricePerUnit: new Decimal("5.00"),
      stockQuantity: new Decimal("100000"),
    },
    {
      name: "Cough Syrup",
      sku: "COUGH-200ML",
      description: "Multi-action cough syrup",
      category: "Syrups",
      baseUnit: "mL" as const,
      basePricePerUnit: new Decimal("8.00"),
      stockQuantity: new Decimal("50000"),
    },
    {
      name: "Vitamin C Tablets",
      sku: "VIT-C-1000",
      description: "Vitamin C 1000mg tablets",
      category: "Vitamins",
      baseUnit: "unit" as const,
      basePricePerUnit: new Decimal("5.00"),
      stockQuantity: new Decimal("10000"),
    },
    {
      name: "Metronidazole Powder",
      sku: "MTZ-25G",
      description: "Metronidazole pharmaceutical powder",
      category: "Powders",
      baseUnit: "g" as const,
      basePricePerUnit: new Decimal("250.00"),
      stockQuantity: new Decimal("20000"),
    },
    {
      name: "Antibiotic Cream",
      sku: "ANT-100G",
      description: "Broad-spectrum antibiotic cream",
      category: "Creams",
      baseUnit: "g" as const,
      basePricePerUnit: new Decimal("180.00"),
      stockQuantity: new Decimal("15000"),
    },
    {
      name: "Sodium Chloride Solution",
      sku: "NACL-500ML",
      description: "0.9% Sodium Chloride injection solution",
      category: "Solutions",
      baseUnit: "mL" as const,
      basePricePerUnit: new Decimal("3.50"),
      stockQuantity: new Decimal("80000"),
    },
    {
      name: "Amoxicillin Capsules",
      sku: "AMO-500",
      description: "Amoxicillin 500mg capsules",
      category: "Capsules",
      baseUnit: "unit" as const,
      basePricePerUnit: new Decimal("8.50"),
      stockQuantity: new Decimal("30000"),
    },
    {
      name: "Glycerin",
      sku: "GLY-1L",
      description: "Pure pharmaceutical grade glycerin",
      category: "Liquids",
      baseUnit: "mL" as const,
      basePricePerUnit: new Decimal("2.00"),
      stockQuantity: new Decimal("200000"),
    },
  ];

  const createdProducts = await Promise.all(
    products.map((product) =>
      prisma.product.create({
        data: product,
      })
    )
  );

  console.log(`✅ Created ${createdProducts.length} products`);

  console.log("🌱 Seed completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

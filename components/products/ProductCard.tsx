"use client";

import { Product } from "@prisma/client";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  onSelect?: (product: Product) => void;
  showAction?: boolean;
  actionLabel?: string;
}

export function ProductCard({
  product,
  onSelect,
  showAction = true,
  actionLabel = "Select",
}: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-xs text-gray-500 mb-2">SKU: {product.sku}</p>

        {product.category && (
          <p className="text-xs text-gray-600 mb-2">Category: {product.category}</p>
        )}

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="bg-blue-50 rounded p-3 mb-3">
          <p className="text-xs text-gray-600">Price per {product.baseUnit}</p>
          <p className="text-lg font-bold text-blue-600">
            {formatINR(Number(product.basePricePerUnit))}
          </p>
        </div>

        <div className="text-xs text-gray-600">
          <p>Stock: {product.stockQuantity.toString()} {product.baseUnit}</p>
          <p className="text-green-600 font-medium">In Stock</p>
        </div>
      </div>

      {showAction && onSelect && (
        <Button
          className="mt-4 w-full"
          onClick={() => onSelect(product)}
        >
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}

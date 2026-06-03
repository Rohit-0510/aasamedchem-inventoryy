"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Product } from "@prisma/client";
import {
  formatINR,
  UNIT_GROUPS,
} from "@/lib/utils";

interface OrderItem {
  productId: string;
  productName: string;
  orderedUnit: string;
  orderedQuantity: string;
  baseUnit: string;
  basePricePerUnit: number | string;
  unitPrice: number | string;
  totalPrice: number | string;
}

interface OrderFormProps {
  products: Product[];
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

const UNITS = [
  { value: "g", label: "gram (g)" },
  { value: "kg", label: "kilogram (kg)" },
  { value: "mL", label: "millilitre (mL)" },
  { value: "L", label: "litre (L)" },
  { value: "unit", label: "piece (unit)" },
];

export function OrderForm({
  products,
  onSubmit,
  isLoading = false,
}: OrderFormProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("unit");
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [notes, setNotes] = useState("");
  const [calculatedPrice, setCalculatedPrice] = useState<number | null>(null);

  // Conversion factors to base unit (client-side calculation helper)
  const CONVERSION_FACTORS: Record<string, number> = {
    "g->g": 1,
    "kg->g": 1000,
    "g->kg": 1 / 1000,
    "kg->kg": 1,
    "mL->mL": 1,
    "L->mL": 1000,
    "mL->L": 1 / 1000,
    "L->L": 1,
    "unit->unit": 1,
  };

  // Calculate price when quantity or unit changes
  useEffect(() => {
    if (selectedProduct && quantity && !isNaN(parseFloat(quantity))) {
      const qty = parseFloat(quantity);
      // Get unit price conversion factor
      const factor = CONVERSION_FACTORS[`${unit}->${selectedProduct.baseUnit}`] || 1;
      const basePrice = typeof selectedProduct.basePricePerUnit === 'number' 
        ? selectedProduct.basePricePerUnit 
        : parseFloat(selectedProduct.basePricePerUnit.toString());
      const unitPrice = basePrice * factor;
      const totalPrice = unitPrice * qty;
      setCalculatedPrice(totalPrice);
    } else {
      setCalculatedPrice(null);
    }
  }, [selectedProduct, quantity, unit]);

  const handleAddItem = () => {
    if (!selectedProduct || !quantity) return;

    const qty = parseFloat(quantity);
    const factor = CONVERSION_FACTORS[`${unit}->${selectedProduct.baseUnit}`] || 1;
    const basePrice = typeof selectedProduct.basePricePerUnit === 'number' 
      ? selectedProduct.basePricePerUnit 
      : parseFloat(selectedProduct.basePricePerUnit.toString());
    const unitPrice = basePrice * factor;
    const totalPrice = unitPrice * qty;

    const newItem: OrderItem = {
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      orderedUnit: unit,
      orderedQuantity: quantity,
      baseUnit: selectedProduct.baseUnit,
      basePricePerUnit: basePrice,
      unitPrice: unitPrice,
      totalPrice: totalPrice,
    };

    setOrderItems((prev) => [...prev, newItem]);
    setSelectedProduct(null);
    setQuantity("");
    setUnit("unit");
    setCalculatedPrice(null);
  };

  const handleRemoveItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAmount = orderItems.reduce(
    (sum, item) => sum + (typeof item.totalPrice === 'number' ? item.totalPrice : parseFloat(item.totalPrice.toString())),
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (orderItems.length === 0) {
      alert("Please add at least one item to the order");
      return;
    }

    try {
      const payload = {
        items: orderItems.map((item) => ({
          productId: item.productId,
          orderedUnit: item.orderedUnit,
          orderedQuantity: item.orderedQuantity,
        })),
        notes,
      };

      await onSubmit(payload);
    } catch (error) {
      console.error("Order submission error:", error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Items to Order</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <Select
            label="Select Product"
            value={selectedProduct?.id || ""}
            onChange={(e) => {
              const product = products.find((p) => p.id === e.target.value);
              setSelectedProduct(product || null);
            }}
            options={products.map((p) => ({
              value: p.id,
              label: `${p.name} (${p.sku})`,
            }))}
          />

          {selectedProduct && (
            <>
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-gray-600">Current Price</p>
                <p className="text-lg font-bold text-blue-600">
                  {formatINR(Number(selectedProduct.basePricePerUnit))} per{" "}
                  {selectedProduct.baseUnit}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Quantity"
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0.00"
                  disabled={isLoading}
                />

                <Select
                  label="Unit"
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  options={UNITS}
                  disabled={isLoading}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Item Total
                  </label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg">
                    <p className="font-bold text-lg">
                      {calculatedPrice ? formatINR(calculatedPrice) : "₹0.00"}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleAddItem}
                variant="primary"
                disabled={!quantity || isLoading}
                className="w-full"
              >
                Add to Order
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {orderItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Order Items ({orderItems.length})</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="text-left px-4 py-2">Product</th>
                    <th className="text-right px-4 py-2">Qty</th>
                    <th className="text-right px-4 py-2">Unit</th>
                    <th className="text-right px-4 py-2">Unit Price</th>
                    <th className="text-right px-4 py-2">Total</th>
                    <th className="text-center px-4 py-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">
                        <span className="font-medium">{item.productName}</span>
                      </td>
                      <td className="text-right px-4 py-2">{item.orderedQuantity}</td>
                      <td className="text-right px-4 py-2">{item.orderedUnit}</td>
                      <td className="text-right px-4 py-2">
                        {formatINR(item.unitPrice)}
                      </td>
                      <td className="text-right px-4 py-2 font-semibold">
                        {formatINR(item.totalPrice)}
                      </td>
                      <td className="text-center px-4 py-2">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveItem(idx)}
                          disabled={isLoading}
                        >
                          Remove
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-end mb-4">
                <div>
                  <p className="text-gray-600 mb-2">Order Total:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatINR(totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add any special instructions or notes..."
                  disabled={isLoading}
                />
              </div>

              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Submitting..." : "Place Order"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

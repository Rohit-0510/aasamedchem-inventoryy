"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { Product } from "@prisma/client";

interface ProductFormProps {
  product?: Product;
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

export function ProductForm({
  product,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: product?.name || "",
    sku: product?.sku || "",
    description: product?.description || "",
    category: product?.category || "",
    baseUnit: product?.baseUnit || "unit",
    basePricePerUnit: product?.basePricePerUnit.toString() || "",
    stockQuantity: product?.stockQuantity.toString() || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = "Product name is required";
    if (!formData.sku) newErrors.sku = "SKU is required";
    if (!formData.basePricePerUnit) newErrors.basePricePerUnit = "Price is required";
    if (!formData.stockQuantity) newErrors.stockQuantity = "Stock quantity is required";

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {product ? "Edit Product" : "Create New Product"}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              disabled={isLoading}
            />

            <Input
              label="SKU"
              name="sku"
              value={formData.sku}
              onChange={handleChange}
              error={errors.sku}
              disabled={isLoading || !!product}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isLoading}
            />

            <Select
              label="Base Unit"
              name="baseUnit"
              value={formData.baseUnit}
              onChange={handleChange}
              options={UNITS}
              disabled={isLoading || !!product}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Base Price Per Unit (₹)"
              name="basePricePerUnit"
              type="number"
              step="0.01"
              value={formData.basePricePerUnit}
              onChange={handleChange}
              error={errors.basePricePerUnit}
              disabled={isLoading}
            />

            <Input
              label="Stock Quantity"
              name="stockQuantity"
              type="number"
              step="0.01"
              value={formData.stockQuantity}
              onChange={handleChange}
              error={errors.stockQuantity}
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading
                ? "Saving..."
                : product
                  ? "Update Product"
                  : "Create Product"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

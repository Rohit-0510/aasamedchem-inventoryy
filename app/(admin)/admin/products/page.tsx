"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Loading } from "@/components/ui/Loading";
import { ProductForm } from "@/components/products/ProductForm";
import { Product } from "@prisma/client";
import { formatINR } from "@/lib/utils";
import { toast } from "react-toastify";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/products");
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Failed to load products");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create product");
      }

      toast.success("Product created successfully!");
      setShowForm(false);
      fetchProducts();
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateProduct = async (data: any) => {
    if (!editingProduct) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/products/${editingProduct.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update product");
      }

      toast.success("Product updated successfully!");
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    try {
      const response = await fetch(`/api/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      toast.success("Product deleted successfully!");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Manage Products
                </h1>
                <p className="text-gray-500">Create, edit, and delete products</p>
              </div>

              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setShowForm(!showForm);
                }}
              >
                {showForm ? "Cancel" : "Create Product"}
              </Button>
            </div>

            {showForm && (
              <div className="mb-6">
                <ProductForm
                  product={editingProduct || undefined}
                  onSubmit={
                    editingProduct ? handleUpdateProduct : handleCreateProduct
                  }
                  isLoading={isSubmitting}
                />
              </div>
            )}

            {isLoading ? (
              <Loading text="Loading products..." />
            ) : (
              <div className="space-y-2">
                {products.length === 0 ? (
                  <Card>
                    <CardContent className="py-8">
                      <p className="text-center text-gray-500">
                        No products found. Create your first product!
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>All Products ({products.length})</CardTitle>
                    </CardHeader>

                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-100 border-b">
                            <tr>
                              <th className="text-left px-4 py-2">Name</th>
                              <th className="text-left px-4 py-2">SKU</th>
                              <th className="text-left px-4 py-2">Category</th>
                              <th className="text-right px-4 py-2">Price</th>
                              <th className="text-right px-4 py-2">Stock</th>
                              <th className="text-center px-4 py-2">Unit</th>
                              <th className="text-center px-4 py-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map((product) => (
                              <tr key={product.id} className="border-b hover:bg-gray-50">
                                <td className="px-4 py-2">
                                  <div>
                                    <p className="font-medium">{product.name}</p>
                                    <p className="text-xs text-gray-500">
                                      {product.description?.substring(0, 50)}...
                                    </p>
                                  </div>
                                </td>
                                <td className="px-4 py-2">{product.sku}</td>
                                <td className="px-4 py-2">
                                  {product.category || "-"}
                                </td>
                                <td className="text-right px-4 py-2">
                                  {formatINR(product.basePricePerUnit)}
                                </td>
                                <td className="text-right px-4 py-2">
                                  {product.stockQuantity.toString()}
                                </td>
                                <td className="text-center px-4 py-2">
                                  {product.baseUnit}
                                </td>
                                <td className="text-center px-4 py-2 space-x-2">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => {
                                      setEditingProduct(product);
                                      setShowForm(true);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteProduct(product.id)}
                                  >
                                    Delete
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

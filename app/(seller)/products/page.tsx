"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Loading } from "@/components/ui/Loading";
import { ProductCard } from "@/components/products/ProductCard";
import { Product } from "@prisma/client";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [unitFilter, setUnitFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/products");
        const data = await response.json();
        setProducts(data);

        // Extract unique categories and units
        const uniqueCategories = [
          ...new Set(data.map((p: Product) => p.category).filter(Boolean)),
        ];
        const uniqueUnits = [...new Set(data.map((p: Product) => p.baseUnit))];

        setCategories(uniqueCategories as string[]);
        setUnits(uniqueUnits as string[]);

        setFilteredProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    if (search) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(search.toLowerCase()) ||
          p.sku.toLowerCase().includes(search.toLowerCase()) ||
          (p.description &&
            p.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (categoryFilter) {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }

    if (unitFilter) {
      filtered = filtered.filter((p) => p.baseUnit === unitFilter);
    }

    setFilteredProducts(filtered);
  }, [search, categoryFilter, unitFilter, products]);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Browse Products</h1>
              <p className="text-gray-500">
                Search and filter available pharmaceutical products
              </p>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Search by name, SKU, or description"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <Select
                  label="Filter by Category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  options={categories.map((cat) => ({
                    value: cat,
                    label: cat,
                  }))}
                />

                <Select
                  label="Filter by Unit"
                  value={unitFilter}
                  onChange={(e) => setUnitFilter(e.target.value)}
                  options={units.map((unit) => ({
                    value: unit,
                    label: unit,
                  }))}
                />
              </div>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <Loading text="Loading products..." />
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No products found matching your filters
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showAction={false}
                  />
                ))}
              </div>
            )}

            <p className="text-center text-gray-500 text-sm mt-6">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}

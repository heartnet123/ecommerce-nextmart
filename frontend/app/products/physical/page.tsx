"use client";

import { useEffect, useState } from "react";
import { Product } from "@/app/types";
import ProductCard from "@/app/components/products/ProductCard";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This will be replaced with actual API call
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Gaming Mouse",
        description: "High-performance gaming mouse with RGB lighting",
        price: 59.99,
        images: [
          "https://images.unsplash.com/photo-1527814050087-3793815479db?w=500",
        ],

        category: "physical",
        stock: 10,
      },
    ];

    setProducts(mockProducts);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Physical Products</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

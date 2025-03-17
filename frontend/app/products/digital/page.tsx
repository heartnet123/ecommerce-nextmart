"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { Product } from "@/app/types/index";
import ProductCard from "@/app/components/products/ProductCard";
import { Search } from "lucide-react";

import { create } from "zustand";

interface ProductStoreState {
  products: Product[];
  loading: boolean;
  fetchPhysicalProducts: () => Promise<void>;
}

const useProductStore = create<ProductStoreState>((set) => ({
  products: [],
  loading: false,
  fetchPhysicalProducts: async () => {
    set({ loading: true });
    try {
      const { data } = await axios.get<Product[]>("http://127.0.0.1:8000/api/products/");
      // Filter digital products
      const physicalProducts = data.filter(product => product.category === "digital");
      set({ products: physicalProducts });
    } catch (error) {
      console.error("Error fetching digital products:", error);
      set({ products: [] });
    } finally {
      set({ loading: false });
    }
  },
}));

export default function ProductsPage() {
  const { products, loading, fetchPhysicalProducts } = useProductStore();

  useEffect(() => {
    fetchPhysicalProducts();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">Digital Products</h1>
        </div>
      </div>

      <div>
        {/* Product Grid with loading state */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
                <div key={index} className="rounded-lg border bg-background p-4 h-80 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-md mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 rounded-full p-4 mb-4">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-medium mb-2">No physical products found</h3>
              <p className="mb-6">
                Check back later for new physical products
              </p>
            </div>
          )}
          
          {/* Pagination placeholder */}
          {products.length > 0 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-1">
                {/* ...existing code... */}
              </nav>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
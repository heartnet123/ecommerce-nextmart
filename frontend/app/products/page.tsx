"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { Product } from "@/app/types";
import ProductCard from "@/app/components/products/ProductCard";

// Simple Zustand store example
import { create } from "zustand";

interface ProductStoreState {
  products: Product[];
  loading: boolean;
  fetchProducts: (
    searchTerm: string,
    category: string[],
    minPrice: string,
    maxPrice: string,
    sort: string
  ) => Promise<void>;
}

const useProductStore = create<ProductStoreState>((set) => ({
  products: [],
  loading: false,
  fetchProducts: async (
    searchTerm,
    category,
    minPrice,
    maxPrice,
    sort
  ) => {
    set({ loading: true });
    try {
      const params: Record<string, string | string[]> = {};
      if (searchTerm) params.searchTerm = searchTerm;
      if (category.length > 0) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort) params.sort = sort;

      const { data } = await axios.get<Product[]>(
        "http://127.0.0.1:8000/api/products/",
        { params }
      );
      set({ products: data });
    } catch (error) {
      console.error("Error fetching products:", error);
      set({ products: [] });
    } finally {
      set({ loading: false });
    }
  },
}));

export default function ProductsPage() {
  const { products, loading, fetchProducts } = useProductStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);

  useEffect(() => {
    fetchProducts(searchTerm, categoryFilter, minPrice, maxPrice, sortOption);
  }, [searchTerm, categoryFilter, minPrice, maxPrice, sortOption, fetchProducts]);

  // Simple toggle for categories
  const handleCategoryChange = (cat: string) => {
    if (categoryFilter.includes(cat)) {
      setCategoryFilter(categoryFilter.filter((c) => c !== cat));
    } else {
      setCategoryFilter([...categoryFilter, cat]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">All Products</h1>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border border-gray-300 rounded-md p-2 w-1/2 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex gap-4">
        {/* Filter Sidebar */}
        <aside className="w-64 bg-gray-100 dark:bg-gray-800 p-4 rounded-md transition-colors duration-300">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Filter
          </h2>

          {/* Category Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-100">
              Category
            </h3>
            <div className="flex flex-col space-y-2 text-gray-600 dark:text-gray-300">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={categoryFilter.includes("Physical")}
                  onChange={() => handleCategoryChange("Physical")}
                />
                <span>Physical</span>
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={categoryFilter.includes("Digital")}
                  onChange={() => handleCategoryChange("Digital")}
                />
                <span>Digital</span>
              </label>
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-100">
              Price Range
            </h3>
            <div className="space-y-2">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Min Price
                </label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="
                    border border-gray-300 
                    dark:border-gray-700
                    dark:bg-gray-700
                    dark:text-gray-100
                    rounded-md p-1 w-full
                  "
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-300">
                  Max Price
                </label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="
                    border border-gray-300 
                    dark:border-gray-700
                    dark:bg-gray-700
                    dark:text-gray-100
                    rounded-md p-1 w-full
                  "
                />
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div className="mb-6">
            <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-100">
              Sort
            </h3>
            <select
              className="
                border border-gray-300 
                dark:border-gray-700
                dark:bg-gray-700
                dark:text-gray-100
                rounded-md p-1 w-full
              "
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="">Default</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
              <option value="bestSelling">Best Selling</option>
            </select>
          </div>
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}

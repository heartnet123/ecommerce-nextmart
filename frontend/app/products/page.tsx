"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import { Product } from "@/app/types/index";
import ProductCard from "@/app/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, SlidersHorizontal, X } from "lucide-react";

import { create } from "zustand";

interface ProductStoreState {
  products: Product[];
  loading: boolean;
  fetchProducts: (
    query: string,
    category: string,
    minPrice: string,
    maxPrice: string,
    sort: string
  ) => Promise<void>;
}

const useProductStore = create<ProductStoreState>((set) => ({
  products: [],
  loading: false,
  fetchProducts: async (
    query,
    category,
    minPrice,
    maxPrice,
    sort
  ) => {
    set({ loading: true });
    try {
      // Determine which endpoint to use based on whether there are search/filter params
      const hasSearchFilters = query || category || minPrice || maxPrice;
      const endpoint = hasSearchFilters 
        ? "http://127.0.0.1:8000/api/products/search/" 
        : "http://127.0.0.1:8000/api/products/";
      
      const params: Record<string, string> = {};
      if (query) params.q = query;
      if (category) params.category = category;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;
      if (sort) params.sort = sort; // Add sort parameter for future use

      const { data } = await axios.get<Product[]>(endpoint, { params });
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
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortOption, setSortOption] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // List of available categories
  const categories = ["physical", "digital"];

  useEffect(() => {
    fetchProducts(searchQuery, selectedCategory, minPrice, maxPrice, sortOption);
  }, [searchQuery, selectedCategory, minPrice, maxPrice, sortOption, fetchProducts]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setMinPrice("");
    setMaxPrice("");
    setSortOption("");
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-background">
      {/* Page Header with improved search bar */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold">All Products</h1>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button 
              variant="outline" 
              className="sm:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filters
            </Button>
            
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 opacity-50" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
              {searchQuery && (
                <button 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4 opacity-50" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Active Filters */}
        {(selectedCategory || minPrice || maxPrice || sortOption || searchQuery) && (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-sm font-medium">Active Filters:</span>
            
            {searchQuery && (
              <Badge 
                variant="outline"
                className="flex items-center gap-1"
              >
                Search: {searchQuery}
                <button onClick={() => setSearchQuery("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {selectedCategory && (
              <Badge 
                variant="outline"
                className="flex items-center gap-1"
              >
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {minPrice && (
              <Badge variant="outline" className="flex items-center gap-1">
                Min: ${minPrice}
                <button onClick={() => setMinPrice("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {maxPrice && (
              <Badge variant="outline" className="flex items-center gap-1">
                Max: ${maxPrice}
                <button onClick={() => setMaxPrice("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            {sortOption && (
              <Badge variant="outline" className="flex items-center gap-1">
                Sort: {sortOption === "priceAsc" ? "Price: Low to High" : 
                       sortOption === "priceDesc" ? "Price: High to Low" : 
                       sortOption === "newest" ? "Newest First" : 
                       sortOption === "bestSelling" ? "Best Selling" : sortOption}
                <button onClick={() => setSortOption("")}>
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearFilters}
              className="text-sm"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filter Sidebar - styled for better usability */}
        <aside className={`
          lg:w-64 
          rounded-lg
          border
          bg-background 
          shadow-sm
          overflow-hidden
          ${showFilters ? 'block' : 'hidden lg:block'}
        `}>
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Filter Products</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden"
                onClick={() => setShowFilters(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-4 space-y-6">
            {/* Category Filter - Single selection to match API */}
            <div>
              <h3 className="font-medium mb-3">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <label key={category} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="category"
                      className="rounded"
                      checked={selectedCategory === category}
                      onChange={() => setSelectedCategory(category)}
                    />
                    <span>{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="font-medium mb-3">Price Range</h3>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-1/2">
                    <label className="block text-sm mb-1">Min ($)</label>
                    <Input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full"
                      placeholder="0"
                    />
                  </div>
                  <div className="w-1/2">
                    <label className="block text-sm mb-1">Max ($)</label>
                    <Input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full"
                      placeholder="1000"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <Button 
              className="w-full mt-4" 
              variant="default" 
              onClick={clearFilters}
            >
              Reset Filters
            </Button>
          </div>
        </aside>

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
              <h3 className="text-xl font-medium mb-2">No products found</h3>
              <p className="mb-6">
                Try adjusting your search or filter criteria
              </p>
              <Button onClick={clearFilters}>Clear Filters</Button>
            </div>
          )}
          
          {/* Pagination placeholder */}
          {products.length > 0 && (
            <div className="flex justify-center mt-8">
              <nav className="flex items-center gap-1">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm" className="bg-primary text-primary-foreground">1</Button>
                <Button variant="outline" size="sm">2</Button>
                <Button variant="outline" size="sm">3</Button>
                <span className="mx-2">...</span>
                <Button variant="outline" size="sm">Next</Button>
              </nav>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
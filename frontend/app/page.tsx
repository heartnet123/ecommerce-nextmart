"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Product } from "./types/index";
import ProductCard from "./components/products/ProductCard";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // fetch สินค้า
    const fetchProducts = async () => {
      try {
        // API คืน JSON เป็นอาร์เรย์ของสินค้า
        const res = await fetch("http://127.0.0.1:8000/api/products/", {
        });
        if (!res.ok) {
          throw new Error("Failed to fetch products");
        }
        const data = (await res.json()) as Product[];
        setFeaturedProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="flex-grow container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        
        {/* Footer */}
        <footer className="bg-card py-8 text-center text-muted-foreground mt-auto">
          <div className="container mx-auto px-4">
            <p>
              จัดทำโดย นายจารุวิทย์ จงเชื่อกลาง 65070032
              <br />
              &copy; 2025 NextMart. All rights reserved.
            </p>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
    <main className="flex-grow bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Your One-Stop Gaming Shop
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Physical gaming gear and digital keys, all in one place
          </p>
        </div>
      </section>

        {/* Featured Products */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-8">สินค้าแนะนำ</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="bg-secondary py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold mb-8">Shop by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-background rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-semibold mb-4">Physical Products</h3>
                <p className="text-muted-foreground mb-4">
                  Gaming gear, accessories, and more
                </p>
                <Button variant="outline" size="lg">
                  <Link href="/products/physical">Browse Physical Products</Link>
                </Button>
              </div>
              <div className="bg-background rounded-lg p-6 text-center hover:shadow-lg transition-shadow">
                <h3 className="text-2xl font-semibold mb-4">Digital Keys</h3>
                <p className="text-muted-foreground mb-4">
                  Game keys, DLCs, and in-game items
                </p>
                <Button variant="outline" size="lg">
                  <Link href="/products/digital">Browse Digital Keys</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-card py-8 text-center text-muted-foreground mt-auto">
        <div className="container mx-auto px-4">
          <p>
            จัดทำโดย นายจารุวิทย์ จงเชื่อกลาง 65070032
            <br />
            &copy; 2025 NextMart. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
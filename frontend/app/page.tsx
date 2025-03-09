"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Product } from "./types/index";
import ProductCard from "./components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Gamepad2, Gift, Star, ArrowRight } from "lucide-react";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/products/");
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
        <div className="flex-grow container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          </div>
        </div>
        
        <Footer />
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

        {/* Featured Products - Improved */}
        <section className="container mx-auto px-4 py-16">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h2 className="text-3xl font-bold flex items-center">
                <Star className="text-primary mr-2 h-6 w-6" /> สินค้าแนะนำ
              </h2>
            </div>
            <Button variant="ghost" className="text-primary">
              ดูทั้งหมด <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>

        {/* Categories - Improved */}
        <section className="py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-secondary z-0"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h2 className="text-3xl font-bold mb-10 text-center">Shop by Category</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-background rounded-xl p-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-primary/10">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Gamepad2 className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Physical Products</h3>
                <p className="text-muted-foreground mb-6">
                  High-quality gaming peripherals, accessories, and collectibles for the ultimate gaming setup.
                </p>
                <Button variant="default" size="lg" className="w-full">
                  <Link href="/products/physical" className="w-full inline-block">Browse Physical Products</Link>
                </Button>
              </div>
              
              <div className="bg-background rounded-xl p-8 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-primary/10">
                <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mb-6">
                  <Gift className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Digital Keys</h3>
                <p className="text-muted-foreground mb-6">
                  Instant access to the latest games, DLCs, and in-game items. Play within minutes of purchase.
                </p>
                <Button variant="default" size="lg" className="w-full">
                  <Link href="/products/digital" className="w-full inline-block">Browse Digital Keys</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        
        {/* Why Choose Nextmart */}
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold mb-10 text-center">Why Choose NextMart</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Authentic Products",
                description: "All our products are 100% genuine with manufacturer warranty",
                icon: "Shield"
              },
              {
                title: "Fast Delivery",
                description: "Physical products shipped within 24 hours of order confirmation",
                icon: "Truck"
              },
              {
                title: "Instant Digital Keys",
                description: "Get your game keys delivered instantly to your email",
                icon: "Zap"
              },
              {
                title: "24/7 Support",
                description: "Our customer support team is available round the clock",
                icon: "HeadsetIcon"
              }
            ].map((item, index) => (
              <div key={index} className="bg-secondary/30 rounded-lg p-6 text-center hover:bg-secondary/50 transition-colors">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  <div className="text-primary text-xl">●</div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

  {/* Footer */}
const Footer = () => (
  <footer className="bg-card py-8 text-center text-muted-foreground mt-auto border-t border-border">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
      </div>
      <div className="border-t border-border pt-6">
        <p>
          จัดทำโดย นายจารุวิทย์ จงเชื่อกลาง 65070032
          <br />
          &copy; 2025 NextMart. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
);
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Product } from "./types/index";
import ProductCard from "./components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { Gamepad2, Gift, Star, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export default function Home() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Promotional slides data
  const promotionalSlides = [
    {
      id: 1,
      image: "https://wallpapers.com/images/hd/genshin-impact-game-poster-wlq3ykrxbaoadjow.jpg", 
      title: "Summer Gaming Sale",
      description: "Up to 70% off on selected games",
      buttonText: "Shop Now",
      buttonLink: "/products/"
    },
    {
      id: 2,
      image: "https://images8.alphacoders.com/139/thumb-1920-1393476.jpg",
      title: "New Game Releases",
      description: "Get the latest AAA titles with exclusive pre-order bonuses",
      buttonText: "Pre-order Now",
      buttonLink: "/products/"
    },
    {
      id: 3,
      image: "https://picfiles.alphacoders.com/431/thumb-1920-431451.png",
      title: "Gaming Accessories Bundle",
      description: "Complete your setup with our curated bundles",
      buttonText: "View Bundles",
      buttonLink: "/products/"
    }
  ];

  // Auto-slide 
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => 
        prevSlide === promotionalSlides.length - 1 ? 0 : prevSlide + 1
      );
    }, 5000); // every 5 seconds
    
    return () => clearInterval(timer);
  }, [promotionalSlides.length]);

  // Functions to navigate between slides
  const goToNextSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === promotionalSlides.length - 1 ? 0 : prevSlide + 1
    );
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prevSlide) => 
      prevSlide === 0 ? promotionalSlides.length - 1 : prevSlide - 1
    );
  };

  // Product fetching
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
      {/* Hero Section - Image Slider */}
      <section className="relative h-[500px] overflow-hidden">
        {/* Slides */}
        <div className="h-full relative">
          {promotionalSlides.map((slide, index) => (
            <div 
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              {/* Image with overlay */}
              <div className="absolute inset-0 bg-black/40 z-10" /> {/* Dark overlay */}
              <div className="relative h-full w-full">
                <Image 
                  src={slide.image} 
                  alt={slide.title}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
              </div>
              
              {/* Slide content */}
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <div className="container mx-auto px-4 text-center text-white">
                  <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
                    {slide.title}
                  </h1>
                  <p className="text-xl mb-8 drop-shadow-md max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                  <Button size="lg" variant="default" asChild>
                    <Link href={slide.buttonLink}>{slide.buttonText}</Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Navigation buttons */}
        <button 
          onClick={goToPrevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all"
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={goToNextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 text-white rounded-full p-2 transition-all"
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>
        
        {/* Slide indicators */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center z-30 gap-2">
          {promotionalSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide ? "bg-white scale-125" : "bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
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

        {/* Categories  */}
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
"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Trash, ShoppingCart, ArrowLeft } from "lucide-react";

// Product type definition
type Product = {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  brand: string;
  category: string;
  inStock: boolean;
  features: {
    [key: string]: string | number | boolean;
  };
};

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const searchParams = useSearchParams();
  
  // Get product IDs from URL query params or localStorage if not in URL
  const productIds = searchParams.get("ids")?.split(",") || 
    JSON.parse(localStorage.getItem('compareIds') || '[]');
  
  // Calculate all unique feature keys from products
  const allFeatureKeys = useMemo(() => {
    const keySets = products.map(product => Object.keys(product.features || {}));
    return Array.from(new Set(keySets.flat())).sort();
  }, [products]);
  
  // Function to fetch products data
  useEffect(() => {
    const fetchProducts = async () => {
      if (productIds.length === 0) {
        setLoading(false);
        return;
      }
      
      try {
        // Updated API endpoint to match your actual backend
        const fetchedProducts = await Promise.all(
          productIds.map(async (id: any) => {
            // Updated URL to match your actual API structure from ProductCard
            const res = await fetch(`http://127.0.0.1:8000/api/products/${id}/`);
            if (!res.ok) throw new Error(`Failed to fetch product ${id}`);
            return res.json();
          })
        );
        
        // Transform the API response to match the expected Product type
        const formattedProducts = fetchedProducts.map(product => ({
          id: String(product.id),
          name: product.name,
          price: product.price,
          rating: product.rating || 0,
          image: product.image ? `http://127.0.0.1:8000/${product.image}/` : "/images/placeholder.png",
          brand: product.brand || "Unknown",
          category: product.category || "Unknown",
          inStock: product.stock > 0,
          features: product.features || {}
        }));
        
        setProducts(formattedProducts);
      } catch (err) {
        setError("Failed to load products. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [productIds]);
  
  // Remove product from comparison
  const removeProduct = (id: string) => {
    // Check if this is the last product before filtering
    const isLastProduct = productIds.length === 1;
    
    // Filter out the product from IDs
    const newIds = productIds.filter((productId: string) => productId !== id);
    
    // Update localStorage - clear completely if empty
    if (newIds.length === 0) {
      localStorage.removeItem('compareIds');
    } else {
      localStorage.setItem('compareIds', JSON.stringify(newIds));
    }
    
    // Update URL without triggering navigation
    const searchParamsString = newIds.length > 0 ? `?ids=${newIds.join(",")}` : "";
    window.history.pushState({}, "", `/compare${searchParamsString}`);
    
    // Force empty state immediately if it was the last product
    if (isLastProduct) {
      setProducts([]);
    } else {
      setProducts(products.filter(product => product.id !== id));
    }
  };
  
  // Format feature key for display
  const formatFeatureKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/^./, str => str.toUpperCase()); // Capitalize first letter
  };
  
  // Empty state when no products to compare
  if (!loading && products.length === 0) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold mb-4">No Products to Compare</h1>
          <p className="text-muted-foreground mb-6">You haven't added any products to compare yet <br></br>Browse products and it will add here</p>
          <Link 
            href="/products" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-md flex items-center justify-center w-full md:w-auto"
          >
            <ArrowLeft className="mr-2" size={16} /> Browse Products
          </Link>
        </div>
      </div>
    );
  }
  
  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center">
        <div className="animate-pulse text-xl text-foreground">Loading comparison...</div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-2">Product Comparison</h1>
      <p className="text-muted-foreground mb-8">Compare features of {products.length} products</p>
      
      <div className="overflow-x-auto bg-background rounded-lg shadow border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="py-3 px-4 border-b w-1/4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Feature
              </th>
              {products.map(product => (
                <th key={product.id} className="py-3 px-4 border-b relative group">
                  <button 
                    onClick={() => removeProduct(product.id)}
                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive opacity-50 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove from comparison"
                  >
                    <Trash size={16} />
                  </button>
                  <div className="pt-6"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {/* Image row */}
            <tr className="hover:bg-accent/50">
              <td className="py-4 px-4 border-b font-medium text-muted-foreground">Image</td>
              {products.map(product => (
                <td key={product.id} className="py-4 px-4 border-b text-center">
                  <div className="flex justify-center">
                    <div className="relative h-40 w-40">
                      <Image 
                        src={product.image} 
                        alt={product.name}
                        fill
                        style={{ objectFit: "contain" }}
                        sizes="(max-width: 768px) 100vw, 160px"
                        className="transition-transform hover:scale-105"
                      />
                    </div>
                  </div>
                </td>
              ))}
            </tr>
            
            {/* Name row */}
            <tr className="hover:bg-accent/50">
              <td className="py-4 px-4 border-b font-medium text-muted-foreground">Name</td>
              {products.map(product => (
                <td key={product.id} className="py-4 px-4 border-b">
                  <Link href={`/product/${product.id}`} className="text-primary hover:underline font-medium">
                    {product.name}
                  </Link>
                </td>
              ))}
            </tr>
            
            {/* Price row */}
            <tr className="hover:bg-accent/50 bg-muted/50">
              <td className="py-4 px-4 border-b font-medium text-muted-foreground">Price</td>
              {products.map(product => (
                <td key={product.id} className="py-4 px-4 border-b font-bold text-lg">
                  {product.price} บาท
                </td>
              ))}
            </tr>
            
            {/* Brand row */}
            <tr className="hover:bg-accent/50">
              <td className="py-4 px-4 border-b font-medium text-muted-foreground">Brand</td>
              {products.map(product => (
                <td key={product.id} className="py-4 px-4 border-b">
                  <span className="px-3 py-1 bg-accent rounded-full text-sm">{product.brand}</span>
                </td>
              ))}
            </tr>
            
            {/* Rating row */}
            <tr className="hover:bg-accent/50">
              <td className="py-4 px-4 border-b font-medium text-muted-foreground">Rating</td>
              {products.map(product => (
                <td key={product.id} className="py-4 px-4 border-b">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(product.rating)
                              ? "text-yellow-400"
                              : "text-muted"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="ml-2 font-medium">{product.rating.toFixed(1)}</span>
                  </div>
                </td>
              ))}
            </tr>
            
            {/* In Stock row */}
            <tr className="hover:bg-accent/50">
              <td className="py-4 px-4 border-b font-medium text-muted-foreground">Availability</td>
              {products.map(product => (
                <td key={product.id} className="py-4 px-4 border-b">
                  <span className={`px-3 py-1 text-sm font-semibold rounded-full ${
                    product.inStock 
                      ? 'bg-success/20 text-success' 
                      : 'bg-destructive/20 text-destructive'
                  }`}>
                    {product.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
              ))}
            </tr>
            
            {/* All feature rows */}
            {allFeatureKeys.map((featureKey, index) => (
              <tr key={featureKey} className={`hover:bg-accent/50 ${index % 2 === 0 ? 'bg-muted/50' : ''}`}>
                <td className="py-4 px-4 border-b font-medium text-muted-foreground capitalize">
                  {formatFeatureKey(featureKey)}
                </td>
                {products.map(product => (
                  <td key={product.id} className="py-4 px-4 border-b">
                    {product.features[featureKey]?.toString() || '-'}
                  </td>
                ))}
              </tr>
            ))}
            
            {/* Add to cart row */}
            <tr className="bg-muted/50">
              <td className="py-4 px-4 border-b"></td>
              {products.map(product => (
                <td key={product.id} className="py-4 px-4 border-b">
                  <button 
                    className={`px-4 py-2 rounded-md flex items-center justify-center w-full ${
                      product.inStock 
                        ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                        : 'bg-muted text-muted-foreground cursor-not-allowed'
                    }`}
                    disabled={!product.inStock}
                  >
                    <ShoppingCart size={16} className="mr-2" /> Add to Cart
                  </button>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
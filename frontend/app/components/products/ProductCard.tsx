"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product } from "@/app/types/index";
import { useCartStore } from "@/app/stores/useCartStore";
import toast from "react-hot-toast";
import { Scale } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCartStore();

  const imageUrl = product.image
    ? `http://127.0.0.1:8000/${product.image}/`
    : "/images/placeholder.png";

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart({
        id: String(product.id),
        name: product.name,
        price: product.price,
        image: product.image ? imageUrl : "/images/placeholder.png",
        quantity: 1,
      });
      toast.success("Add to cart");
    }
  };

  const handleAddToCompare = () => {
    // Get current products being compared from localStorage
    const currentCompareIds = localStorage.getItem('compareIds') 
      ? JSON.parse(localStorage.getItem('compareIds') || '[]') 
      : [];
      
    // Check if product is already in compare list
    if (currentCompareIds.includes(String(product.id))) {
      toast.error("This product is already in your comparison list");
      return;
    }
    
    // Limit to 4 products max for comparison
    if (currentCompareIds.length >= 4) {
      toast.error("You can compare up to 4 products at a time");
      return;
    }
    
    // Add product to compare list
    const newCompareIds = [...currentCompareIds, String(product.id)];
    localStorage.setItem('compareIds', JSON.stringify(newCompareIds));
    
    toast.success("Added to comparison");
  };
  
  const goToComparePage = () => {
    const compareIds = localStorage.getItem('compareIds') 
      ? JSON.parse(localStorage.getItem('compareIds') || '[]') 
      : [];
      
    if (compareIds.length > 0) {
      router.push(`/compare?ids=${compareIds.join(',')}`);
    } else {
      toast.error("Add products to compare first");
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="relative h-48 w-full">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="text-lg font-semibold">{product.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {product.description}
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold">{product.price} ฿</span>
          <span
            className={`text-sm ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex flex-wrap gap-2">
        <Button
          className="flex-1"
          onClick={() => router.push(`/products/${product.id}`)}
        >
          View Details
        </Button>
        <Button
          className="flex-1"
          variant={product.stock > 0 ? "default" : "secondary"}
          disabled={product.stock === 0}
          onClick={handleAddToCart}
          aria-label="เพิ่มสินค้าลงตะกร้า"
        >
          Add to Cart
        </Button>
        <Button 
          className="flex-1 flex items-center gap-1"
          variant="outline"
          onClick={handleAddToCompare}
          aria-label="เพิ่มสินค้าเพื่อเปรียบเทียบ"
        >
          <Scale size={16} />
          Compare
        </Button>
      </CardFooter>
    </Card>
  );
}
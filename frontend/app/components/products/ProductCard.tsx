// frontend/app/components/products/ProductCard.tsx
"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product } from "@/app/types";
import { useCartStore } from "@/app/stores/useCartStore";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();
  const { addToCart } = useCartStore();

  const imageUrl = product.image
    ? `http://127.0.0.1:8000/media/products/${product.image}`
    : "/images/placeholder.png";

  const handleAddToCart = () => {
    if (product.stock > 0) {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: imageUrl, // Use full URL for consistency
        quantity: 1,
      });
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
          <span className="text-lg font-bold">${product.price}</span>
          <span
            className={`text-sm ${
              product.stock > 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {product.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>
      </CardContent>
      <CardFooter className="p-4 flex gap-2">
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
        >
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
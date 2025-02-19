"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Product } from "@/app/types";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const router = useRouter();

  // สร้าง URL สำหรับรูป ถ้าไม่มีรูป ก็ใส่ Placeholder
  const imageUrl = product.image
    ? `http://127.0.0.1:8000/media/products/${product.image}`
    : "/images/placeholder.png";
  // หรือคุณจะใส่เส้นทาง placeholder ที่ต้องการ

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
      <CardFooter className="p-4">
        <Button
          className="w-full"
          onClick={() => router.push(`/products/${product.id}`)}
        >
          View Details
        </Button>
      </CardFooter>
    </Card>
  );
}

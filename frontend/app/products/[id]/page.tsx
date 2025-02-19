// app/products/[id]/page.tsx

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  image: string | null;
};

type Props = {
  params: { id: string };
};

async function getProduct(id: string) {
  const res = await fetch(`http://127.0.0.1:8000/api/products/${id}/`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

export default async function ProductDetail({ params }: Props) {
  const id = await Promise.resolve(params.id);
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  const imageUrl = product.image
    ? `http://127.0.0.1:8000/media/products/${product.image}`
    : "/products/02_677df056-d27a-46ab-9333-7c165143ac73.jpg";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="relative h-[400px] w-full">
          <Image
            src={imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="mt-4 text-gray-600">{product.description}</p>
          <div className="mt-6">
            <span className="text-2xl font-bold">${product.price}</span>
          </div>
          <div className="mt-4">
            <span
              className={`inline-block px-3 py-1 rounded-full ${
                product.stock > 0
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
            </span>
          </div>
          <div className="mt-8">
            <Button className="w-full md:w-auto" disabled={product.stock === 0}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="details" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Product Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Category</p>
                  <p className="text-gray-600">{product.category}</p>
                </div>
                <div>
                  <p className="font-medium">Stock Status</p>
                  <p className="text-gray-600">
                    {product.stock > 0 ? "Available" : "Out of Stock"}
                  </p>
                </div>
              </div>
              <div className="mt-4">
                <p className="font-medium">Description</p>
                <p className="text-gray-600">{product.description}</p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="reviews" className="mt-6">
            <div className="prose max-w-none">
              <h3 className="text-xl font-semibold mb-4">Customer Reviews</h3>
              <p className="text-gray-600">
                No reviews yet. Be the first to review this product!
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const initialCartItems = [
  {
    id: 1,
    name: "Wireless Earbuds Pro",
    price: 199.99,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&q=80&w=500",
    quantity: 1,
  },
  {
    id: 2,
    name: "Smart Watch Series X",
    price: 299.99,
    image:
      "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=500",
    quantity: 1,
  },
];

export default function CartPage() {
  const [cartItems, setCartItems] = useState(initialCartItems);

  const updateQuantity = (id: number, change: number) => {
    setCartItems((items) =>
      items.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    );
  };

  const removeItem = (id: number) => {
    setCartItems((items) => items.filter((item) => item.id !== id));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const shipping = 10;
  const total = subtotal + shipping;

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {cartItems.length === 0 ? (
              <Card>
                <CardContent className="p-6">
                  <p className="text-center text-muted-foreground">
                    Your cart is empty
                  </p>
                  <Button asChild className="mt-4 w-full">
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center">
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <Link
                              href={`/product/${item.id}`}
                              className="font-medium hover:text-primary"
                            >
                              {item.name}
                            </Link>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                          <p className="text-muted-foreground mt-1">
                            ${item.price}
                          </p>
                          <div className="flex items-center mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1 rounded-md hover:bg-muted"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="mx-3">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="p-1 rounded-md hover:bg-muted"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shipping</span>
                    <span>${shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <Button className="w-full" size="lg">
                    Proceed to Checkout
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

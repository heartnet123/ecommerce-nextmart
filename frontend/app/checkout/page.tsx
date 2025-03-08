// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/authStore";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const router = useRouter();

  // Fetch user profile when page loads
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = document.cookie.split("accessToken=")[1]?.split(";")[0];
        if (!token) {
          toast.error("Please log in first");
          router.push("/login");
          return;
        }

        const response = await axios.get(`http://127.0.0.1:8000/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserId(response.data.id);
      } catch (error: any) {
        toast.error("Failed to load user profile");
        console.error("Profile fetch error:", error.response?.data || error.message);
        router.push("/login");
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleConfirmOrder = async () => {
    if (cartItems.length === 0) {
      toast.error("Cart is empty");
      return;
    }
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }

    setLoading(true);
    
    // Fixed JSON format according to requirements
    const orderData = {
      cartItems: cartItems.map((item) => ({
        product: parseInt(item.id),
        quantity: item.quantity,
      })),
      total_price: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
    };

    console.log("Sending order data:", orderData);

    try {
      const token = document.cookie.split("accessToken=")[1]?.split(";")[0];
      if (!token) throw new Error("No access token found");

      const response = await axios.post(
        `http://127.0.0.1:8000/api/orders/create/`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,   
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Order placed successfully");
      console.log("Response:", response.data);
      clearCart();
      router.push("/profile");
    } catch (error: any) {
      toast.error("Failed to place order");
      console.error("Order submission error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  if (userId === null && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          <p className="ml-3">Loading user profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      
      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 bg-background p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div 
                  key={item.id} 
                  className="flex items-center justify-between pb-4 border-b"
                >
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-background rounded-md overflow-hidden relative mr-4">
                      {item.image && (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                  </div>
                  <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-background p-6 rounded-lg shadow-sm h-fit">
            <h2 className="text-xl font-semibold mb-4">Order Total</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>Free</span>
              </div>
              <div className="border-t my-4"></div>
              <div className="flex justify-between font-bold">
                <span>Total:</span>
                <span>${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleConfirmOrder} 
              disabled={loading}
              className="w-full mt-6"
              size="lg"
            >
              {loading ? "Processing..." : "Place Order"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-xl font-medium mb-4">Your cart is empty</h2>
          <p className="mb-6 text-gray-500">Add some products to your cart to checkout</p>
          <Button onClick={() => router.push('/products')}>
            Browse Products
          </Button>
        </div>
      )}
    </div>
  );
}
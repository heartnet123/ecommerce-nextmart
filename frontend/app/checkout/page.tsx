// app/checkout/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/app/stores/useCartStore";

export default function CheckoutPage() {
  const { cartItems, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null); // เก็บ user ID
  const router = useRouter();

  // ดึง user ID จาก API เมื่อหน้าโหลด
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
        setUserId(response.data.id); // เก็บ ID จาก response
        console.log("User profile:", response.data);
      } catch (error: any) {
        toast.error("Failed to load user profile");
        console.error("Profile fetch error:", error.response?.data || error.message);
        router.push("/login"); // ถ้า token หมดอายุหรือ error ให้ไป login
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
    const orderData = {
      user: userId, // ใช้ user ID ที่ดึงมา
      cartcartItems: cartItems.map((item) => ({
        product: item.id,
        quantity: item.quantity,
      })),
      total_price: cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "completed",
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
      router.push("/orders");
    } catch (error: any) {
      toast.error("Failed to place order");
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
    } finally {
      setLoading(false);
    }
  };

  if (userId === null && !loading) {
    return <p>Loading user profile...</p>; // รอจนกว่าจะดึง user ID
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Checkout</h1>
      <div className="space-y-4">
        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.name} (x{item.quantity})</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-2">
          <strong>Total: ${cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)}</strong>
        </div>
        <Button onClick={handleConfirmOrder} disabled={loading}>
          {loading ? "Processing..." : "Confirm Order"}
        </Button>
      </div>
    </div>
  );
}
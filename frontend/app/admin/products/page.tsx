"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { Product } from "@/app/types/index";
import { useAuthStore } from "@/app/stores/authStore";
export default function AdminProductsPage() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, checkAuth } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Check authentication and admin status using the store
        await checkAuth();

        if (!isAuthenticated || !isAdmin) {
          router.replace("/unauthorized");
          return;
        }

        // Fetch products using access token from localStorage
        const token = localStorage.getItem("accessToken");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/products/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        setProducts(response.data);
      } catch (error) {
        console.error("Products fetch error:", error);
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          router.replace("/unauthorized");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [router, isAuthenticated, isAdmin, checkAuth]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Products Management</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b">ID</th>
              <th className="px-6 py-3 border-b">Name</th>
              <th className="px-6 py-3 border-b">Price</th>
              <th className="px-6 py-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 border-b">{product.id}</td>
                <td className="px-6 py-4 border-b">{product.name}</td>
                <td className="px-6 py-4 border-b">${product.price}</td>
                <td className="px-6 py-4 border-b">
                  <Link
                    href={`/admin/products/${product.id}`}
                    className="text-blue-600 hover:text-blue-800 mr-4"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

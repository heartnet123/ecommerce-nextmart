"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getAuthToken, logout } from "@/app/lib/auth";

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token = getAuthToken();
      setIsAuthenticated(!!token);
    };

    checkAuth();
    // Add event listener for storage changes (logout from other tabs)
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    window.location.href = "/login";
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
            >
              Home
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  href="/profile"
                  className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
                >
                  Profile
                </Link>
                <Link
                  href="/orders"
                  className="flex items-center px-2 py-2 text-gray-700 hover:text-gray-900"
                >
                  Orders
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <Button onClick={handleLogout} variant="ghost">
                Logout
              </Button>
            ) : (
              <Link href="/login" className="text-gray-700 hover:text-gray-900">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

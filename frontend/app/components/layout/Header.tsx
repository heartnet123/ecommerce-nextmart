"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ShoppingCart, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ThemeToggle from "@/components/ui/ThemeToggle";
import { useAuthStore } from "@/app/stores/authStore";

export default function Header() {
  // Get authentication state from Zustand store
  const { isAuthenticated } = useAuthStore();

  // Add storage event listener for token changes
  useEffect(() => {
    const { checkAuth } = useAuthStore.getState();
    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  // ----------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* ----------------------------------------------------------------
                  Logo / Brand
               ---------------------------------------------------------------- */}
        <Link href="/" className="text-2xl font-bold">
          GameStore
        </Link>

        {/* ----------------------------------------------------------------
                  Desktop Navigation
               ---------------------------------------------------------------- */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link href="/products" className="hover:text-primary">
            สินค้าทั้งหมด
          </Link>
          <Link href="/products/physical" className="hover:text-primary">
            Physical Products
          </Link>
          <Link href="/products/digital" className="hover:text-primary">
            Digital Keys
          </Link>
        </nav>

        {/* ----------------------------------------------------------------
                  Right Section: Cart, Login/Dropdown, Theme Toggle, Mobile Menu
               ---------------------------------------------------------------- */}
        <div className="flex items-center space-x-4">
          {/* ปุ่มตะกร้าสินค้า (Cart) พร้อมไอคอน + ข้อความ */}
          <Link href="/cart">
            <Button variant="ghost">
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span>Cart</span>
            </Button>
          </Link>

          {/* ถ้ายังไม่ล็อกอินให้โชว์ปุ่ม Log In */}
          {!isAuthenticated && (
            <Link href="/login">
              <Button variant="ghost">
                <User className="h-5 w-5 mr-2" />
                <span>Log In</span>
              </Button>
            </Link>
          )}

          {/* ถ้าล็อกอินแล้ว แสดง Dropdown เมนูของผู้ใช้ */}
          {isAuthenticated && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost">
                  <User className="h-5 w-5 mr-2" />
                  <span>My Account</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Link href="/profile" className="w-full">
                    Profile
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* ปุ่มเปลี่ยนธีม (light/dark) */}
          <ThemeToggle />

          {/* Mobile Menu Icon (จะโชว์เฉพาะจอเล็ก) */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

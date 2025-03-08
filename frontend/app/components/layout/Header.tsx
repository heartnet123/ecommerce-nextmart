// app/components/layout/Header.tsx
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
import { cookies } from "next/headers";

interface HeaderProps {
  isAuthenticated: boolean;
  isAdmin: boolean;
}


export default async function Header({ isAuthenticated, isAdmin }: HeaderProps) {
  const cookieStore = await cookies();
  const initialTheme = cookieStore.get("theme")?.value || "light";

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-bold">
          GameStore
        </Link>
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
        <div className="flex items-center space-x-4">
          <Link href="/cart">
            <Button variant="ghost">
              <ShoppingCart className="h-5 w-5 mr-2" />
              <span>Cart</span>
            </Button>
          </Link>
          {!isAuthenticated ? (
            <Link href="/login">
              <Button variant="ghost">
                <User className="h-5 w-5 mr-2" />
                <span>Log In</span>
              </Button>
            </Link>
          ) : (
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
                {isAdmin && (
                  <DropdownMenuItem>
                    <Link href="/admin/products" className="w-full">
                      Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem>
                  <LogoutButton /> {/* ใช้ LogoutButton แทน Link */}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <ThemeToggle initialTheme={initialTheme} />
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
// app/layout.tsx

import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "./components/layout/Header";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

async function getAuthStatus() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { isAuthenticated: false, isAdmin: false };
  }

  const response = await fetch(`http://localhost:8000/api/auth/is-admin/`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    return { isAuthenticated: true, isAdmin: false };
  }

  const data = await response.json();
  return { isAuthenticated: true, isAdmin: data.is_staff === true };
}


export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin } = await getAuthStatus();

  return (
    <html lang="en" className="text-body text-sm antialiased">
      <body className={inter.className}>
      <Toaster position="bottom-right" />
        <Header isAuthenticated={isAuthenticated} isAdmin={isAdmin} />
        <main className="min-h-screen bg-background">{children}</main>
      </body>
    </html>
  );
}
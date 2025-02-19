// components/ui/ThemeToggle.tsx

"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button"; // ปรับตามที่คุณใช้
import { Sun, Moon } from "lucide-react"; // ใช้ไอคอนจากไลบรารีที่คุณต้องการ

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <Button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="ml-4"
      aria-label="Toggle Dark Mode"
    >
      {theme === "dark" ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </Button>
  );
}

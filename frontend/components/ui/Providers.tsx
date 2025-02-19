// components/Providers.tsx

"use client";

import { ThemeProvider } from "next-themes";
import React, { useEffect } from "react";
import { useAuthStore } from "@/app/stores/authStore";

type ProvidersProps = {
  children: React.ReactNode;
};

const Providers = ({ children }: ProvidersProps) => {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
};

export default Providers;

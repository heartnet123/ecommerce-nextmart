"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/authStore";
import { login } from "@/app/lib/auth";

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      await login(credentials.username, credentials.password);

      // Update auth state in Zustand store
      const { setIsAuthenticated, checkAuth } = useAuthStore.getState();
      await checkAuth(); // This will also check if user is admin
      setIsAuthenticated(true);

      router.push("/"); // Redirect to home page after login
    } catch (error) {
      console.error("Login failed:", error);
      setError("Wrong username or password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-lg p-8 space-y-6 transition-all duration-300 hover:shadow-xl">
          <h1 className="text-2xl font-semibold text-center text-foreground">
            Login
          </h1>
          {error && (
            <p className="text-destructive text-sm text-center">{error}</p>
          )}
          <div className="space-y-4">
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="text-sm font-medium text-muted-foreground"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) =>
                  setCredentials({ ...credentials, username: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                required
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-muted-foreground"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) =>
                  setCredentials({ ...credentials, password: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                required
              />
            </div>
            <button
              onClick={handleLogin}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

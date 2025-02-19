"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import axios from "axios";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      console.log("Form submission:", { mode, formData });

      if (mode === "login") {
        console.log("Attempting login with:", { username: formData.username });
        const response = await axios.post(
          "http://127.0.0.1:8000/api/auth/login/",
          {
            username: formData.username,
            password: formData.password,
          },
          {
            withCredentials: true,
          },
        );

        console.log("Login response:", response.data);

        if (response.status === 200) {
          localStorage.setItem("accessToken", response.data.access);
          localStorage.setItem("refreshToken", response.data.refresh);
          console.log("Login successful, redirecting to profile");
          window.location.href = "/profile";
          return;
        } else {
          throw new Error(response.data.error || "Login failed");
        }
      } else {
        if (!formData.name || !formData.username || !formData.password) {
          throw new Error("Please fill in all fields");
        }
        console.log("Attempting registration");
        // const user = await register(formData.name, formData.username, formData.password);
        // console.log('Registration response:', user);

        // if (user) {
        //   console.log('Registration successful, redirecting to login');
        //   router.push('/login');
        //   return;
        // }
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(
        err.response?.data?.error || err.message || "Authentication failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {mode === "register" && (
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="username">Username</Label>
        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          required
          disabled={isLoading}
        />
      </div>
      {error && (
        <div className="bg-card border border-red-200 text-red-600 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Loading..." : mode === "login" ? "Login" : "Register"}
      </Button>
    </form>
  );
}

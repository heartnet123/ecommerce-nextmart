"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import toast from "react-hot-toast";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!formData.username || !formData.email || !formData.password || !formData.password2) {
      setError("All fields are required");
      return;
    }
    
    if (formData.password !== formData.password2) {
      setError("Passwords don't match");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/register/", 
        {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          password2: formData.password2
        }
      );
      
      toast.success("Registration successful! Please log in.");
      router.push("/login");
    } catch (error: any) {
      console.error("Registration failed:", error);
      
      // Handle different types of errors
      if (error.response?.data) {
        // Process API error messages
        const errorData = error.response.data;
        if (typeof errorData === 'object') {
          // Extract error messages from object
          const errorMessages = Object.entries(errorData)
            .map(([key, value]) => `${key}: ${(value as any).join(', ')}`)
            .join('. ');
          setError(errorMessages);
        } else {
          setError(errorData.toString());
        }
      } else {
        setError("Registration failed. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md p-6">
        <div className="bg-card text-card-foreground rounded-lg border border-border shadow-lg p-8 space-y-6 transition-all duration-300 hover:shadow-xl">
          <h1 className="text-2xl font-semibold text-center text-foreground">
            Create an Account
          </h1>
          
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md text-center">
              {error}
            </div>
          )}
          
          <form onSubmit={handleRegister} className="space-y-4">
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
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-muted-foreground"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
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
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label
                htmlFor="password2"
                className="text-sm font-medium text-muted-foreground"
              >
                Confirm Password
              </label>
              <input
                id="password2"
                type="password"
                value={formData.password2}
                onChange={(e) =>
                  setFormData({ ...formData, password2: e.target.value })
                }
                className="w-full px-4 py-2 bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-colors"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-primary-foreground py-2 px-4 rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
            
            <p className="mt-2 text-center text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-medium text-primary hover:text-primary/90"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
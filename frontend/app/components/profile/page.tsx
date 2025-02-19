"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthToken } from "@/app/lib/auth";
import { User } from "@/app/types";
import axios from "axios";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = getAuthToken();
        console.log("Auth token:", token);

        if (!token) {
          console.log("No auth token found, redirecting to login");
          return;
        }
        console.log("Fetching user profile...");
        const response = await axios.get(
          "http://127.0.0.1:8000/api/auth/profile/",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            withCredentials: true,
          },
        );

        console.log("Profile response status:", response.status);

        if (response.status !== 200) {
          console.error("Profile fetch error:", response.data);
          throw new Error(response.data.error || "Failed to fetch profile");
        }

        const data: User = response.data;
        console.log("Profile data:", data);
        setUser(data);
      } catch (error: any) {
        console.error("Error in profile page:", error);
        // Clear tokens and redirect to login if authentication fails
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [router]);

  const handleLogout = async () => {
    try {
      const token = getAuthToken();
      await axios.post(
        "http://localhost:8000/api/auth/logout/",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          {user ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Username</h3>
                <p className="mt-1 text-lg">{user.username}</p>
              </div>
              {user.first_name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    First Name
                  </h3>
                  <p className="mt-1 text-lg">{user.first_name}</p>
                </div>
              )}
              {user.last_name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Last Name
                  </h3>
                  <p className="mt-1 text-lg">{user.last_name}</p>
                </div>
              )}
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full mt-6"
              >
                Logout
              </Button>
            </div>
          ) : (
            <p className="text-center text-gray-500">No user data available</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

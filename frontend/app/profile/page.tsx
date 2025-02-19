"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/stores/authStore";

// Mock order data - In a real app, this would come from an API
const orders = [
  {
    id: "ORD-123456",
    date: "2024-03-15",
    status: "Delivered",
    total: 199.99,
    items: ["Wireless Earbuds Pro"],
  },
  {
    id: "ORD-123457",
    date: "2024-03-10",
    status: "In Transit",
    total: 299.99,
    items: ["Smart Watch Series X"],
  },
];

export default function AccountPage() {
  const router = useRouter();
  const [personalInfo, setPersonalInfo] = useState({
    username: "",
    first_name: "",
    last_name: "",
    is_staff: false,
  });

  const fetchUserProfile = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/auth/profile/",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      setPersonalInfo(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push("/login");
      }
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      await axios.put("http://localhost:8000/api/auth/profile/", personalInfo, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // Show success message or handle success case
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    }
  };

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");
    const accessToken = localStorage.getItem("accessToken");

    try {
      await axios.post(
        "http://localhost:8000/api/auth/logout/",
        { refresh_token: refreshToken },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      );

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      const { setIsAuthenticated } = useAuthStore.getState();
      setIsAuthenticated(false);

      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">Order {order.id}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Placed on {new Date(order.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-2">{order.items.join(", ")}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block px-3 py-1 rounded-full text-sm bg-primary/10 text-primary">
                          {order.status}
                        </span>
                        <p className="mt-2 font-semibold">
                          ${order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <Button variant="outline">View Order Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </CardHeader>
              <CardContent>
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSaveChanges();
                  }}
                >
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={personalInfo.username}
                      disabled
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        value={personalInfo.first_name}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            first_name: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        value={personalInfo.last_name}
                        onChange={(e) =>
                          setPersonalInfo({
                            ...personalInfo,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  {personalInfo.is_staff && (
                    <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                      <p className="text-sm font-semibold">Admin User</p>
                      <p className="text-sm text-muted-foreground">
                        You have administrator privileges
                      </p>
                    </div>
                  )}
                  <Button type="submit">Save Changes</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full text-left mt-4 hover:text-destructive"
        >
          Logout
        </Button>
      </main>
    </div>
  );
}

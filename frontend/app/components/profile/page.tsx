"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, User, Loader2, ShoppingBag } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface CartItem {
  product: number;
  quantity: number;
}

interface Order {
  id: number;
  user: number;
  status: string;
  total_price: string;
  created_at: string;
  cartItems: CartItem[];
}

interface PersonalInfo {
  username: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

export default function AccountPage() {
  const router = useRouter();
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    username: "",
    first_name: "",
    last_name: "",
    is_staff: false,
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [productDetails, setProductDetails] = useState<Record<number, any>>({});

  // Fetch product details for each product id
  const fetchProductDetails = async (productIds: number[]) => {
    try {
      const uniqueIds = Array.from(new Set(productIds));
      const details: Record<number, any> = {};
      
      // Fetch each product's details
      const promises = uniqueIds.map(async (id) => {
        try {
          const response = await axios.get(`http://127.0.0.1:8000/api/products/${id}/`);
          details[id] = response.data;
        } catch (error) {
          console.error(`Failed to fetch details for product ${id}:`, error);
        }
      });
      
      await Promise.all(promises);
      setProductDetails(details);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const fetchUserProfile = async () => {
    setProfileLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/api/auth/profile/",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      setPersonalInfo(response.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        router.push("/login");
      } else {
        toast.error("Failed to load profile data");
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }

      const response = await axios.get(
        "http://127.0.0.1:8000/api/orders/",
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      console.log("Orders response:", response.data);
      setOrders(response.data);
      
      // Extract product IDs from all orders
      const allProductIds = response.data.flatMap((order: Order) => 
        order.cartItems?.map((item) => item.product) || []
      );
      
      // Fetch details for these products
      if (allProductIds.length > 0) {
        fetchProductDetails(allProductIds);
      }
      
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load order history");
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchOrders();
  }, []);

  const handleSaveChanges = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        router.push("/login");
        return;
      }
      await axios.put("http://127.0.0.1:8000/api/auth/profile/", personalInfo, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (e) {
      return 'Unknown date';
    }
  };

  // Get total price safely
  const getOrderTotal = (order: Order) => {
    if (typeof order.total_price === 'number') {
      return order.total_price;
    }
    if (typeof order.total_price === 'string') {
      return parseFloat(order.total_price).toFixed(2);
    }
    return '0.00';
  };

  // Get product name safely
  const getProductName = (productId: number) => {
    return productDetails[productId]?.name || `Product #${productId}`;
  };

  return (
    <div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="space-y-4">
              {ordersLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-3">Loading your orders...</span>
                </div>
              ) : orders && orders.length > 0 ? (
                orders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">Order #{order.id}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            Placed on {formatDate(order.created_at)}
                          </p>
                          
                          <div className="mt-3 space-y-2">
                            {order.cartItems && order.cartItems.length > 0 ? (
                              order.cartItems.map((item, index) => (
                                <div key={index} className="flex items-center">
                                  <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                                    <ShoppingBag className="h-3 w-3" />
                                  </div>
                                  <span className="text-sm">
                                    {getProductName(item.product)} × {item.quantity}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No items</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                            order.status === 'Delivered' 
                              ? 'bg-green-100 text-green-800' 
                              : order.status === 'In Transit' 
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {order.status || 'Processing'}
                          </span>
                          <p className="mt-2 font-semibold">
                            {getOrderTotal(order)} ฿
                          </p>
                        </div>
                      </div>
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          View Order Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No orders yet</h3>
                    <p className="text-muted-foreground mb-4">
                      When you place orders, they will appear here.
                    </p>
                    <Button onClick={() => router.push('/products')}>
                      Browse Products
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </CardHeader>
              <CardContent>
                {profileLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
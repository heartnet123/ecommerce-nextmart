"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, 
  Package, 
  Loader2, 
  ShoppingBag, 
  Clock, 
  Calendar,
  BadgeCheck,
  ChevronRight,
  Settings,
  Mail,
  CreditCard
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import axios from "axios";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

// Update interface to match your actual API response
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

export default function AccountPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [personalInfo, setPersonalInfo] = useState({
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
        },
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
        },
      );

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

  // Format date safely
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
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

  // Get order status styling
  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Get first letter of first and last name for avatar
  const getInitials = () => {
    const first = personalInfo.first_name?.charAt(0) || '';
    const last = personalInfo.last_name?.charAt(0) || '';
    return (first + last).toUpperCase() || personalInfo.username?.charAt(0).toUpperCase() || 'U';
  };

  // Get recent orders (up to 3)
  const getRecentOrders = () => {
    return orders.slice(0, 3);
  };

  return (
    <div className="bg-background min-h-screen">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-3">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center">
                    <h2 className="text-xl font-bold">
                      {personalInfo.first_name || personalInfo.username}
                    </h2>
                    <p className="text-muted-foreground">
                      @{personalInfo.username}
                    </p>
                    {personalInfo.is_staff && (
                      <Badge className="mt-2 bg-primary" variant="default">
                        <BadgeCheck className="h-3 w-3 mr-1" /> Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-0">
                <nav className="flex flex-col">
                  <button 
                    className={`flex items-center px-6 py-4 hover:bg-gray-500 text-left transition-colors ${activeTab === 'profile' ? 'bg-gray-600 font-medium' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <User className="h-5 w-5 mr-3 text-primary" />
                    <span>ข้อมูลส่วนตัว</span>
                  </button>
                  <Separator />
                  <button 
                    className={`flex items-center px-6 py-4 hover:bg-gray-500 text-left transition-colors ${activeTab === 'orders' ? 'bg-gray-600 font-medium' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <Package className="h-5 w-5 mr-3 text-primary" />
                    <span>ประวัติการสั่งซื้อ</span>
                  </button>
                  <Separator />
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-3/4">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>ข้อมูลส่วนตัว</CardTitle>
                    <CardDescription>จัดการข้อมูลส่วนตัวของคุณ</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {profileLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      </div>
                    ) : (
                      <form
                        className="space-y-6"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveChanges();
                        }}
                      >
                        <div>
                          <Label htmlFor="username">ชื่อผู้ใช้</Label>
                          <div className="flex mt-1">
                            <Input
                              id="username"
                              value={personalInfo.username}
                              disabled
                              className="bg-background"
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            ชื่อผู้ใช้ไม่สามารถเปลี่ยนแปลงได้
                          </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <Label htmlFor="firstName">ชื่อจริง</Label>
                            <Input
                              id="firstName"
                              value={personalInfo.first_name}
                              onChange={(e) =>
                                setPersonalInfo({
                                  ...personalInfo,
                                  first_name: e.target.value,
                                })
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="lastName">นามสกุล</Label>
                            <Input
                              id="lastName"
                              value={personalInfo.last_name}
                              onChange={(e) =>
                                setPersonalInfo({
                                  ...personalInfo,
                                  last_name: e.target.value,
                                })
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="email">อีเมล</Label>
                          <div className="flex items-center mt-1">
                            <Mail className="h-4 w-4 text-muted-foreground mr-2" />
                            <Input
                              id="email"
                              type="email"
                              value="user@example.com"
                              disabled
                              className="bg-background"
                            />
                          </div>
                          <div className="flex mt-2">
                            <Button variant="link" className="px-0 h-auto text-primary" size="sm">
                              เปลี่ยนอีเมลของฉัน
                            </Button>
                          </div>
                        </div>

                        {personalInfo.is_staff && (
                          <div className="p-4 bg-primary/10 rounded-lg border border-primary/30">
                            <div className="flex items-center">
                              <BadgeCheck className="h-5 w-5 text-primary mr-2" />
                              <p className="font-medium">สิทธิ์ผู้ดูแลระบบ</p>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              คุณมีสิทธิ์ในการเข้าถึงแผงควบคุมผู้ดูแลระบบและการจัดการสินค้า
                            </p>
                          </div>
                        )}

                        <div className="flex justify-end gap-3">
                          <Button variant="outline" type="button">
                            ยกเลิก
                          </Button>
                          <Button type="submit">บันทึกการเปลี่ยนแปลง</Button>
                        </div>
                      </form>
                    )}
                  </CardContent>
                </Card>

                {!ordersLoading && orders.length > 0 && (
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>คำสั่งซื้อล่าสุด</CardTitle>
                        <CardDescription>รายการคำสั่งซื้อล่าสุดของคุณ</CardDescription>
                      </div>
                      <Button 
                        variant="ghost" 
                        onClick={() => setActiveTab('orders')}
                        className="text-primary"
                      >
                        ดูทั้งหมด
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {getRecentOrders().map((order) => (
                          <div 
                            key={order.id} 
                            className="p-4 rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
                            onClick={() => router.push(`/orders/${order.id}`)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary/10 rounded-full">
                                  <Package className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                  <h3 className="font-medium flex items-center gap-2">
                                    คำสั่งซื้อ #{order.id}
                                    <Badge className={`ml-2 ${getStatusStyle(order.status)}`}>
                                      {order.status || 'Processing'}
                                    </Badge>
                                  </h3>
                                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    {formatDate(order.created_at)}
                                  </div>
                                </div>
                              </div>
                              <p className="font-semibold">
                                {getOrderTotal(order)} ฿
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <Card>
                <CardHeader>
                  <CardTitle>ประวัติการสั่งซื้อ</CardTitle>
                  <CardDescription>ดูคำสั่งซื้อทั้งหมดของคุณ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {ordersLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-3">กำลังโหลดคำสั่งซื้อของคุณ...</span>
                      </div>
                    ) : orders && orders.length > 0 ? (
                      orders.map((order) => (
                        <div 
                          key={order.id} 
                          className="p-6 rounded-lg border border-gray-200 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
                          onClick={() => router.push(`/orders/${order.id}`)}
                        >
                          <div className="flex flex-col lg:flex-row justify-between gap-4">
                            <div>
                              <div className="flex items-center">
                                <h3 className="font-semibold text-lg">คำสั่งซื้อ #{order.id}</h3>
                                <Badge className={`ml-3 ${getStatusStyle(order.status)}`}>
                                  {order.status || 'Processing'}
                                </Badge>
                              </div>
                              
                              <div className="flex items-center text-sm text-muted-foreground mt-2">
                                <Calendar className="h-4 w-4 mr-2" />
                                {formatDate(order.created_at)}
                              </div>
                              
                              <div className="mt-4 space-y-2">
                                <p className="text-sm font-medium">สินค้า:</p>
                                <div className="space-y-2">
                                  {order.cartItems && order.cartItems.length > 0 ? (
                                    order.cartItems.map((item, index) => (
                                      <div key={index} className="flex items-center text-sm">
                                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mr-2">
                                          <ShoppingBag className="h-3 w-3" />
                                        </div>
                                        <span>
                                          {getProductName(item.product)} × {item.quantity}
                                        </span>
                                      </div>
                                    ))
                                  ) : (
                                    <p className="text-sm text-muted-foreground">ไม่มีรายการสินค้า</p>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-col items-end justify-between">
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">ยอดรวม</p>
                                <p className="text-xl font-bold text-primary">
                                  {getOrderTotal(order)} ฿
                                </p>
                              </div>
                              <Button 
                                className="mt-4 lg:mt-0"
                                variant="outline" 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  router.push(`/orders/${order.id}`);
                                }}
                              >
                                ดูรายละเอียด
                                <ChevronRight className="h-4 w-4 ml-1" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">ยังไม่มีคำสั่งซื้อ</h3>
                        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                          เมื่อคุณทำคำสั่งซื้อ ข้อมูลคำสั่งซื้อจะปรากฏที่นี่
                        </p>
                        <Button onClick={() => router.push('/products')}>
                          เลือกซื้อสินค้า
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
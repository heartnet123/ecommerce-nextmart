"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

// Define types
type OrderItem = {
  id: number;
  product: number;
  quantity: number;
  price: number;
  product_name?: string;
  product_image?: string;
};

type User = {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
};

type ShippingAddress = {
  address: string;
  city: string;
  postal_code: string;
  country?: string;
  phone?: string;
};

type Order = {
  id: number;
  order_number?: string;
  user: User | number;
  items: OrderItem[];
  cartItems?: OrderItem[];
  total_price: number;
  status: string;
  created_at: string;
  shipping_address?: ShippingAddress;
  payment_method?: string;
};

export default function AdminOrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [productDetails, setProductDetails] = useState<Record<number, any>>({});
  const [userDetails, setUserDetails] = useState<User | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      if (!accessToken) {
        toast.error("คุณต้องเข้าสู่ระบบก่อน");
        router.push("/login");
        return;
      }

      const response = await axios.get(
        `http://127.0.0.1:8000/api/orders/admin/${id}/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const orderData = response.data;
      
      // จัดรูปแบบข้อมูล order ให้สอดคล้องกับที่ใช้ในหน้า
      const formattedOrder = {
        ...orderData,
        items: orderData.cartItems || orderData.items || [],
      };
      
      setOrder(formattedOrder);

      // ดึงข้อมูลผู้ใช้ถ้าเป็น ID
      if (typeof orderData.user === "number") {
        fetchUserDetails(orderData.user);
      } else if (orderData.user && typeof orderData.user === "object") {
        setUserDetails(orderData.user);
      }

      // ดึงข้อมูลสินค้า
      const items = orderData.cartItems || orderData.items || [];
      const productIds = items.map((item: OrderItem) => item.product);
      if (productIds.length > 0) {
        fetchProductDetails(productIds);
      }
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("ไม่สามารถโหลดข้อมูลคำสั่งซื้อได้");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserDetails = async (userId: number) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axios.get(
        `http://127.0.0.1:8000/api/users/${userId}/`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setUserDetails(response.data);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchProductDetails = async (productIds: number[]) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const uniqueIds = Array.from(new Set(productIds));
      const details: Record<number, any> = {};

      const promises = uniqueIds.map(async (id) => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:8000/api/products/${id}/`,
            { headers: { Authorization: `Bearer ${accessToken}` } }
          );
          details[id] = response.data;
        } catch (err) {
          console.error(`Error fetching product ${id} details:`, err);
        }
      });

      await Promise.all(promises);
      setProductDetails(details);
    } catch (error) {
      console.error("Error fetching product details:", error);
    }
  };

  const updateOrderStatus = async (newStatus: string) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      console.log(`Updating order ${id} to status: ${newStatus}`);
      
      await axios.patch(
        `http://127.0.0.1:8000/api/orders/admin/${id}/`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      setOrder(order ? { ...order, status: newStatus } : null);
      toast.success(`สถานะคำสั่งซื้อถูกอัพเดตเป็น ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Status code:", error.response?.status);
      }
      toast.error("ไม่สามารถอัพเดตสถานะคำสั่งซื้อได้");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'วันที่ไม่ถูกต้อง';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>กำลังโหลดข้อมูล...</span>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <p className="text-lg mb-4">ไม่พบข้อมูลคำสั่งซื้อ</p>
        <Button onClick={() => router.push("/admin/orders")}>
          กลับไปหน้ารายการคำสั่งซื้อ
        </Button>
      </div>
    );
  }

  const orderItems = order.items || order.cartItems || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <Button
          variant="outline"
          onClick={() => router.push("/admin/orders")}
          className="mb-4"
        >
          &larr; กลับไปหน้ารายการคำสั่งซื้อ
        </Button>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle className="text-2xl mb-2">
                คำสั่งซื้อ {order.order_number || `#${order.id}`}
              </CardTitle>
              <CardDescription>
                วันที่สั่งซื้อ: {formatDate(order.created_at)}
              </CardDescription>
            </div>
            <div className="mt-4 md:mt-0">
              <span className={`inline-block px-4 py-2 rounded-md font-medium text-sm ${getStatusBadgeClass(order.status)}`}>
                {order.status || 'Processing'}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* ข้อมูลลูกค้า */}
            <div>
              <h3 className="text-lg font-medium mb-2">ข้อมูลลูกค้า</h3>
              <div className="bg-background-50 p-4 rounded-md">
                {userDetails ? (
                  <>
                    <p>
                      <span className="font-medium">ชื่อ:</span>{" "}
                      {userDetails.first_name || ""} {userDetails.last_name || ""}
                      {!userDetails.first_name && !userDetails.last_name && userDetails.username}
                    </p>
                    <p>
                      <span className="font-medium">อีเมล:</span> {userDetails.email}
                    </p>
                    <p>
                      <span className="font-medium">ชื่อผู้ใช้:</span> {userDetails.username}
                    </p>
                  </>
                ) : (
                  <p>รหัสผู้ใช้: {typeof order.user === 'number' ? order.user : 'ไม่ทราบ'}</p>
                )}
              </div>
            </div>

            {/* ข้อมูลการจัดส่ง */}
            <div>
              <h3 className="text-lg font-medium mb-2">ข้อมูลการจัดส่ง</h3>
              <div className="bg-background p-4 rounded-md">
                {order.shipping_address ? (
                  <>
                    <p>
                      <span className="font-medium">ที่อยู่:</span>{" "}
                      {order.shipping_address.address || "-"}
                    </p>
                    <p>
                      <span className="font-medium">เมือง:</span>{" "}
                      {order.shipping_address.city || "-"}
                    </p>
                    <p>
                      <span className="font-medium">รหัสไปรษณีย์:</span>{" "}
                      {order.shipping_address.postal_code || "-"}
                    </p>
                    {order.shipping_address.country && (
                      <p>
                        <span className="font-medium">ประเทศ:</span>{" "}
                        {order.shipping_address.country}
                      </p>
                    )}
                    {order.shipping_address.phone && (
                      <p>
                        <span className="font-medium">โทรศัพท์:</span>{" "}
                        {order.shipping_address.phone}
                      </p>
                    )}
                  </>
                ) : (
                  <p>ไม่มีข้อมูลการจัดส่ง</p>
                )}
                
                {order.payment_method && (
                  <p className="mt-2">
                    <span className="font-medium">วิธีการชำระเงิน:</span>{" "}
                    {order.payment_method}
                  </p>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* รายการสินค้า */}
          <h3 className="text-lg font-medium mb-4">รายการสินค้า</h3>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>สินค้า</TableHead>
                  <TableHead className="text-right">ราคา</TableHead>
                  <TableHead className="text-right">จำนวน</TableHead>
                  <TableHead className="text-right">รวม</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orderItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      ไม่มีรายการสินค้า
                    </TableCell>
                  </TableRow>
                ) : (
                  orderItems.map((item) => {
                    const product = productDetails[item.product] || {};
                    const price = item.price || 0;
                    const quantity = item.quantity || 0;
                    
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {product.image && (
                              <div className="w-12 h-12 relative overflow-hidden rounded-md border">
                                <Image
                                  src={product.image}
                                  alt={product.name || "สินค้า"}
                                  fill
                                  className="object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.png";
                                  }}
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">
                                {product.name || `สินค้า #${item.product}`}
                              </p>
                              {product.id && (
                                <Link
                                  href={`/admin/products/${product.id}`}
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  ดูรายละเอียดสินค้า
                                </Link>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ฿{Number(price).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          {quantity}
                        </TableCell>
                        <TableCell className="text-right">
                          ฿{(Number(price) * Number(quantity)).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="mt-6 flex justify-end">
            <div className="w-full md:w-1/3">
              <div className="flex justify-between py-2 border-t">
                <span className="font-medium">ราคารวม:</span>
                <span className="font-bold">฿{Number(order.total_price).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col md:flex-row gap-4 md:justify-between">
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <span className="text-sm font-medium mr-2">อัพเดตสถานะ:</span>
            <Select
              value={order.status?.toLowerCase() || ""}
              onValueChange={updateOrderStatus}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="เลือกสถานะ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">รอดำเนินการ</SelectItem>
                <SelectItem value="processing">กำลังดำเนินการ</SelectItem>
                <SelectItem value="shipped">จัดส่งแล้ว</SelectItem>
                <SelectItem value="completed">เสร็จสิ้น</SelectItem>
                <SelectItem value="cancelled">ยกเลิก</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* ปุ่มพิมพ์ใบเสร็จ (อาจเพิ่มในอนาคต) */}
          <Button variant="outline" className="w-full md:w-auto">
            พิมพ์ใบเสร็จ
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
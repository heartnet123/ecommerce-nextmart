"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import Link from "next/link";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type OrderItem = {
  id: number;
  product: number; // Product ID
  quantity: number;
};

type Order = {
  id: number;
  order_number?: string;
  user: number | { 
    id: number;
    username: string;
    email?: string;
  };
  cartItems?: OrderItem[]; 
  items?: OrderItem[];
  total_price: number;
  status: string;
  created_at: string;
  shipping_address?: {
    address: string;
    city: string;
    postal_code: string;
  };
  payment_method?: string;
};

type User = {
  id: number;
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [productDetails, setProductDetails] = useState<Record<number, any>>({});
  const [userDetails, setUserDetails] = useState<Record<number, User>>({});

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


  const fetchOrders = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      
      const response = await axios.get(`http://127.0.0.1:8000/api/orders/admin/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      }).catch(() => {
        return axios.get(`http://127.0.0.1:8000/api/orders/`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
      });

      const ordersData = response.data;
      
      // Extract all user IDs
      const userIds: number[] = [];
      ordersData.forEach((order: any) => {
        // เก็บ user ID ไม่ว่าจะเป็น object หรือตัวเลข
        if (typeof order.user === 'object' && order.user !== null) {
          userIds.push(order.user.id);
        } else if (typeof order.user === 'number') {
          userIds.push(order.user);
        }
      });
      
      
      const allProductIds = ordersData.flatMap((order: any) => 
        (order.cartItems || order.items || []).map((item: OrderItem) => item.product)
      );
      
      if (allProductIds.length > 0) {
        fetchProductDetails(allProductIds);
      }
      
      const formattedOrders = ordersData.map((order: any) => {
        const itemsArray = order.cartItems || order.items || [];
        return {
          ...order,
          cartItems: itemsArray,
          items: itemsArray
        };
      });
      
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      console.log(`Updating order ${orderId} to status: ${newStatus}`);
      const accessToken = localStorage.getItem("accessToken");
      
      const response = await axios.patch(
        `http://127.0.0.1:8000/api/orders/admin/${orderId}/`, 
        { status: newStatus },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      console.log("Status update response:", response.data);
      
      // Update local state
      setOrders(orders.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
      
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating order status:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data);
        console.error("Status code:", error.response?.status);
      }
      toast.error("Failed to update order status");
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'pending':
        return "bg-yellow-100 text-yellow-800";
      case 'cancelled':
        return "bg-red-100 text-red-800";
      case 'completed':
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Get item count 
  const getItemCount = (order: Order) => {
    const items = order.cartItems || order.items || [];
    return items.length;
  };

  // Get order total 
  const getOrderTotal = (order: Order) => {
    if (typeof order.total_price === 'number') {
      return order.total_price.toLocaleString();
    }
    if (typeof order.total_price === 'string') {
      return parseFloat(order.total_price).toLocaleString();
    }
    return '0';
  };

  // Get product name 
  const getProductDetails = (productId: number) => {
    return productDetails[productId] || { name: `Product #${productId}` };
  };

  // ฟังก์ชันสำหรับดึงข้อมูลผู้ใช้ 
  const getUserName = (order: Order) => {
    if (typeof order.user === 'object' && order.user !== null) {
      return order.user.username;
    }
    
    if (typeof order.user === 'number' && userDetails[order.user]) {
      const user = userDetails[order.user];
      if (user.first_name && user.last_name) {
        return `${user.first_name} ${user.last_name}`;
      }
      return user.username;
    }
    
    // ถ้าไม่มีข้อมูลเลย
    return `User #${typeof order.user === 'number' ? order.user : 'Unknown'}`;
  };

  // Filter orders based on selected status
  const filteredOrders = filter === "all" 
    ? orders 
    : orders.filter(order => (order.status || '').toLowerCase() === filter.toLowerCase());

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Order Management</h1>
      
      {/* Filter section */}
      <div className="mb-6 flex items-center gap-2">
        <span className="text-sm font-medium">Filter by status:</span>
        <Select
          value={filter}
          onValueChange={setFilter}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading orders...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.order_number || `#${order.id}`}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{getUserName(order)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{getItemCount(order)} items</span>
                        {(order.cartItems || order.items || []).length > 0 && (
                          <span className="text-xs text-gray-500 mt-1">
                            {(order.cartItems || order.items || [])
                              .slice(0, 2)
                              .map(item => getProductDetails(item.product).name)
                              .join(', ')}
                            {(order.cartItems || order.items || []).length > 2 && '...'}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getOrderTotal(order)} ฿</TableCell>
                    <TableCell>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                        {order.status || 'Processing'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/orders/${order.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                        <Select
                          value={(order.status || '').toLowerCase()}
                          onValueChange={(value) => updateOrderStatus(order.id, value)}
                        >
                          <SelectTrigger className="w-[120px] h-9">
                            <SelectValue placeholder="Update" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
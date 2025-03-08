export interface Product {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: 'physical' | 'digital';
  stock: number;
  digitalKey?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface CartItem {
  product: Product;
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  orders: Order[];
}

export interface Order {
  id: string | number;
  user_id?: string | number;
  items: OrderItem[];
  total?: number;
  total_price?: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'Delivered' | 'In Transit';
  created_at: string;  // ISO date string from backend
  date?: string;       // Alternative date field
}

export interface OrderItem {
  id: number;
  product: number;
  quantity: number;
  price: number;
  product_name?: string;
  product_image?: string;
}
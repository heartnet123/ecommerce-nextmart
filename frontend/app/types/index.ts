export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  images: string[];
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
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  orders: Order[];
}

export interface Order {
  id: string;
  userId: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
}
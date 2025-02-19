export interface User {
  id: string;
  username: string;
  first_name?: string;
  last_name?: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
}

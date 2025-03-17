import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string
}

interface CompareState {
  products: CompareProduct[];
  addProduct: (product: CompareProduct) => void;
  removeProduct: (productId: string) => void;
  clearProducts: () => void;
  isProductInCompare: (productId: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      products: [],
      addProduct: (product) => {
        const { products } = get();
        // ตรวจสอบว่ามีสินค้านี้อยู่แล้วหรือไม่
        if (!products.some(p => p.id === product.id)) {
          // จำกัดไว้ที่ 4 สินค้า
          if (products.length < 4) {
            set({ products: [...products, product] });
          }
        }
      },
      removeProduct: (productId) => {
        set({ products: get().products.filter(p => p.id !== productId) });
      },
      clearProducts: () => set({ products: [] }),
      isProductInCompare: (productId) => {
        return get().products.some(p => p.id === productId);
      }
    }),
    {
      name: 'product-compare',
    }
  )
);
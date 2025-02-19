import { create } from 'zustand';
import { checkIsAdmin, getAuthToken } from '@/app/lib/auth';

interface AuthStore {
  isAuthenticated: boolean;
  isAdmin: boolean;
  setIsAuthenticated: (value: boolean) => void;
  setIsAdmin: (value: boolean) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  isAuthenticated: false,
  isAdmin: false,
  setIsAuthenticated: (value) => set({ isAuthenticated: value }),
  setIsAdmin: (value) => set({ isAdmin: value }),
  checkAuth: async () => {
    const token = getAuthToken();
    const isAuthenticated = !!token;
    set({ isAuthenticated });
    
    if (isAuthenticated) {
      const isAdmin = await checkIsAdmin();
      set({ isAdmin });
    } else {
      set({ isAdmin: false });
    }
  },
}));

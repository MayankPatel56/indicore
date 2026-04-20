import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PageName,
  AdminPage,
  Product,
  CartItem,
  User,
  Address,
  Order,
  Banner,
  WishlistItem,
} from './types';

// ==================== Navigation Store ====================
interface NavigationState {
  page: PageName;
  params: Record<string, string>;
  previousPage: PageName | null;
  adminPage: AdminPage;
  navigate: (page: PageName, params?: Record<string, string>) => void;
  setAdminPage: (page: AdminPage) => void;
  goBack: () => void;
}

export const useNavigationStore = create<NavigationState>()((set) => ({
  page: 'home',
  params: {},
  previousPage: null,
  adminPage: 'overview',
  navigate: (page, params = {}) =>
    set((state) => ({
      previousPage: state.page,
      page,
      params,
    })),
  setAdminPage: (adminPage) => set({ adminPage }),
  goBack: () =>
    set((state) => ({
      page: state.previousPage || 'home',
      previousPage: null,
    })),
}));

// ==================== Auth Store ====================
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  updateProfile: (data: Partial<User>) => void;
  logout: () => void;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, token, isAuthenticated: true }),
      updateProfile: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      logout: () =>
        set({ user: null, token: null, isAuthenticated: false }),
      isAdmin: () => get().user?.role === 'admin',
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// ==================== Cart Store ====================
interface CartState {
  items: CartItem[];
  coupon: { code: string; discount: number; type: 'percentage' | 'fixed' } | null;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (coupon: { code: string; discount: number; type: 'percentage' | 'fixed' }) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getDiscount: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      coupon: null,

      addItem: (product, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((item) => item.product.id === product.id);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return { items: [...state.items, { product, quantity }] };
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.product.id !== productId)
              : state.items.map((item) =>
                  item.product.id === productId ? { ...item, quantity } : item
                ),
        })),

      clearCart: () => set({ items: [], coupon: null }),

      applyCoupon: (coupon) => set({ coupon }),

      removeCoupon: () => set({ coupon: null }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),

      getDiscount: () => {
        const { coupon, items } = get();
        if (!coupon) return 0;
        const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        if (coupon.type === 'percentage') return (subtotal * coupon.discount) / 100;
        return coupon.discount;
      },

      getTotal: () => {
        const subtotal = get().getSubtotal();
        const discount = get().getDiscount();
        return Math.max(0, subtotal - discount);
      },

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        items: state.items,
        coupon: state.coupon,
      }),
    }
  )
);

// ==================== Wishlist Store ====================
interface WishlistState {
  items: WishlistItem[];
  setItems: (items: WishlistItem[]) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  hasItem: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()((set, get) => ({
  items: [],
  setItems: (items) => set({ items }),
  addItem: (item) =>
    set((state) => {
      if (state.items.some((i) => i.productId === item.productId)) return state;
      return { items: [item, ...state.items] };
    }),
  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
  hasItem: (productId) => get().items.some((i) => i.productId === productId),
  clearWishlist: () => set({ items: [] }),
}));

// ==================== Banner Store ====================
interface BannerState {
  banner: Banner | null;
  setBanner: (banner: Banner) => void;
}

export const useBannerStore = create<BannerState>((set) => ({
  banner: { id: '1', text: '✨ Flat 20% OFF on All Zodiac Chains! Use Code: ZODIAC20', active: true },
  setBanner: (banner) => set({ banner }),
}));

// ==================== Admin Store ====================
interface AdminState {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

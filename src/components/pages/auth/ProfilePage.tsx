'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  MapPin,
  ShoppingBag,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  Pencil,
  Trash2,
  LogOut,
  Package,
  ChevronRight,
  ChevronLeft,
  Heart,
  Shield,
  Settings,
  Home,
  Store,
  Star,
  ShoppingCart,
  AlertTriangle,
  CalendarDays,
  Diamond,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  useNavigationStore,
  useAuthStore,
  useCartStore,
  useWishlistStore,
} from '@/lib/store';
import type {
  ProfileSection,
  Address,
  Order,
  WishlistItem,
  Product,
} from '@/lib/types';

// ==================== Form Schemas ====================

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const addressSchema = z.object({
  label: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(1, 'Phone is required'),
  line1: z.string().min(1, 'Address line 1 is required'),
  line2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(1, 'Pincode is required'),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

// ==================== Status Badge Config ====================

const statusConfig: Record<string, { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', className: 'bg-sky-50 text-sky-700 border-sky-200' },
  shipped: { label: 'Shipped', className: 'bg-violet-50 text-violet-700 border-violet-200' },
  delivered: { label: 'Delivered', className: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 border-red-200' },
};

// ==================== Menu Items ====================

const menuItems: { id: ProfileSection; label: string; icon: React.ReactNode; description: string }[] = [
  { id: 'profile', label: 'Edit Profile', icon: <User className="h-5 w-5" />, description: 'Update your personal info' },
  { id: 'orders', label: 'Order History', icon: <ShoppingBag className="h-5 w-5" />, description: 'Track and view orders' },
  { id: 'addresses', label: 'Manage Addresses', icon: <MapPin className="h-5 w-5" />, description: 'Saved delivery addresses' },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart className="h-5 w-5" />, description: 'Your favourite items' },
  { id: 'security', label: 'Security', icon: <Shield className="h-5 w-5" />, description: 'Password & privacy' },
  { id: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" />, description: 'Account preferences' },
];

// ==================== Address Dialog ====================

function AddressDialog({
  open,
  onOpenChange,
  address,
  userId,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  address: Address | null;
  userId: string;
  onSave: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!address;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      label: '',
      name: '',
      phone: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      isDefault: false,
    },
  });

  const isDefaultWatch = watch('isDefault');

  useEffect(() => {
    if (address) {
      reset({
        label: address.label || '',
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2 || '',
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
      });
    } else {
      reset({
        label: '',
        name: '',
        phone: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        isDefault: false,
      });
    }
  }, [address, reset]);

  const onSubmit = async (data: AddressFormValues) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/auth/addresses/${address!.id}` : '/api/auth/addresses';
      const method = isEditing ? 'PUT' : 'POST';
      const body = isEditing ? data : { ...data, userId };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to save address');
      }

      toast.success(isEditing ? 'Address updated!' : 'Address added!');
      onOpenChange(false);
      onSave();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg mx-4">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Address' : 'Add New Address'}</DialogTitle>
          <DialogDescription>
            {isEditing ? 'Update your address details.' : 'Add a new delivery address.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="addr-label" className="text-sm">
                Label <span className="text-[#1A1A1A]/40">(optional)</span>
              </Label>
              <Input
                id="addr-label"
                placeholder="Home, Office..."
                className="h-10 border-[#1A1A1A]/15 rounded-lg"
                {...register('label')}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="addr-name" className="text-sm">Full Name</Label>
              <Input
                id="addr-name"
                placeholder="John Doe"
                className="h-10 border-[#1A1A1A]/15 rounded-lg"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-phone" className="text-sm">Phone</Label>
            <Input
              id="addr-phone"
              placeholder="+91 98765 43210"
              className="h-10 border-[#1A1A1A]/15 rounded-lg"
              {...register('phone')}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-line1" className="text-sm">Address Line 1</Label>
            <Input
              id="addr-line1"
              placeholder="House no, Building, Street"
              className="h-10 border-[#1A1A1A]/15 rounded-lg"
              {...register('line1')}
            />
            {errors.line1 && <p className="text-xs text-red-500">{errors.line1.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-line2" className="text-sm">
              Address Line 2 <span className="text-[#1A1A1A]/40">(optional)</span>
            </Label>
            <Input
              id="addr-line2"
              placeholder="Landmark, Area"
              className="h-10 border-[#1A1A1A]/15 rounded-lg"
              {...register('line2')}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addr-city" className="text-sm">City</Label>
              <Input
                id="addr-city"
                placeholder="Mumbai"
                className="h-10 border-[#1A1A1A]/15 rounded-lg"
                {...register('city')}
              />
              {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-state" className="text-sm">State</Label>
              <Input
                id="addr-state"
                placeholder="MH"
                className="h-10 border-[#1A1A1A]/15 rounded-lg"
                {...register('state')}
              />
              {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-pincode" className="text-sm">Pincode</Label>
              <Input
                id="addr-pincode"
                placeholder="400001"
                className="h-10 border-[#1A1A1A]/15 rounded-lg"
                {...register('pincode')}
              />
              {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="addr-default"
              checked={isDefaultWatch}
              onCheckedChange={(checked) => setValue('isDefault', checked === true)}
              className="border-[#C9A96E] data-[state=checked]:bg-[#C9A96E] data-[state=checked]:border-[#C9A96E]"
            />
            <Label htmlFor="addr-default" className="text-sm text-[#1A1A1A]/70 cursor-pointer">
              Set as default address
            </Label>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#1A1A1A]/15 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#C9A96E] hover:bg-[#b89558] text-white rounded-lg"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving...</>
              ) : isEditing ? (
                'Update Address'
              ) : (
                'Add Address'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ==================== Bottom Navigation ====================

function BottomNav({ active }: { active: 'home' | 'shop' | 'orders' | 'profile' }) {
  const navigate = useNavigationStore((s) => s.navigate);

  const tabs = [
    { id: 'home' as const, label: 'Home', icon: Home },
    { id: 'shop' as const, label: 'Shop', icon: Store },
    { id: 'orders' as const, label: 'Orders', icon: ShoppingBag },
    { id: 'profile' as const, label: 'Profile', icon: User },
  ];

  const handleTabClick = (id: 'home' | 'shop' | 'orders' | 'profile') => {
    if (id === 'home') navigate('home');
    else if (id === 'shop') navigate('products');
    else if (id === 'orders') navigate('profile');
    else if (id === 'profile') navigate('profile');
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-[#1A1A1A]/8 md:hidden">
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center justify-center gap-1 flex-1 py-2 transition-colors"
            >
              <Icon
                className={`h-5 w-5 transition-colors ${
                  isActive ? 'text-[#C9A96E]' : 'text-[#1A1A1A]/35'
                }`}
              />
              <span
                className={`text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#C9A96E]' : 'text-[#1A1A1A]/35'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

// ==================== Main Profile Page ====================

export default function ProfilePage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { user, isAuthenticated, token, updateProfile, logout } = useAuthStore();
  const cartAddItem = useCartStore((s) => s.addItem);
  const wishlistSetItems = useWishlistStore((s) => s.setItems);
  const wishlistRemoveItem = useWishlistStore((s) => s.removeItem);

  // 'main' shows menu list; any ProfileSection shows that section detail
  const [activeSection, setActiveSection] = useState<'main' | ProfileSection>('main');

  // Data state
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingWishlist, setLoadingWishlist] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Profile edit form
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
    },
  });

  // Password change form
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  // Address dialog
  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  // Delete account
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
    }
  }, [isAuthenticated, navigate]);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!token) return;
    setLoadingProfile(true);
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        updateProfile(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingProfile(false);
    }
  }, [token, updateProfile]);

  // Fetch addresses
  const fetchAddresses = useCallback(async () => {
    if (!token) return;
    setLoadingAddresses(true);
    try {
      const res = await fetch('/api/auth/addresses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setAddresses(data);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoadingAddresses(false);
    }
  }, [token]);

  // Fetch orders
  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/auth/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!token) return;
    setLoadingWishlist(true);
    try {
      const res = await fetch('/api/auth/wishlist', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setWishlistItems(data);
          wishlistSetItems(data);
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoadingWishlist(false);
    }
  }, [token, wishlistSetItems]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
      fetchAddresses();
      fetchOrders();
      fetchWishlist();
    }
  }, [isAuthenticated, fetchProfile, fetchAddresses, fetchOrders, fetchWishlist]);

  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, phone: user.phone || '' });
    }
  }, [user, profileForm]);

  if (!isAuthenticated || !user) {
    return null;
  }

  // ==================== Handlers ====================

  const handleProfileSubmit = async (data: ProfileFormValues) => {
    setProfileLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to update profile');
      }

      updateProfile(data);
      toast.success('Profile updated!');
      setIsEditingProfile(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordFormValues) => {
    setPasswordLoading(true);
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to update password');
      }

      toast.success('Password updated!');
      passwordForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const res = await fetch(`/api/auth/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to delete address');
      }

      toast.success('Address deleted!');
      fetchAddresses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleOpenAddressDialog = (address: Address | null = null) => {
    setEditingAddress(address);
    setAddressDialogOpen(true);
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const res = await fetch('/api/auth/wishlist', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to remove from wishlist');
      }

      toast.success('Removed from wishlist!');
      wishlistRemoveItem(productId);
      setWishlistItems((prev) => prev.filter((item) => item.productId !== productId));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleMoveToCart = (item: WishlistItem) => {
    const product: Product = {
      id: item.product.id,
      name: item.product.name,
      slug: item.product.slug,
      description: '',
      price: item.product.price,
      comparePrice: item.product.comparePrice ?? null,
      category: '',
      images: item.product.images,
      stock: item.product.stock,
      featured: false,
      trending: false,
      rating: item.product.rating,
      reviewCount: item.product.reviewCount,
      createdAt: item.createdAt,
      updatedAt: item.createdAt,
    };
    cartAddItem(product, 1);
    toast.success('Added to cart!');
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      logout();
      navigate('home');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('home');
    toast.success('Logged out successfully');
  };

  // ==================== Helpers ====================

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const formatDateShort = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      month: 'short',
      year: 'numeric',
    });

  // ==================== Section: Edit Profile ====================
  const renderProfileSection = () => (
    <div className="space-y-5">
      {loadingProfile ? (
        <div className="flex items-center gap-4 p-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="space-y-2.5 flex-1">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-48" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      ) : (
        <Card className="border-[#1A1A1A]/6 shadow-sm rounded-2xl overflow-hidden">
          <CardContent className="p-5">
            <div className="flex flex-col items-center text-center gap-4 mb-6">
              <Avatar className="h-20 w-20 bg-[#C9A96E]/10 ring-4 ring-[#C9A96E]/10">
                <AvatarFallback className="text-xl font-bold text-[#C9A96E] bg-[#C9A96E]/10">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-base font-semibold text-[#1A1A1A]">{user.name}</p>
                <p className="text-sm text-[#1A1A1A]/50">{user.email}</p>
              </div>
            </div>

            {isEditingProfile ? (
              <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name" className="text-sm font-medium text-[#1A1A1A]/70">Full Name</Label>
                  <Input
                    id="profile-name"
                    className="h-11 border-[#1A1A1A]/12 rounded-xl"
                    {...profileForm.register('name')}
                  />
                  {profileForm.formState.errors.name && (
                    <p className="text-xs text-red-500">{profileForm.formState.errors.name.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile-phone" className="text-sm font-medium text-[#1A1A1A]/70">
                    Phone <span className="text-[#1A1A1A]/30">(optional)</span>
                  </Label>
                  <Input
                    id="profile-phone"
                    className="h-11 border-[#1A1A1A]/12 rounded-xl"
                    {...profileForm.register('phone')}
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={profileLoading}
                    className="flex-1 bg-[#C9A96E] hover:bg-[#b89558] text-white rounded-xl h-11"
                  >
                    {profileLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Saving...</>
                    ) : (
                      'Save Changes'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-[#1A1A1A]/12 rounded-xl h-11"
                    onClick={() => {
                      setIsEditingProfile(false);
                      profileForm.reset({ name: user.name, phone: user.phone || '' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2.5 border-b border-[#1A1A1A]/5">
                  <span className="text-sm text-[#1A1A1A]/50">Full Name</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">{user.name}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#1A1A1A]/5">
                  <span className="text-sm text-[#1A1A1A]/50">Email</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">{user.email}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#1A1A1A]/5">
                  <span className="text-sm text-[#1A1A1A]/50">Phone</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">{user.phone || 'Not provided'}</span>
                </div>
                <div className="flex items-center justify-between py-2.5 border-b border-[#1A1A1A]/5">
                  <span className="text-sm text-[#1A1A1A]/50">Member Since</span>
                  <span className="text-sm font-medium text-[#1A1A1A]">{formatDate(user.createdAt)}</span>
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/8 rounded-xl h-11"
                  onClick={() => setIsEditingProfile(true)}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );

  // ==================== Section: Orders ====================
  const renderOrdersSection = () => (
    <div className="space-y-4">
      {loadingOrders ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-[#1A1A1A]/6 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-12 w-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <Card className="border-[#1A1A1A]/6 shadow-sm rounded-2xl">
          <CardContent className="py-14 text-center">
            <div className="w-16 h-16 bg-[#C9A96E]/8 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="h-8 w-8 text-[#C9A96E]/50" />
            </div>
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">No orders yet</h3>
            <p className="text-sm text-[#1A1A1A]/45 mb-5">Start shopping to see your orders here</p>
            <Button
              onClick={() => navigate('products')}
              className="bg-[#C9A96E] hover:bg-[#b89558] text-white rounded-xl h-11 px-6"
            >
              <ShoppingBag className="h-4 w-4 mr-2" />
              Shop Now
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrder === order.id;
            const status = statusConfig[order.status] || statusConfig.pending;
            let parsedAddress: Record<string, string> | null = null;
            try {
              parsedAddress = JSON.parse(order.addressSnapshot);
            } catch {
              // ignore
            }

            return (
              <Card key={order.id} className="border-[#1A1A1A]/6 shadow-sm rounded-2xl overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer active:bg-[#FAF8F5] transition-colors"
                  onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                >
                  {/* Order icon */}
                  <div className="w-11 h-11 rounded-xl bg-[#C9A96E]/8 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="h-5 w-5 text-[#C9A96E]" />
                  </div>
                  {/* Order info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[#1A1A1A]">#{order.orderNumber}</p>
                    <p className="text-xs text-[#1A1A1A]/45 mt-0.5">{formatDate(order.createdAt)}</p>
                    <p className="text-xs text-[#1A1A1A]/45 mt-0.5">
                      {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  {/* Status & amount */}
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <Badge className={`${status.className} text-[10px] font-medium border px-2 py-0.5`}>
                      {status.label}
                    </Badge>
                    <p className="text-sm font-bold text-[#1A1A1A]">₹{order.total.toLocaleString('en-IN')}</p>
                  </div>
                  {/* Chevron */}
                  <ChevronRight className={`h-4 w-4 text-[#1A1A1A]/25 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="border-t border-[#1A1A1A]/5 bg-[#FAFAF8] p-4 space-y-4">
                    {/* Items */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold text-[#1A1A1A]/40 uppercase tracking-wider">Items</p>
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 bg-white rounded-xl p-2.5">
                          <div className="h-12 w-12 rounded-lg bg-[#FAF8F5] overflow-hidden flex-shrink-0">
                            {item.productImage && (
                              <img
                                src={item.productImage}
                                alt={item.productName}
                                className="h-full w-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[#1A1A1A] truncate">{item.productName}</p>
                            <p className="text-xs text-[#1A1A1A]/45 mt-0.5">
                              Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-[#1A1A1A] flex-shrink-0">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Separator className="bg-[#1A1A1A]/6" />

                    {/* Shipping Address */}
                    {parsedAddress && (
                      <div>
                        <p className="text-[10px] font-semibold text-[#1A1A1A]/40 uppercase tracking-wider mb-1.5">Shipping Address</p>
                        <p className="text-xs text-[#1A1A1A]/60 leading-relaxed">
                          {parsedAddress.name}{parsedAddress.line1 && `, ${parsedAddress.line1}`}
                          {parsedAddress.line2 && `, ${parsedAddress.line2}`}
                          {parsedAddress.city && `, ${parsedAddress.city}`}
                          {parsedAddress.state && `, ${parsedAddress.state}`}
                          {parsedAddress.pincode && ` – ${parsedAddress.pincode}`}
                          {parsedAddress.phone && ` | ${parsedAddress.phone}`}
                        </p>
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="bg-white rounded-xl p-3.5 border border-[#1A1A1A]/5">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-[#1A1A1A]/55">
                          <span>Subtotal</span>
                          <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
                        </div>
                        {order.discount > 0 && (
                          <div className="flex justify-between text-emerald-600">
                            <span>Discount</span>
                            <span>-₹{order.discount.toLocaleString('en-IN')}</span>
                          </div>
                        )}
                        <div className="flex justify-between text-[#1A1A1A]/55">
                          <span>Shipping</span>
                          <span>{order.shipping === 0 ? 'FREE' : `₹${order.shipping.toLocaleString('en-IN')}`}</span>
                        </div>
                        <Separator className="bg-[#1A1A1A]/6" />
                        <div className="flex justify-between font-bold text-[#1A1A1A]">
                          <span>Total</span>
                          <span>₹{order.total.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#1A1A1A]/40">Payment</span>
                      <span className="font-medium text-[#1A1A1A]/70">
                        {order.paymentMethod === 'upi' ? 'UPI Payment' : 'Cash on Delivery'}
                      </span>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // ==================== Section: Addresses ====================
  const renderAddressesSection = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-[#1A1A1A]/45">
          {addresses.length > 0 ? `${addresses.length} saved address${addresses.length !== 1 ? 'es' : ''}` : ''}
        </p>
        <Button
          onClick={() => handleOpenAddressDialog(null)}
          className="bg-[#C9A96E] hover:bg-[#b89558] text-white rounded-xl h-9 px-4 text-sm"
          size="sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add New
        </Button>
      </div>

      {loadingAddresses ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border-[#1A1A1A]/6 shadow-sm rounded-2xl">
              <CardContent className="p-4 space-y-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <Card className="border-[#1A1A1A]/6 shadow-sm rounded-2xl">
          <CardContent className="py-14 text-center">
            <div className="w-16 h-16 bg-[#C9A96E]/8 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="h-8 w-8 text-[#C9A96E]/50" />
            </div>
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">No addresses yet</h3>
            <p className="text-sm text-[#1A1A1A]/45 mb-5">Add a delivery address for faster checkout</p>
            <Button
              onClick={() => handleOpenAddressDialog(null)}
              className="bg-[#C9A96E] hover:bg-[#b89558] text-white rounded-xl h-11 px-6"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr) => (
            <Card
              key={addr.id}
              className={`border shadow-sm rounded-2xl overflow-hidden transition-all ${
                addr.isDefault ? 'border-[#C9A96E]/40 bg-[#C9A96E]/[0.02]' : 'border-[#1A1A1A]/6'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {addr.label && (
                      <span className="text-xs font-semibold text-[#C9A96E] bg-[#C9A96E]/10 px-2 py-0.5 rounded-full">
                        {addr.label}
                      </span>
                    )}
                    {addr.isDefault && (
                      <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenAddressDialog(addr)}
                      className="p-1.5 rounded-lg hover:bg-[#1A1A1A]/5 transition-colors"
                    >
                      <Pencil className="h-3.5 w-3.5 text-[#1A1A1A]/40" />
                    </button>
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5 text-[#1A1A1A]/40 hover:text-red-500" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-[#1A1A1A]">{addr.name}</p>
                  <p className="text-xs text-[#1A1A1A]/55 leading-relaxed">
                    {addr.line1}{addr.line2 && `, ${addr.line2}`}, {addr.city}, {addr.state} – {addr.pincode}
                  </p>
                  <p className="text-xs text-[#1A1A1A]/45">{addr.phone}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddressDialog
        open={addressDialogOpen}
        onOpenChange={setAddressDialogOpen}
        address={editingAddress}
        userId={user.id}
        onSave={fetchAddresses}
      />
    </div>
  );

  // ==================== Section: Wishlist ====================
  const renderWishlistSection = () => (
    <div className="space-y-4">
      {loadingWishlist ? (
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-[#1A1A1A]/6 shadow-sm rounded-2xl">
              <CardContent className="p-3">
                <Skeleton className="h-36 w-full rounded-xl mb-3" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <Card className="border-[#1A1A1A]/6 shadow-sm rounded-2xl">
          <CardContent className="py-14 text-center">
            <div className="w-16 h-16 bg-[#C9A96E]/8 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="h-8 w-8 text-[#C9A96E]/50" />
            </div>
            <h3 className="text-base font-semibold text-[#1A1A1A] mb-1">Wishlist is empty</h3>
            <p className="text-sm text-[#1A1A1A]/45 mb-5">Save items you love for later</p>
            <Button
              onClick={() => navigate('products')}
              className="bg-[#C9A96E] hover:bg-[#b89558] text-white rounded-xl h-11 px-6"
            >
              <Store className="h-4 w-4 mr-2" />
              Browse Products
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {wishlistItems.map((item) => {
            const images = Array.isArray(item.product.images) ? item.product.images : [];
            return (
              <Card key={item.id} className="border-[#1A1A1A]/6 shadow-sm rounded-2xl overflow-hidden group">
                <div className="relative aspect-square bg-[#FAF8F5]">
                  {images.length > 0 && (
                    <img
                      src={images[0]}
                      alt={item.product.name}
                      className="h-full w-full object-cover"
                    />
                  )}
                  <button
                    onClick={() => handleRemoveFromWishlist(item.productId)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/90 shadow-sm flex items-center justify-center hover:bg-red-50 transition-colors"
                  >
                    <X className="h-3.5 w-3.5 text-[#1A1A1A]/50" />
                  </button>
                </div>
                <CardContent className="p-3">
                  <p className="text-xs font-medium text-[#1A1A1A] truncate">{item.product.name}</p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="text-sm font-bold text-[#1A1A1A]">₹{item.product.price.toLocaleString('en-IN')}</span>
                    {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                      <span className="text-[10px] text-[#1A1A1A]/35 line-through">
                        ₹{item.product.comparePrice.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                  {item.product.stock > 0 ? (
                    <Button
                      size="sm"
                      className="w-full mt-2.5 bg-[#C9A96E] hover:bg-[#b89558] text-white rounded-lg h-8 text-xs"
                      onClick={() => handleMoveToCart(item)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add to Cart
                    </Button>
                  ) : (
                    <p className="text-[10px] text-red-500 font-medium mt-2.5 text-center">Out of Stock</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  // ==================== Section: Security ====================
  const renderSecuritySection = () => (
    <div className="space-y-4">
      <Card className="border-[#1A1A1A]/6 shadow-sm rounded-2xl overflow-hidden">
        <CardHeader className="pb-3 pt-5 px-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-[#C9A96E]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">Change Password</p>
              <p className="text-xs text-[#1A1A1A]/45">Update your account password</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-5 pb-5">
          <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-pw" className="text-sm font-medium text-[#1A1A1A]/70">Current Password</Label>
              <div className="relative">
                <Input
                  id="current-pw"
                  type={showCurrentPassword ? 'text' : 'password'}
                  className="h-11 border-[#1A1A1A]/12 rounded-xl pr-10"
                  {...passwordForm.register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw" className="text-sm font-medium text-[#1A1A1A]/70">New Password</Label>
              <div className="relative">
                <Input
                  id="new-pw"
                  type={showNewPassword ? 'text' : 'password'}
                  className="h-11 border-[#1A1A1A]/12 rounded-xl pr-10"
                  {...passwordForm.register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw" className="text-sm font-medium text-[#1A1A1A]/70">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirm-pw"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="h-11 border-[#1A1A1A]/12 rounded-xl pr-10"
                  {...passwordForm.register('confirmPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/30"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-red-500">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
            <Button
              type="submit"
              disabled={passwordLoading}
              className="w-full bg-[#C9A96E] hover:bg-[#b89558] text-white rounded-xl h-11"
            >
              {passwordLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Updating...</>
              ) : (
                'Update Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== Section: Settings ====================
  const renderSettingsSection = () => (
    <div className="space-y-4">
      {/* Account Actions */}
      <Card className="border-[#1A1A1A]/6 shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          <div className="divide-y divide-[#1A1A1A]/5">
            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-5 py-4 hover:bg-[#FAF8F5] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                <LogOut className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-[#1A1A1A]">Log Out</p>
                <p className="text-xs text-[#1A1A1A]/40">Sign out of your account</p>
              </div>
              <ChevronRight className="h-4 w-4 text-[#1A1A1A]/25" />
            </button>

            {/* Delete Account */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="w-full flex items-center gap-3 px-5 py-4 hover:bg-red-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-red-600">Delete Account</p>
                    <p className="text-xs text-[#1A1A1A]/40">Permanently delete your account and data</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-[#1A1A1A]/25" />
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="mx-4 rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-base">Delete Account?</AlertDialogTitle>
                  <AlertDialogDescription className="text-sm text-[#1A1A1A]/60">
                    This action cannot be undone. All your data including orders, addresses, and wishlist will be permanently deleted.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2 sm:gap-0">
                  <AlertDialogCancel className="rounded-xl border-[#1A1A1A]/12">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700 text-white rounded-xl"
                  >
                    {deleteLoading ? (
                      <><Loader2 className="h-4 w-4 animate-spin mr-1" /> Deleting...</>
                    ) : (
                      'Delete Account'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* App Info */}
      <Card className="border-[#1A1A1A]/6 shadow-sm rounded-2xl">
        <CardContent className="p-5 text-center">
          <div className="w-12 h-12 rounded-xl bg-[#B87333]/10 flex items-center justify-center mx-auto mb-3 overflow-hidden">
            <img
              src="/logo.png"
              alt="IndiCore Originals"
              className="h-8 w-auto"
            />
          </div>
          <p className="text-sm font-semibold text-[#1A1A1A]">IndiCore Originals</p>
          <p className="text-xs text-[#1A1A1A]/40 mt-0.5">Premium Products</p>
          <p className="text-[10px] text-[#1A1A1A]/30 mt-2">Version 1.0.0</p>
        </CardContent>
      </Card>
    </div>
  );

  // ==================== Section Router ====================
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection();
      case 'orders':
        return renderOrdersSection();
      case 'addresses':
        return renderAddressesSection();
      case 'wishlist':
        return renderWishlistSection();
      case 'security':
        return renderSecuritySection();
      case 'settings':
        return renderSettingsSection();
      default:
        return null;
    }
  };

  const sectionTitle = activeSection === 'main'
    ? 'Profile'
    : menuItems.find((m) => m.id === activeSection)?.label || 'Profile';

  // ==================== Main Render ====================
  return (
    <div className="min-h-screen bg-[#FAF8F5] pb-20 md:pb-0">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-[#1A1A1A]/5">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center gap-3">
          {activeSection !== 'main' && (
            <button
              onClick={() => setActiveSection('main')}
              className="w-9 h-9 rounded-xl bg-[#1A1A1A]/5 flex items-center justify-center hover:bg-[#1A1A1A]/8 transition-colors -ml-1"
            >
              <ChevronLeft className="h-5 w-5 text-[#1A1A1A]" />
            </button>
          )}
          <h1 className="text-lg font-bold text-[#1A1A1A]">{sectionTitle}</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4">
        {activeSection === 'main' ? (
          <>
            {/* User Card */}
            {loadingProfile ? (
              <div className="mt-5 p-5 bg-white rounded-2xl shadow-sm border border-[#1A1A1A]/6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-16 w-16 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="mt-5 p-5 bg-white rounded-2xl shadow-sm border border-[#1A1A1A]/6 cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => setActiveSection('profile')}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 bg-[#C9A96E]/10 ring-3 ring-[#C9A96E]/10 flex-shrink-0">
                    <AvatarFallback className="text-lg font-bold text-[#C9A96E] bg-[#C9A96E]/10">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-[#1A1A1A] truncate">{user.name}</p>
                    <p className="text-sm text-[#1A1A1A]/50 truncate">{user.email}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <CalendarDays className="h-3 w-3 text-[#1A1A1A]/30" />
                      <p className="text-xs text-[#1A1A1A]/35">Member since {formatDateShort(user.createdAt)}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#1A1A1A]/20 flex-shrink-0" />
                </div>
              </div>
            )}

            {/* Menu Items */}
            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-[#1A1A1A]/6 overflow-hidden">
              <div className="divide-y divide-[#1A1A1A]/5">
                {menuItems.slice(1).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className="w-full flex items-center gap-3.5 px-5 py-4 hover:bg-[#FAF8F5]/80 active:bg-[#FAF8F5] transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#C9A96E]/8 flex items-center justify-center flex-shrink-0 text-[#C9A96E]">
                      {item.icon}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-[#1A1A1A]">{item.label}</p>
                      <p className="text-xs text-[#1A1A1A]/35 mt-0.5">{item.description}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-[#1A1A1A]/20 flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center gap-2.5 py-3.5 bg-white rounded-2xl shadow-sm border border-[#1A1A1A]/6 hover:bg-red-50/50 active:bg-red-50 transition-colors text-red-500"
            >
              <LogOut className="h-4.5 w-4.5" />
              <span className="text-sm font-medium">Logout</span>
            </button>

            {/* App Version */}
            <p className="text-center text-[10px] text-[#1A1A1A]/20 mt-6 pb-2">IndiCore Originals v1.0.0</p>
          </>
        ) : (
          <div className="py-5">
            {renderActiveSection()}
          </div>
        )}
      </main>

      {/* Bottom Nav */}
      <BottomNav active="profile" />
    </div>
  );
}

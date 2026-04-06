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
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useNavigationStore, useAuthStore } from '@/lib/store';
import type { Address, Order } from '@/lib/types';

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
  pending: { label: 'Pending', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  shipped: { label: 'Shipped', className: 'bg-blue-100 text-blue-800 border-blue-200' },
  delivered: { label: 'Delivered', className: 'bg-green-100 text-green-800 border-green-200' },
  cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
};

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
    },
  });

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
      <DialogContent className="sm:max-w-lg">
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
                className="h-9 border-[#1A1A1A]/20"
                {...register('label')}
              />
            </div>
            <div className="space-y-2 col-span-2 sm:col-span-1">
              <Label htmlFor="addr-name" className="text-sm">
                Full Name
              </Label>
              <Input
                id="addr-name"
                placeholder="John Doe"
                className="h-9 border-[#1A1A1A]/20"
                {...register('name')}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-phone" className="text-sm">
              Phone
            </Label>
            <Input
              id="addr-phone"
              placeholder="+91 98765 43210"
              className="h-9 border-[#1A1A1A]/20"
              {...register('phone')}
            />
            {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="addr-line1" className="text-sm">
              Address Line 1
            </Label>
            <Input
              id="addr-line1"
              placeholder="House no, Building, Street"
              className="h-9 border-[#1A1A1A]/20"
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
              className="h-9 border-[#1A1A1A]/20"
              {...register('line2')}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="addr-city" className="text-sm">
                City
              </Label>
              <Input
                id="addr-city"
                placeholder="Mumbai"
                className="h-9 border-[#1A1A1A]/20"
                {...register('city')}
              />
              {errors.city && <p className="text-xs text-red-500">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-state" className="text-sm">
                State
              </Label>
              <Input
                id="addr-state"
                placeholder="Maharashtra"
                className="h-9 border-[#1A1A1A]/20"
                {...register('state')}
              />
              {errors.state && <p className="text-xs text-red-500">{errors.state.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="addr-pincode" className="text-sm">
                Pincode
              </Label>
              <Input
                id="addr-pincode"
                placeholder="400001"
                className="h-9 border-[#1A1A1A]/20"
                {...register('pincode')}
              />
              {errors.pincode && <p className="text-xs text-red-500">{errors.pincode.message}</p>}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[#1A1A1A]/20"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#C9A96E] hover:bg-[#b89558] text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
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

// ==================== Main Profile Page ====================

export default function ProfilePage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const { user, isAuthenticated, token, updateProfile, logout } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
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

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('login');
    }
  }, [isAuthenticated, navigate]);

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
        setAddresses(data);
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
        setOrders(data);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingOrders(false);
    }
  }, [token]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
      fetchOrders();
    }
  }, [isAuthenticated, fetchAddresses, fetchOrders]);

  // Update profile form when user changes
  useEffect(() => {
    if (user) {
      profileForm.reset({ name: user.name, phone: user.phone || '' });
    }
  }, [user, profileForm]);

  if (!isAuthenticated || !user) {
    return null;
  }

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

  const handleLogout = () => {
    logout();
    navigate('home');
    toast.success('Logged out successfully');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Breadcrumb */}
      <div className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                asChild
                className="cursor-pointer hover:text-[#C9A96E]"
              >
                <span onClick={() => navigate('home')}>Home</span>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>My Account</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">My Account</h1>
          <p className="mt-1 text-[#1A1A1A]/60">
            Manage your profile, addresses, and orders
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-8">
          <TabsList className="bg-white border border-[#C9A96E]/20">
            <TabsTrigger value="profile" className="gap-2 data-[state=active]:bg-[#C9A96E]/10 data-[state=active]:text-[#C9A96E]">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="addresses" className="gap-2 data-[state=active]:bg-[#C9A96E]/10 data-[state=active]:text-[#C9A96E]">
              <MapPin className="h-4 w-4" />
              <span className="hidden sm:inline">Addresses</span>
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 data-[state=active]:bg-[#C9A96E]/10 data-[state=active]:text-[#C9A96E]">
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Orders</span>
            </TabsTrigger>
          </TabsList>

          {/* ==================== PROFILE TAB ==================== */}
          <TabsContent value="profile">
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Profile Info Card */}
              <Card className="lg:col-span-1 border-[#C9A96E]/20">
                <CardContent className="pt-6 flex flex-col items-center text-center">
                  <Avatar className="h-20 w-20 mb-4 bg-[#C9A96E]/10">
                    <AvatarFallback className="text-xl font-semibold text-[#C9A96E] bg-[#C9A96E]/10">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-lg font-semibold text-[#1A1A1A]">{user.name}</h2>
                  <p className="text-sm text-[#1A1A1A]/60">{user.email}</p>
                  {user.phone && (
                    <p className="text-sm text-[#1A1A1A]/60 mt-1">{user.phone}</p>
                  )}
                  <Separator className="my-4" />
                  <div className="text-xs text-[#1A1A1A]/40">
                    Member since {formatDate(user.createdAt)}
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 border-[#C9A96E]/30 text-[#C9A96E] hover:bg-[#C9A96E]/10 w-full"
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                  >
                    <Pencil className="h-4 w-4" />
                    {isEditingProfile ? 'Cancel Edit' : 'Edit Profile'}
                  </Button>
                </CardContent>
              </Card>

              <div className="lg:col-span-2 space-y-8">
                {/* Edit Profile Form */}
                <Card className="border-[#C9A96E]/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Personal Information</CardTitle>
                    <CardDescription>Update your personal details</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isEditingProfile ? (
                      <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="profile-name" className="text-sm">Full Name</Label>
                            <Input
                              id="profile-name"
                              className="h-9 border-[#1A1A1A]/20"
                              {...profileForm.register('name')}
                            />
                            {profileForm.formState.errors.name && (
                              <p className="text-xs text-red-500">
                                {profileForm.formState.errors.name.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="profile-phone" className="text-sm">
                              Phone <span className="text-[#1A1A1A]/40">(optional)</span>
                            </Label>
                            <Input
                              id="profile-phone"
                              className="h-9 border-[#1A1A1A]/20"
                              {...profileForm.register('phone')}
                            />
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            type="submit"
                            disabled={profileLoading}
                            className="bg-[#C9A96E] hover:bg-[#b89558] text-white"
                          >
                            {profileLoading ? (
                              <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</>
                            ) : (
                              'Save Changes'
                            )}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="border-[#1A1A1A]/20"
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
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-1">Full Name</p>
                          <p className="text-sm font-medium text-[#1A1A1A]">{user.name}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-1">Email</p>
                          <p className="text-sm font-medium text-[#1A1A1A]">{user.email}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-1">Phone</p>
                          <p className="text-sm font-medium text-[#1A1A1A]">{user.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-[#1A1A1A]/40 uppercase tracking-wide mb-1">Role</p>
                          <p className="text-sm font-medium text-[#1A1A1A] capitalize">{user.role}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Change Password */}
                <Card className="border-[#C9A96E]/20">
                  <CardHeader>
                    <CardTitle className="text-lg">Change Password</CardTitle>
                    <CardDescription>Update your account password</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-3">
                        <div className="space-y-2">
                          <Label htmlFor="current-password" className="text-sm">Current Password</Label>
                          <div className="relative">
                            <Input
                              id="current-password"
                              type={showCurrentPassword ? 'text' : 'password'}
                              className="h-9 pr-9 border-[#1A1A1A]/20"
                              {...passwordForm.register('currentPassword')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60"
                            >
                              {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          {passwordForm.formState.errors.currentPassword && (
                            <p className="text-xs text-red-500">
                              {passwordForm.formState.errors.currentPassword.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="new-password" className="text-sm">New Password</Label>
                          <div className="relative">
                            <Input
                              id="new-password"
                              type={showNewPassword ? 'text' : 'password'}
                              className="h-9 pr-9 border-[#1A1A1A]/20"
                              {...passwordForm.register('newPassword')}
                            />
                            <button
                              type="button"
                              onClick={() => setShowNewPassword(!showNewPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#1A1A1A]/40 hover:text-[#1A1A1A]/60"
                            >
                              {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                            </button>
                          </div>
                          {passwordForm.formState.errors.newPassword && (
                            <p className="text-xs text-red-500">
                              {passwordForm.formState.errors.newPassword.message}
                            </p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirm-new-password" className="text-sm">Confirm New</Label>
                          <Input
                            id="confirm-new-password"
                            type="password"
                            className="h-9 border-[#1A1A1A]/20"
                            {...passwordForm.register('confirmPassword')}
                          />
                          {passwordForm.formState.errors.confirmPassword && (
                            <p className="text-xs text-red-500">
                              {passwordForm.formState.errors.confirmPassword.message}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        type="submit"
                        disabled={passwordLoading}
                        className="bg-[#C9A96E] hover:bg-[#b89558] text-white"
                      >
                        {passwordLoading ? (
                          <><Loader2 className="h-4 w-4 animate-spin" /> Updating...</>
                        ) : (
                          'Update Password'
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                {/* Logout */}
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ==================== ADDRESSES TAB ==================== */}
          <TabsContent value="addresses">
            <Card className="border-[#C9A96E]/20">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Saved Addresses</CardTitle>
                  <CardDescription>Manage your delivery addresses</CardDescription>
                </div>
                <Button
                  onClick={() => handleOpenAddressDialog(null)}
                  className="bg-[#C9A96E] hover:bg-[#b89558] text-white"
                >
                  <Plus className="h-4 w-4" />
                  Add New
                </Button>
              </CardHeader>
              <CardContent>
                {loadingAddresses ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-36 rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-12">
                    <MapPin className="h-12 w-12 text-[#1A1A1A]/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#1A1A1A]">No saved addresses</h3>
                    <p className="text-sm text-[#1A1A1A]/60 mt-1">
                      Add your first delivery address
                    </p>
                    <Button
                      onClick={() => handleOpenAddressDialog(null)}
                      className="mt-4 bg-[#C9A96E] hover:bg-[#b89558] text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Add Address
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className="relative rounded-lg border border-[#1A1A1A]/10 p-4 hover:border-[#C9A96E]/40 transition-colors"
                      >
                        {address.isDefault && (
                          <Badge className="absolute top-3 right-3 bg-[#C9A96E]/10 text-[#C9A96E] border-[#C9A96E]/20 text-[10px]">
                            Default
                          </Badge>
                        )}
                        {address.label && (
                          <p className="text-sm font-semibold text-[#1A1A1A]">{address.label}</p>
                        )}
                        <p className="text-sm text-[#1A1A1A]/80 mt-1">{address.name}</p>
                        <p className="text-sm text-[#1A1A1A]/60">{address.phone}</p>
                        <p className="text-sm text-[#1A1A1A]/60 mt-1">
                          {address.line1}
                          {address.line2 && `, ${address.line2}`}
                        </p>
                        <p className="text-sm text-[#1A1A1A]/60">
                          {address.city}, {address.state} - {address.pincode}
                        </p>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#C9A96E] hover:text-[#b89558] hover:bg-[#C9A96E]/10 h-8 text-xs"
                            onClick={() => handleOpenAddressDialog(address)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50 h-8 text-xs"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Address Dialog */}
            <AddressDialog
              open={addressDialogOpen}
              onOpenChange={setAddressDialogOpen}
              address={editingAddress}
              userId={user.id}
              onSave={fetchAddresses}
            />
          </TabsContent>

          {/* ==================== ORDERS TAB ==================== */}
          <TabsContent value="orders">
            <Card className="border-[#C9A96E]/20">
              <CardHeader>
                <CardTitle className="text-lg">Order History</CardTitle>
                <CardDescription>View and track your orders</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingOrders ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-24 rounded-lg bg-gray-100 animate-pulse" />
                    ))}
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 text-[#1A1A1A]/20 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-[#1A1A1A]">No orders yet</h3>
                    <p className="text-sm text-[#1A1A1A]/60 mt-1">
                      You haven&apos;t placed any orders yet
                    </p>
                    <Button
                      onClick={() => navigate('products')}
                      className="mt-4 bg-[#C9A96E] hover:bg-[#b89558] text-white"
                    >
                      <ShoppingBag className="h-4 w-4" />
                      Shop Now
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isExpanded = expandedOrder === order.id;
                      const status = statusConfig[order.status] || statusConfig.pending;

                      return (
                        <div
                          key={order.id}
                          className="rounded-lg border border-[#1A1A1A]/10 overflow-hidden hover:border-[#C9A96E]/40 transition-colors"
                        >
                          <div
                            className="flex items-center justify-between p-4 cursor-pointer"
                            onClick={() => setExpandedOrder(isExpanded ? null : order.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div>
                                <p className="text-sm font-semibold text-[#1A1A1A]">
                                  #{order.orderNumber}
                                </p>
                                <p className="text-xs text-[#1A1A1A]/60">
                                  {formatDate(order.createdAt)}
                                </p>
                              </div>
                            <Badge className={`${status.className} text-xs border`}>
                              {status.label}
                            </Badge>
                            <p className="text-sm font-semibold text-[#1A1A1A]">
                              ₹{order.total.toLocaleString('en-IN')}
                            </p>
                            <p className="text-xs text-[#1A1A1A]/60 hidden sm:block">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                            </div>
                            <ChevronRight
                              className={`h-5 w-5 text-[#1A1A1A]/40 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                            />
                          </div>

                          {isExpanded && (
                            <div className="border-t border-[#1A1A1A]/10 p-4 bg-[#FAF8F5]/50">
                              <div className="space-y-3">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-3"
                                  >
                                    <div className="h-12 w-12 rounded-md bg-[#1A1A1A]/5 overflow-hidden flex-shrink-0">
                                      {item.productImage && (
                                        <img
                                          src={item.productImage}
                                          alt={item.productName}
                                          className="h-full w-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-[#1A1A1A] truncate">
                                        {item.productName}
                                      </p>
                                      <p className="text-xs text-[#1A1A1A]/60">
                                        Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium text-[#1A1A1A]">
                                      ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                                    </p>
                                  </div>
                                ))}
                              </div>
                              <Separator className="my-3" />
                              <div className="flex justify-between text-xs text-[#1A1A1A]/60">
                                <span>Payment: {order.paymentMethod.toUpperCase()}</span>
                                <span>
                                  Shipping: ₹{order.shipping.toLocaleString('en-IN')}
                                  {order.discount > 0 && (
                                    <span className="text-green-600 ml-2">
                                      - ₹{order.discount.toLocaleString('en-IN')} discount
                                    </span>
                                  )}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

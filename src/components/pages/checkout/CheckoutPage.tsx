'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Truck,
  MapPin,
  CreditCard,
  Banknote,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  useNavigationStore,
  useCartStore,
  useAuthStore,
} from '@/lib/store';
import type { Address, PaymentMethod } from '@/lib/types';

// ─── Validation Schema ────────────────────────────────────────────
const addressSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number is too long')
    .regex(/^[0-9+\-\s()]+$/, 'Enter a valid phone number'),
  line1: z.string().min(5, 'Address is required'),
  line2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z
    .string()
    .min(5, 'Enter a valid pincode')
    .max(10, 'Enter a valid pincode')
    .regex(/^[0-9]+$/, 'Pincode must be numeric'),
});

type AddressFormData = z.infer<typeof addressSchema>;

// ─── Step Indicator ───────────────────────────────────────────────
function StepIndicator({ step, label, icon: Icon, isActive }: { step: number; label: string; icon: React.ElementType; isActive: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
      <div
        className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-colors ${
          isActive
            ? 'bg-[#C9A96E] text-white'
            : 'bg-gray-100 text-gray-400'
        }`}
      >
        {step}
      </div>
      <div className="hidden sm:flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#1A1A1A]" />
        <span className="text-sm font-semibold text-[#1A1A1A]">{label}</span>
      </div>
    </div>
  );
}

// ─── Address Card (saved address) ─────────────────────────────────
function SavedAddressCard({
  address,
  isSelected,
  onSelect,
}: {
  address: Address;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
        isSelected
          ? 'border-[#C9A96E] bg-[#C9A96E]/5 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 bg-white'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
            isSelected ? 'border-[#C9A96E] bg-[#C9A96E]' : 'border-gray-300'
          }`}
        >
          {isSelected && (
            <svg className="h-3 w-3 text-white" viewBox="0 0 12 12" fill="none">
              <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[#1A1A1A]">{address.name}</p>
          <p className="mt-1 text-sm text-gray-500">{address.phone}</p>
          <p className="mt-1 text-sm text-gray-500">
            {address.line1}
            {address.line2 ? `, ${address.line2}` : ''}
          </p>
          <p className="text-sm text-gray-500">
            {address.city}, {address.state} - {address.pincode}
          </p>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Shipping Step ────────────────────────────────────────────────
function ShippingStep({
  onAddressSet,
}: {
  onAddressSet: (address: AddressFormData & { saveAddress: boolean }) => void;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigationStore((s) => s.navigate);

  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [saveAddress, setSaveAddress] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
    },
  });

  // Fetch saved addresses
  useEffect(() => {
    if (!isAuthenticated || !token) return;
    async function fetchAddresses() {
      setLoadingAddresses(true);
      try {
        const res = await fetch('/api/addresses', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSavedAddresses(Array.isArray(data) ? data : []);
        }
      } catch {
        // Addresses API not available yet
      } finally {
        setLoadingAddresses(false);
      }
    }
    fetchAddresses();
  }, [isAuthenticated, token]);

  const handleSelectSavedAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    setValue('name', address.name);
    setValue('phone', address.phone);
    setValue('line1', address.line1);
    setValue('line2', address.line2 || '');
    setValue('city', address.city);
    setValue('state', address.state);
    setValue('pincode', address.pincode);
  };

  const onSubmit = (data: AddressFormData) => {
    onAddressSet({ ...data, saveAddress });
  };

  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center"
      >
        <AlertCircle className="mx-auto h-8 w-8 text-amber-500" />
        <p className="mt-3 text-sm font-medium text-amber-800">
          Please log in to proceed with checkout
        </p>
        <p className="mt-1 text-xs text-amber-600">
          You need an account to place an order and track your delivery
        </p>
        <Button
          onClick={() => navigate('login')}
          className="mt-4 bg-[#C9A96E] hover:bg-[#b89558] text-white font-semibold"
        >
          Log In / Sign Up
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card className="border-gray-100">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-[#C9A96E]" />
            Shipping Address
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Saved Addresses */}
          {loadingAddresses && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading saved addresses...
            </div>
          )}

          {savedAddresses.length > 0 && !loadingAddresses && (
            <div className="space-y-2">
              <Label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                Saved Addresses
              </Label>
              <div className="grid gap-2">
                {savedAddresses.map((addr) => (
                  <SavedAddressCard
                    key={addr.id}
                    address={addr}
                    isSelected={selectedAddressId === addr.id}
                    onSelect={() => handleSelectSavedAddress(addr)}
                  />
                ))}
              </div>
            </div>
          )}

          <Separator className="my-4" />

          {/* Address Form */}
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Full Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium text-[#1A1A1A]">
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  className="h-10 text-sm"
                  {...register('name')}
                />
                {errors.name && (
                  <p className="text-xs text-red-500">{errors.name.message}</p>
                )}
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-sm font-medium text-[#1A1A1A]">
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  placeholder="+91 98765 43210"
                  className="h-10 text-sm"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Address Line 1 */}
            <div className="space-y-1.5">
              <Label htmlFor="line1" className="text-sm font-medium text-[#1A1A1A]">
                Address Line 1 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="line1"
                placeholder="House/Flat no., Street name"
                className="h-10 text-sm"
                {...register('line1')}
              />
              {errors.line1 && (
                <p className="text-xs text-red-500">{errors.line1.message}</p>
              )}
            </div>

            {/* Address Line 2 */}
            <div className="space-y-1.5">
              <Label htmlFor="line2" className="text-sm font-medium text-[#1A1A1A]">
                Address Line 2 <span className="text-xs text-gray-400">(optional)</span>
              </Label>
              <Input
                id="line2"
                placeholder="Landmark, Area, etc."
                className="h-10 text-sm"
                {...register('line2')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {/* City */}
              <div className="space-y-1.5">
                <Label htmlFor="city" className="text-sm font-medium text-[#1A1A1A]">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  placeholder="Mumbai"
                  className="h-10 text-sm"
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-xs text-red-500">{errors.city.message}</p>
                )}
              </div>

              {/* State */}
              <div className="space-y-1.5">
                <Label htmlFor="state" className="text-sm font-medium text-[#1A1A1A]">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  placeholder="Maharashtra"
                  className="h-10 text-sm"
                  {...register('state')}
                />
                {errors.state && (
                  <p className="text-xs text-red-500">{errors.state.message}</p>
                )}
              </div>

              {/* Pincode */}
              <div className="space-y-1.5">
                <Label htmlFor="pincode" className="text-sm font-medium text-[#1A1A1A]">
                  Pincode <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="pincode"
                  placeholder="400001"
                  className="h-10 text-sm"
                  {...register('pincode')}
                />
                {errors.pincode && (
                  <p className="text-xs text-red-500">{errors.pincode.message}</p>
                )}
              </div>
            </div>

            {/* Save Address Checkbox */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="saveAddress"
                checked={saveAddress}
                onCheckedChange={(checked) => setSaveAddress(checked === true)}
                className="border-gray-300 data-[state=checked]:bg-[#C9A96E] data-[state=checked]:border-[#C9A96E]"
              />
              <Label htmlFor="saveAddress" className="text-sm text-gray-600 cursor-pointer">
                Save this address for future orders
              </Label>
            </div>
          </div>

          {/* Continue Button */}
          <Button
            type="submit"
            className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white font-semibold h-11 text-sm"
          >
            Continue to Payment
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}

// ─── Payment Step ─────────────────────────────────────────────────
function PaymentStep({
  onPaymentSet,
}: {
  onPaymentSet: (method: PaymentMethod, upiId?: string) => void;
}) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState('');

  const handleSubmit = () => {
    if (paymentMethod === 'upi' && !upiId.trim()) {
      toast.error('Please enter your UPI ID');
      return;
    }
    if (paymentMethod === 'upi' && upiId.trim()) {
      const upiRegex = /^[\w.-]+@[\w]+$/;
      if (!upiRegex.test(upiId.trim())) {
        toast.error('Please enter a valid UPI ID (e.g., name@upi)');
        return;
      }
    }
    onPaymentSet(paymentMethod, upiId.trim());
  };

  return (
    <Card className="border-gray-100">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="h-5 w-5 text-[#C9A96E]" />
          Payment Method
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <RadioGroup
          value={paymentMethod}
          onValueChange={(val) => setPaymentMethod(val as PaymentMethod)}
          className="space-y-3"
        >
          {/* UPI Payment */}
          <label
            htmlFor="upi"
            className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
              paymentMethod === 'upi'
                ? 'border-[#C9A96E] bg-[#C9A96E]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <RadioGroupItem value="upi" id="upi" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-50">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A]">UPI Payment</p>
              <p className="text-xs text-gray-500">Pay using Google Pay, PhonePe, Paytm or any UPI app</p>
            </div>
          </label>

          {/* COD */}
          <label
            htmlFor="cod"
            className={`flex cursor-pointer items-center gap-4 rounded-lg border-2 p-4 transition-all ${
              paymentMethod === 'cod'
                ? 'border-[#C9A96E] bg-[#C9A96E]/5'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <RadioGroupItem value="cod" id="cod" />
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <Banknote className="h-5 w-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#1A1A1A]">Cash on Delivery</p>
              <p className="text-xs text-gray-500">Pay when your order is delivered to your doorstep</p>
            </div>
          </label>
        </RadioGroup>

        {/* UPI ID Input */}
        {paymentMethod === 'upi' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Label htmlFor="upiId" className="text-sm font-medium text-[#1A1A1A]">
              UPI ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="upiId"
              placeholder="yourname@upi"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value.toLowerCase())}
              className="mt-1.5 h-10 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400">
              Enter your UPI ID to receive payment request
            </p>
          </motion.div>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleSubmit}
          className="w-full bg-[#1A1A1A] hover:bg-[#333] text-white font-semibold h-11 text-sm"
        >
          Review Order
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── Order Summary Step ───────────────────────────────────────────
function OrderSummaryStep({
  address,
  paymentMethod,
  upiId,
  onPlaceOrder,
  onBack,
  placing,
}: {
  address: AddressFormData;
  paymentMethod: PaymentMethod;
  upiId?: string;
  onPlaceOrder: () => void;
  onBack: () => void;
  placing: boolean;
}) {
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDiscount = useCartStore((s) => s.getDiscount);
  const getTotal = useCartStore((s) => s.getTotal);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  return (
    <div className="space-y-6">
      {/* Shipping Info */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#C9A96E]" />
              Shipping Address
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-xs text-[#C9A96E] hover:text-[#b89558]"
            >
              Change
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-1">
            <p className="font-semibold text-[#1A1A1A]">{address.name}</p>
            <p>{address.phone}</p>
            <p>
              {address.line1}
              {address.line2 ? `, ${address.line2}` : ''}
            </p>
            <p>
              {address.city}, {address.state} - {address.pincode}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <span className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-[#C9A96E]" />
              Payment Method
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onBack}
              className="text-xs text-[#C9A96E] hover:text-[#b89558]"
            >
              Change
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-full ${
                paymentMethod === 'upi' ? 'bg-purple-50' : 'bg-green-50'
              }`}
            >
              {paymentMethod === 'upi' ? (
                <CreditCard className="h-4 w-4 text-purple-600" />
              ) : (
                <Banknote className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1A1A1A]">
                {paymentMethod === 'upi' ? 'UPI Payment' : 'Cash on Delivery'}
              </p>
              {paymentMethod === 'upi' && upiId && (
                <p className="text-xs text-gray-500">{upiId}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Items */}
      <Card className="border-gray-100">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">
            Order Items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-[#FAF8F5]">
                  <img
                    src={`/products/${item.product.images?.[0] || item.product.slug}.png`}
                    alt={item.product.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[#1A1A1A] line-clamp-1">
                    {item.product.name}
                  </p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card className="border-gray-100">
        <CardContent className="p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-medium text-[#1A1A1A]">
                ₹{subtotal.toLocaleString('en-IN')}
              </span>
            </div>
            {coupon && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">Discount</span>
                  <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                    {coupon.code}
                  </Badge>
                </div>
                <span className="font-medium text-green-600">
                  −₹{discount.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Shipping</span>
              <span className="flex items-center gap-1 font-medium text-green-600">
                <Truck className="h-3.5 w-3.5" />
                FREE
              </span>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between">
            <span className="text-base font-bold text-[#1A1A1A]">Total</span>
            <span className="text-xl font-bold text-[#C9A96E]">
              ₹{total.toLocaleString('en-IN')}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Place Order Button */}
      <Button
        onClick={onPlaceOrder}
        disabled={placing}
        className="w-full bg-[#C9A96E] hover:bg-[#b89558] text-white font-semibold h-12 text-sm"
      >
        {placing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Placing Order...
          </>
        ) : (
          <>
            <Lock className="mr-2 h-4 w-4" />
            Place Order — ₹{total.toLocaleString('en-IN')}
          </>
        )}
      </Button>

      <p className="text-center text-xs text-gray-400">
        By placing this order, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────
type CheckoutStep = 'address' | 'payment' | 'review';

export default function CheckoutPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const clearCart = useCartStore((s) => s.clearCart);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const token = useAuthStore((s) => s.token);

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('address');
  const [address, setAddress] = useState<AddressFormData & { saveAddress: boolean } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');
  const [upiId, setUpiId] = useState<string>('');
  const [placing, setPlacing] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('cart');
    }
  }, [items.length, navigate]);

  const handleAddressSet = (data: AddressFormData & { saveAddress: boolean }) => {
    setAddress(data);
    setCurrentStep('payment');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePaymentSet = (method: PaymentMethod, upi?: string) => {
    setPaymentMethod(method);
    setUpiId(upi || '');
    setCurrentStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlaceOrder = async () => {
    if (!address || !token) return;
    setPlacing(true);

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: items.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          address: {
            name: address.name,
            phone: address.phone,
            line1: address.line1,
            line2: address.line2 || null,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
          },
          paymentMethod,
          couponCode: coupon?.code || null,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        clearCart();
        toast.success('Order placed successfully!');
        navigate('order-confirmation', { orderId: data.id || data.orderId || '' });
      } else {
        const data = await res.json().catch(() => ({}));
        toast.error(data.error || 'Failed to place order. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  const steps: { step: number; label: string; icon: React.ElementType; key: CheckoutStep }[] = [
    { step: 1, label: 'Shipping', icon: MapPin, key: 'address' },
    { step: 2, label: 'Payment', icon: CreditCard, key: 'payment' },
    { step: 3, label: 'Review', icon: CheckCircle2, key: 'review' },
  ];

  const activeStepIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer text-gray-500 hover:text-[#C9A96E]"
              onClick={() => navigate('home')}
            >
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink
              className="cursor-pointer text-gray-500 hover:text-[#C9A96E]"
              onClick={() => navigate('cart')}
            >
              Cart
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-[#1A1A1A] font-semibold">Checkout</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Complete your order in just a few steps
        </p>
      </div>

      {/* Step Indicator */}
      <div className="mb-8 flex items-center gap-4 sm:gap-8">
        {steps.map((s, idx) => (
          <div key={s.key} className="flex items-center gap-3 sm:gap-4">
            <StepIndicator
              step={s.step}
              label={s.label}
              icon={s.icon}
              isActive={idx <= activeStepIndex}
            />
            {idx < steps.length - 1 && (
              <div
                className={`h-px w-6 sm:w-12 transition-colors ${
                  idx < activeStepIndex ? 'bg-[#C9A96E]' : 'bg-gray-200'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Main Steps */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-3"
        >
          {/* Back Button */}
          {currentStep !== 'address' && (
            <Button
              variant="ghost"
              onClick={() => {
                const prevStep =
                  currentStep === 'review'
                    ? 'payment'
                    : currentStep === 'payment'
                      ? 'address'
                      : 'address';
                setCurrentStep(prevStep);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="mb-4 text-sm text-gray-500 hover:text-[#1A1A1A]"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back
            </Button>
          )}

          {currentStep === 'address' && (
            <ShippingStep onAddressSet={handleAddressSet} />
          )}
          {currentStep === 'payment' && (
            <PaymentStep onPaymentSet={handlePaymentSet} />
          )}
          {currentStep === 'review' && address && (
            <OrderSummaryStep
              address={address}
              paymentMethod={paymentMethod}
              upiId={upiId}
              onPlaceOrder={handlePlaceOrder}
              onBack={() => {
                setCurrentStep('payment');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              placing={placing}
            />
          )}
        </motion.div>

        {/* Sidebar Order Summary */}
        <div className="lg:col-span-2">
          <Card className="border-gray-100 sticky top-24">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-gray-100">
                {items.map((item) => (
                  <div key={item.product.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-[#FAF8F5]">
                      <img
                        src={`/products/${item.product.images?.[0] || item.product.slug}.png`}
                        alt={item.product.name}
                        className="h-full w-full object-cover"
                      />
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 items-center justify-center rounded-full bg-[#C9A96E] p-0 text-[10px] text-white">
                        {item.quantity}
                      </Badge>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#1A1A1A] line-clamp-1">
                        {item.product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        ₹{item.product.price.toLocaleString('en-IN')} each
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-[#1A1A1A]">
                      ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                    </p>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">₹{useCartStore.getState().getSubtotal().toLocaleString('en-IN')}</span>
                </div>
                {coupon && (
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3 w-3 text-green-600" />
                      <span className="text-green-600">Discount</span>
                    </div>
                    <span className="font-medium text-green-600">
                      −₹{useCartStore.getState().getDiscount().toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="flex items-center gap-1 font-medium text-green-600">
                    <Truck className="h-3 w-3" />
                    FREE
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-[#1A1A1A]">Total</span>
                <span className="text-lg font-bold text-[#C9A96E]">
                  ₹{useCartStore.getState().getTotal().toLocaleString('en-IN')}
                </span>
              </div>

              {/* Security badges */}
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-gray-400">
                <div className="flex items-center gap-1">
                  <Lock className="h-3 w-3" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Truck className="h-3 w-3" />
                  <span>Free Shipping</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

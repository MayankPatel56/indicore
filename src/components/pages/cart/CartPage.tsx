'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  ArrowLeft,
  Tag,
  X,
  Truck,
  Shield,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
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
import { getImagePath } from '@/lib/utils';

// ─── Quantity Selector ────────────────────────────────────────────
function QuantitySelector({
  quantity,
  stock,
  onDecrease,
  onIncrease,
  onChange,
}: {
  quantity: number;
  stock: number;
  onDecrease: () => void;
  onIncrease: () => void;
  onChange: (val: number) => void;
}) {
  return (
    <div className="flex items-center gap-0">
      <button
        type="button"
        onClick={onDecrease}
        disabled={quantity <= 1}
        className="flex h-8 w-8 items-center justify-center rounded-l-md border border-r-0 border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Minus className="h-3 w-3" />
      </button>
      <input
        type="number"
        min={1}
        max={stock}
        value={quantity}
        onChange={(e) => {
          const val = parseInt(e.target.value, 10);
          if (!isNaN(val) && val >= 1 && val <= stock) onChange(val);
        }}
        className="h-8 w-12 border-y border-gray-200 text-center text-sm font-medium text-[#1A1A1A] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={onIncrease}
        disabled={quantity >= stock}
        className="flex h-8 w-8 items-center justify-center rounded-r-md border border-l-0 border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3 w-3" />
      </button>
    </div>
  );
}

// ─── Cart Item Row ────────────────────────────────────────────────
function CartItemRow({ item }: { item: { product: import('@/lib/types').Product; quantity: number } }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-4 rounded-lg border border-gray-100 bg-white p-3 sm:p-4"
    >
      {/* Thumbnail */}
      <div
        className="h-20 w-20 flex-shrink-0 cursor-pointer overflow-hidden rounded-md bg-[#FAF8F5] sm:h-24 sm:w-24"
        onClick={() => navigate('product-detail', { slug: item.product.slug })}
      >
        <img
          src={getImagePath(item.product.images?.[0])}
          alt={item.product.name}
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col justify-between">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3
              className="cursor-pointer text-sm font-semibold text-[#1A1A1A] hover:text-[#C9A96E] transition-colors line-clamp-2 sm:text-base"
              onClick={() => navigate('product-detail', { slug: item.product.slug })}
            >
              {item.product.name}
            </h3>
            <p className="mt-1 text-sm font-bold text-[#C9A96E]">
              ₹{item.product.price.toLocaleString('en-IN')}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              removeItem(item.product.id);
              toast.info('Item removed from cart');
            }}
            className="flex-shrink-0 rounded-md p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <QuantitySelector
            quantity={item.quantity}
            stock={item.product.stock}
            onDecrease={() => updateQuantity(item.product.id, item.quantity - 1)}
            onIncrease={() => updateQuantity(item.product.id, item.quantity + 1)}
            onChange={(val) => updateQuantity(item.product.id, val)}
          />
          <p className="text-sm font-bold text-[#1A1A1A] sm:text-base">
            ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Order Summary ────────────────────────────────────────────────
function OrderSummary() {
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const applyCoupon = useCartStore((s) => s.applyCoupon);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const getSubtotal = useCartStore((s) => s.getSubtotal);
  const getDiscount = useCartStore((s) => s.getDiscount);
  const getTotal = useCartStore((s) => s.getTotal);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const navigate = useNavigationStore((s) => s.navigate);

  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const total = getTotal();

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) {
      toast.error('Please enter a coupon code');
      return;
    }
    setCouponLoading(true);
    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      if (res.ok) {
        const data = await res.json();
        applyCoupon({ code: data.code, discount: data.discount, type: data.type });
        toast.success(`Coupon "${data.code}" applied! You save ₹${discount.toLocaleString('en-IN')}`);
      } else {
        const data = await res.json();
        toast.error(data.error || 'Invalid coupon code');
      }
    } catch {
      toast.error('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleProceed = () => {
    if (!isAuthenticated) {
      toast.info('Please log in to proceed to checkout');
      navigate('login');
    } else {
      navigate('checkout');
    }
  };

  return (
    <Card className="border-gray-100 sticky top-24">
      <CardContent className="p-5 sm:p-6">
        <h2 className="text-lg font-bold text-[#1A1A1A]">Order Summary</h2>

        {/* Price Breakdown */}
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Subtotal ({items.length} {items.length === 1 ? 'item' : 'items'})
            </span>
            <span className="font-medium text-[#1A1A1A]">
              ₹{subtotal.toLocaleString('en-IN')}
            </span>
          </div>

          {coupon && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-green-600">Discount</span>
                <Badge
                  variant="secondary"
                  className="bg-green-50 text-green-700 text-xs font-medium"
                >
                  {coupon.code}
                  <button
                    type="button"
                    onClick={() => {
                      removeCoupon();
                      toast.info('Coupon removed');
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              </div>
              <span className="font-medium text-green-600">
                −₹{getDiscount().toLocaleString('en-IN')}
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

        {/* Coupon Input */}
        {!coupon && (
          <div className="mt-5">
            <label className="mb-1.5 block text-xs font-medium text-gray-500">
              Coupon Code
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <Input
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Enter code"
                  className="pl-9 h-10 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleApplyCoupon();
                  }}
                />
              </div>
              <Button
                variant="outline"
                onClick={handleApplyCoupon}
                disabled={couponLoading}
                className="h-10 border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-white text-sm font-medium shrink-0"
              >
                {couponLoading ? 'Applying...' : 'Apply'}
              </Button>
            </div>
          </div>
        )}

        {/* Checkout Button */}
        <Button
          onClick={handleProceed}
          className="mt-5 w-full bg-[#C9A96E] hover:bg-[#b89558] text-white font-semibold h-11 text-sm"
        >
          <Shield className="mr-2 h-4 w-4" />
          Proceed to Checkout
        </Button>

        <p className="mt-3 text-center text-xs text-gray-400">
          Secure checkout powered by encrypted payment
        </p>
      </CardContent>
    </Card>
  );
}

// ─── Empty Cart ───────────────────────────────────────────────────
function EmptyCart() {
  const navigate = useNavigationStore((s) => s.navigate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-20 text-center"
    >
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[#FAF8F5]">
        <ShoppingBag className="h-10 w-10 text-gray-300" />
      </div>
      <h2 className="mt-6 text-xl font-bold text-[#1A1A1A]">
        Your cart is empty
      </h2>
      <p className="mt-2 max-w-sm text-sm text-gray-500">
        Looks like you haven&apos;t added any items to your cart yet. Explore our
        collection and find something you love.
      </p>
      <Button
        onClick={() => navigate('products')}
        className="mt-6 bg-[#C9A96E] hover:bg-[#b89558] text-white font-semibold px-8"
      >
        Start Shopping
      </Button>
    </motion.div>
  );
}

// ─── Main Cart Page ───────────────────────────────────────────────
export default function CartPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  if (items.length === 0) {
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
              <BreadcrumbPage className="text-[#1A1A1A]">Cart</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <EmptyCart />
      </div>
    );
  }

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
            <BreadcrumbPage className="text-[#1A1A1A] font-semibold">Cart</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Title & Continue Shopping */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => navigate('products')}
          className="text-sm text-[#C9A96E] hover:text-[#b89558] hidden sm:flex"
        >
          <ArrowLeft className="mr-1.5 h-4 w-4" />
          Continue Shopping
        </Button>
      </div>

      {/* Mobile Continue Shopping */}
      <Button
        variant="outline"
        onClick={() => navigate('products')}
        className="mt-4 w-full border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E]/5 text-sm sm:hidden"
      >
        <ArrowLeft className="mr-1.5 h-4 w-4" />
        Continue Shopping
      </Button>

      {/* Two-column layout */}
      <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start">
        {/* Cart Items */}
        <div className="flex-1">
          <div className="flex flex-col gap-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </AnimatePresence>
          </div>

          {/* Clear Cart */}
          <div className="mt-6 flex justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                clearCart();
                toast.info('Cart cleared');
              }}
              className="text-sm text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="mr-1.5 h-4 w-4" />
              Clear Cart
            </Button>
          </div>
        </div>

        {/* Order Summary Sidebar */}
        <div className="w-full lg:w-96">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}

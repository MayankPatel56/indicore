'use client';

import { useNavigationStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function OrderConfirmationPage() {
  const { params, navigate } = useNavigationStore();
  const orderId = params?.orderId;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <motion.div
        className="max-w-lg w-full text-center"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-green-100 p-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">
          Order Placed Successfully!
        </h1>

        <p className="text-muted-foreground mb-2 text-lg">
          Thank you for shopping with IndiCore Originals!
        </p>

        {orderId && (
          <p className="text-sm text-muted-foreground mb-8">
            Order ID: <span className="font-semibold text-[#1A1A1A]">{orderId}</span>
          </p>
        )}

        <div className="bg-cream/50 border border-border rounded-xl p-6 mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Package className="h-5 w-5 text-[#C9A96E]" />
            <h3 className="font-semibold text-[#1A1A1A]">What&apos;s Next?</h3>
          </div>
          <ul className="text-sm text-muted-foreground space-y-2 text-left">
            <li className="flex items-start gap-2">
              <span className="text-[#C9A96E] mt-0.5">•</span>
              You&apos;ll receive an order confirmation email shortly
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C9A96E] mt-0.5">•</span>
              Your order will be processed within 1-2 business days
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C9A96E] mt-0.5">•</span>
              Free shipping on all orders — no hidden charges!
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C9A96E] mt-0.5">•</span>
              Track your order status from your profile page
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => navigate('products')}
            className="bg-[#1A1A1A] hover:bg-[#2A2A2A] text-white px-6"
          >
            Continue Shopping
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('home')}
            className="border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E] hover:text-white px-6"
          >
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

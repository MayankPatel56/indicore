'use client';

import { useNavigationStore, useAuthStore } from '@/lib/store';
import { getImagePath } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, ArrowLeft, Clock, Truck, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-4 w-4" /> },
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: <Package className="h-4 w-4" /> },
  shipped: { label: 'Shipped', color: 'bg-purple-100 text-purple-800', icon: <Truck className="h-4 w-4" /> },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-4 w-4" /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: <XCircle className="h-4 w-4" /> },
};

export default function OrderTrackingPage() {
  const { params, navigate } = useNavigationStore();
  const { token, isAuthenticated } = useAuthStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const orderId = params?.orderId;

  useEffect(() => {
    if (!orderId || !token) {
      setLoading(false);
      return;
    }

    async function fetchOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setOrder(data.order || data);
        }
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    }

    fetchOrder();
  }, [orderId, token]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Please Log In</h2>
          <p className="text-muted-foreground mb-6">You need to be logged in to track orders.</p>
          <Button onClick={() => navigate('login')}>Login</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading order details...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-muted-foreground mb-6">We couldn&apos;t find this order.</p>
          <Button onClick={() => navigate('home')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="min-h-[60vh] px-4 py-8 max-w-3xl mx-auto">
      <Button
        variant="ghost"
        onClick={() => navigate('profile')}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Profile
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <CardTitle className="text-xl">Order #{order.orderNumber || order.id?.slice(0, 8)}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </p>
              </div>
              <Badge className={status.color}>
                {status.icon}
                <span className="ml-1">{status.label}</span>
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Steps */}
            <div className="flex items-center justify-between mb-8 mt-4 px-4">
              {['pending', 'confirmed', 'shipped', 'delivered'].map((step, i) => {
                const stepStatus = statusConfig[step];
                const stepIndex = ['pending', 'confirmed', 'shipped', 'delivered'].indexOf(order.status);
                const isComplete = i <= stepIndex && order.status !== 'cancelled';
                const isCurrent = step === order.status;

                return (
                  <div key={step} className="flex flex-col items-center flex-1">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
                        isComplete
                          ? 'bg-[#C9A96E] text-white'
                          : 'bg-gray-200 text-gray-400'
                      } ${isCurrent ? 'ring-4 ring-[#C9A96E]/20' : ''}`}
                    >
                      {stepStatus.icon}
                    </div>
                    <span className={`text-xs font-medium ${isComplete ? 'text-[#1A1A1A]' : 'text-gray-400'}`}>
                      {stepStatus.label}
                    </span>
                    {i < 3 && (
                      <div className={`hidden sm:block w-full h-0.5 mt-[-1.25rem] ${isComplete ? 'bg-[#C9A96E]' : 'bg-gray-200'}`} />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Order Items */}
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1A1A1A]">Order Items</h3>
              {(order.items || []).map((item: any) => (
                <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <img
                    src={getImagePath(item.productImage)}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.productName}</p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-[#1A1A1A]">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="mt-6 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>₹{order.subtotal?.toLocaleString('en-IN')}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discount?.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Shipping</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total</span>
                <span className="text-[#C9A96E]">₹{order.total?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {order.paymentMethod && (
              <div className="mt-4 text-sm text-muted-foreground">
                Payment: <span className="font-medium text-[#1A1A1A]">{order.paymentMethod.toUpperCase()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

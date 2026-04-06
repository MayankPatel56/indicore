'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/lib/store';
import type { Order, OrderItem } from '@/lib/types';

type OrderStatus = Order['status'];

const statusFilters: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const fallbackOrders: (Order & { customerName?: string; customerEmail?: string })[] = [
  {
    id: '1', orderNumber: 'LC-1001', userId: 'u1', status: 'delivered', total: 4999, subtotal: 4999,
    discount: 0, shipping: 0, addressSnapshot: '{}', paymentMethod: 'upi', customerName: 'Rahul Sharma',
    customerEmail: 'rahul@example.com',
    items: [
      { id: 'i1', orderId: '1', productId: 'p1', productName: 'Aries Zodiac Chain', productImage: '/products/zodiac-aries.png', quantity: 1, price: 2499 },
      { id: 'i2', orderId: '1', productId: 'p4', productName: 'Layered Gold Chain', productImage: '/products/stylish-layered.png', quantity: 1, price: 2500 },
    ],
    createdAt: '2025-01-15T10:30:00Z', updatedAt: '2025-01-20T14:00:00Z',
  },
  {
    id: '2', orderNumber: 'LC-1002', userId: 'u2', status: 'shipped', total: 3499, subtotal: 3499,
    discount: 0, shipping: 0, addressSnapshot: '{}', paymentMethod: 'cod', customerName: 'Priya Patel',
    customerEmail: 'priya@example.com',
    items: [
      { id: 'i3', orderId: '2', productId: 'p3', productName: 'Custom Name Chain', productImage: '/products/custom-name.png', quantity: 1, price: 3499 },
    ],
    createdAt: '2025-01-18T09:00:00Z', updatedAt: '2025-01-19T11:00:00Z',
  },
  {
    id: '3', orderNumber: 'LC-1003', userId: 'u3', status: 'pending', total: 7998, subtotal: 7998,
    discount: 0, shipping: 0, addressSnapshot: '{}', paymentMethod: 'upi', customerName: 'Ankit Gupta',
    customerEmail: 'ankit@example.com',
    items: [
      { id: 'i4', orderId: '3', productId: 'p1', productName: 'Aries Zodiac Chain', productImage: '/products/zodiac-aries.png', quantity: 2, price: 2499 },
      { id: 'i5', orderId: '3', productId: 'p2', productName: 'Cancer Zodiac Chain', productImage: '/products/zodiac-cancer.png', quantity: 1, price: 2499 },
    ],
    createdAt: '2025-01-20T14:20:00Z', updatedAt: '2025-01-20T14:20:00Z',
  },
  {
    id: '4', orderNumber: 'LC-1004', userId: 'u4', status: 'confirmed', total: 2499, subtotal: 2499,
    discount: 0, shipping: 0, addressSnapshot: '{}', paymentMethod: 'upi', customerName: 'Sneha Reddy',
    customerEmail: 'sneha@example.com',
    items: [
      { id: 'i6', orderId: '4', productId: 'p2', productName: 'Cancer Zodiac Chain', productImage: '/products/zodiac-cancer.png', quantity: 1, price: 2499 },
    ],
    createdAt: '2025-01-21T16:45:00Z', updatedAt: '2025-01-21T17:00:00Z',
  },
  {
    id: '5', orderNumber: 'LC-1005', userId: 'u5', status: 'cancelled', total: 5999, subtotal: 5999,
    discount: 0, shipping: 0, addressSnapshot: '{}', paymentMethod: 'cod', customerName: 'Vikram Singh',
    customerEmail: 'vikram@example.com',
    items: [
      { id: 'i7', orderId: '5', productId: 'p4', productName: 'Layered Gold Chain', productImage: '/products/stylish-layered.png', quantity: 1, price: 4999 },
      { id: 'i8', orderId: '5', productId: 'p5', productName: 'Leo Zodiac Chain', productImage: '/products/zodiac-leo.png', quantity: 1, price: 2499 },
    ],
    createdAt: '2025-01-22T08:10:00Z', updatedAt: '2025-01-23T09:00:00Z',
  },
  {
    id: '6', orderNumber: 'LC-1006', userId: 'u6', status: 'shipped', total: 9996, subtotal: 9996,
    discount: 0, shipping: 0, addressSnapshot: '{}', paymentMethod: 'upi', customerName: 'Meera Joshi',
    customerEmail: 'meera@example.com',
    items: [
      { id: 'i9', orderId: '6', productId: 'p3', productName: 'Custom Name Chain', productImage: '/products/custom-name.png', quantity: 2, price: 3499 },
    ],
    createdAt: '2025-01-23T11:30:00Z', updatedAt: '2025-01-24T08:00:00Z',
  },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<(Order & { customerName?: string; customerEmail?: string })[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((s) => s.token);

  const fetchOrders = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/orders', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setOrders(data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const displayOrders = orders.length > 0 ? orders : fallbackOrders;

  const filtered = displayOrders.filter((o) => {
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchesSearch =
      search === '' ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName || '').toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingId(orderId);
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ status: newStatus }),
      });
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, updatedAt: new Date().toISOString() }
            : o
        )
      );
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by order # or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((f) => (
              <SelectItem key={f.value} value={f.value}>
                {f.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-8 pl-4" />
                  <TableHead>Order #</TableHead>
                  <TableHead className="hidden sm:table-cell">Customer</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden lg:table-cell">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="hidden sm:table-cell">Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 9 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-5 w-14 animate-pulse rounded bg-muted" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                      No orders found
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((order) => (
                    <>
                      <TableRow
                        key={order.id}
                        className="cursor-pointer"
                        onClick={() =>
                          setExpandedRow(expandedRow === order.id ? null : order.id)
                        }
                      >
                        <TableCell className="pl-4">
                          {order.items.length > 0 && (
                            <button className="text-muted-foreground">
                              {expandedRow === order.id ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </button>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-charcoal">
                          {order.orderNumber}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {order.customerName || 'Customer'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-muted-foreground">
                          {order.customerEmail || '—'}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground">
                          {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ₹{order.total.toLocaleString()}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge variant="outline" className="text-xs capitalize border-muted">
                            {order.paymentMethod}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {updatingId === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin text-gold" />
                          ) : (
                            <Select
                              value={order.status}
                              onValueChange={(v) => handleStatusChange(order.id, v as OrderStatus)}
                            >
                              <SelectTrigger
                                className="w-28 h-7 text-xs border-0"
                              >
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {statusFilters
                                  .filter((f) => f.value !== 'all')
                                  .map((f) => (
                                    <SelectItem key={f.value} value={f.value}>
                                      {f.label}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                          )}
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-muted-foreground">
                          {formatDate(order.createdAt)}
                        </TableCell>
                      </TableRow>

                      {/* Expanded Row */}
                      {expandedRow === order.id && order.items.length > 0 && (
                        <TableRow key={`${order.id}-expanded`}>
                          <TableCell colSpan={9} className="bg-muted/30 px-4 py-4">
                            <div className="ml-8 space-y-2">
                              <p className="text-sm font-medium text-charcoal mb-3">Order Items</p>
                              <div className="grid gap-2">
                                {order.items.map((item) => (
                                  <div
                                    key={item.id}
                                    className="flex items-center gap-3 rounded-lg border bg-white p-3"
                                  >
                                    <div className="h-12 w-12 rounded-md bg-muted overflow-hidden shrink-0">
                                      {item.productImage && (
                                        <img
                                          src={item.productImage}
                                          alt={item.productName}
                                          className="h-full w-full object-cover"
                                        />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm font-medium text-charcoal truncate">
                                        {item.productName}
                                      </p>
                                      <p className="text-xs text-muted-foreground">
                                        Qty: {item.quantity}
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium">
                                      ₹{(item.price * item.quantity).toLocaleString()}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

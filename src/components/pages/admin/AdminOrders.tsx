'use client';

import { Fragment, useEffect, useState, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, Loader2, MapPin } from 'lucide-react';
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
import type { Order } from '@/lib/types';

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

/* ---------- Shipping Address sub-component ---------- */

interface AddressSnapshot {
  name?: string;
  phone?: string;
  line1?: string;
  line2?: string | null;
  city?: string;
  state?: string;
  pincode?: string;
}

function ShippingAddress({ snapshot }: { snapshot: string }) {
  let addr: AddressSnapshot = {};
  try {
    addr = JSON.parse(snapshot);
  } catch {
    // invalid JSON
  }

  if (!addr.line1 && !addr.name) {
    return <p className="text-sm text-muted-foreground">No address on file</p>;
  }

  return (
    <div className="rounded-lg border bg-white p-3 text-sm space-y-1">
      {addr.name && <p className="font-medium text-charcoal">{addr.name}</p>}
      {addr.phone && <p className="text-muted-foreground">{addr.phone}</p>}
      <p className="text-muted-foreground leading-relaxed">
        {addr.line1}
        {addr.line2 ? `, ${addr.line2}` : ''}
      </p>
      <p className="text-muted-foreground">
        {[addr.city, addr.state, addr.pincode].filter(Boolean).join(', ')}
      </p>
    </div>
  );
}

/* ---------- Main Component ---------- */

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
        if (Array.isArray(data.orders)) {
          setOrders(data.orders.map((o: Record<string, unknown>) => ({
            ...o,
            customerName: (o.user as Record<string, string> | undefined)?.name || 'Customer',
            customerEmail: (o.user as Record<string, string> | undefined)?.email || '—',
          })));
        }
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

  const filtered = orders.filter((o) => {
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
                    <Fragment key={order.id}>
                      <TableRow
                        className="cursor-pointer"
                        onClick={() =>
                          setExpandedRow(expandedRow === order.id ? null : order.id)
                        }
                      >
                        <TableCell className="pl-4">
                          <button className="text-muted-foreground">
                            {expandedRow === order.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
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
                              <SelectTrigger className="w-28 h-7 text-xs border-0">
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

                      {/* Expanded Row — Address + Items */}
                      {expandedRow === order.id && (
                        <TableRow>
                          <TableCell colSpan={9} className="bg-muted/30 px-4 py-4">
                            <div className="ml-8 grid gap-4 sm:grid-cols-2">
                              {/* Shipping Address */}
                              <div className="space-y-2">
                                <p className="flex items-center gap-2 text-sm font-medium text-charcoal">
                                  <MapPin className="h-4 w-4 text-gold" />
                                  Shipping Address
                                </p>
                                <ShippingAddress snapshot={order.addressSnapshot} />
                              </div>

                              {/* Order Items */}
                              <div className="space-y-2">
                                <p className="text-sm font-medium text-charcoal">
                                  Order Items ({order.items.length})
                                </p>
                                {order.items.length > 0 ? (
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
                                ) : (
                                  <p className="text-sm text-muted-foreground">No items</p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
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

'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuthStore } from '@/lib/store';
import type { User } from '@/lib/types';

interface UserWithOrderCount extends User {
  ordersCount: number;
}

const fallbackUsers: UserWithOrderCount[] = [
  { id: 'u1', email: 'rahul@example.com', name: 'Rahul Sharma', phone: '+91 98765 43210', role: 'customer', createdAt: '2024-12-15T00:00:00Z', ordersCount: 3 },
  { id: 'u2', email: 'priya@example.com', name: 'Priya Patel', phone: '+91 87654 32109', role: 'customer', createdAt: '2024-12-20T00:00:00Z', ordersCount: 5 },
  { id: 'u3', email: 'ankit@example.com', name: 'Ankit Gupta', phone: '+91 76543 21098', role: 'customer', createdAt: '2025-01-02T00:00:00Z', ordersCount: 2 },
  { id: 'u4', email: 'sneha@example.com', name: 'Sneha Reddy', phone: '+91 65432 10987', role: 'customer', createdAt: '2025-01-08T00:00:00Z', ordersCount: 1 },
  { id: 'u5', email: 'vikram@example.com', name: 'Vikram Singh', phone: '+91 54321 09876', role: 'customer', createdAt: '2025-01-10T00:00:00Z', ordersCount: 4 },
  { id: 'u6', email: 'meera@example.com', name: 'Meera Joshi', phone: '+91 43210 98765', role: 'customer', createdAt: '2025-01-15T00:00:00Z', ordersCount: 2 },
  { id: 'admin', email: 'admin@indicoreoriginals.com', name: 'Admin', phone: null, role: 'admin', createdAt: '2024-12-01T00:00:00Z', ordersCount: 0 },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<UserWithOrderCount[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const token = useAuthStore((s) => s.token);

  const fetchUsers = useCallback(async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/admin/users', { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      }
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const displayUsers = users.length > 0 ? users : fallbackUsers;

  const filtered = displayUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-4">Name</TableHead>
                <TableHead className="hidden sm:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="hidden sm:table-cell text-right">Orders</TableHead>
                <TableHead className="hidden sm:table-cell">Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="pl-4 font-medium text-charcoal">
                      {user.name}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground">
                      {user.phone || '—'}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          user.role === 'admin'
                            ? 'bg-gold/15 text-gold border-0'
                            : 'border-0'
                        }
                      >
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right font-medium">
                      {user.ordersCount ?? 0}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {formatDate(user.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

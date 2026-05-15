'use client';

import { useEffect, useState } from 'react';
import { Trash2, Star, Search, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAuthStore } from '@/lib/store';
import type { Review, Product } from '@/lib/types';

interface ReviewWithProduct extends Review {
  productName?: string;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<ReviewWithProduct[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<ReviewWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const token = useAuthStore((s) => s.user?.id);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/admin/reviews', {
        method: 'GET',
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews || []);
        setFilteredReviews(data.reviews || []);
      } else if (res.status === 401) {
        toast.error('Unauthorized. Please login again.');
      } else {
        toast.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Error loading reviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    const filtered = reviews.filter((review) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (review.productName?.toLowerCase().includes(searchLower) || false) ||
        review.userName.toLowerCase().includes(searchLower) ||
        review.comment.toLowerCase().includes(searchLower)
      );
    });
    setFilteredReviews(filtered);
  }, [searchTerm, reviews]);

  const handleDeleteReview = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setReviews((prev) => prev.filter((r) => r.id !== id));
        toast.success('Review deleted successfully');
      } else {
        toast.error('Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      toast.error('Error deleting review');
    } finally {
      setDeleteDialogOpen(false);
      setDeletingId(null);
    }
  };

  const StarRating = ({ rating }: { rating: number }) => (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating ? 'fill-[#B87333] text-[#B87333]' : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Product Reviews</CardTitle>
          <CardDescription>Manage and moderate product reviews</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Product Reviews</CardTitle>
            <CardDescription>Manage and moderate product reviews</CardDescription>
          </div>
          <Badge variant="outline">{filteredReviews.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by product, reviewer name, or comment..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Reviews Table */}
        {filteredReviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No reviews found</p>
          </div>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#FAF8F5]">
                  <TableHead>Product</TableHead>
                  <TableHead>Reviewer</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id} className="hover:bg-[#FAF8F5]">
                    <TableCell className="font-medium text-[#B87333] text-sm">
                      {review.productName || 'Unknown Product'}
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p className="font-medium text-[#1A1A1A]">{review.userName}</p>
                        {review.userId && (
                          <p className="text-xs text-gray-500">{review.userId}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <StarRating rating={review.rating} />
                    </TableCell>
                    <TableCell className="text-sm max-w-xs">
                      <p className="line-clamp-2 text-gray-700">{review.comment}</p>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setDeletingId(review.id);
                          setDeleteDialogOpen(true);
                        }}
                        disabled={deletingId === review.id}
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      >
                        {deletingId === review.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Review</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this review? This action cannot be undone.
          </AlertDialogDescription>
          <div className="flex justify-end gap-3">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && handleDeleteReview(deletingId)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}

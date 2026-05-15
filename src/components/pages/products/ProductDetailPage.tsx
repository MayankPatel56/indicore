'use client';

import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Truck,
  Minus,
  Plus,
  ShoppingBag,
  ChevronRight,
  ChevronLeft,
  AlertCircle,
  Heart,
  Share2,
  ThumbsUp,
  User as UserIcon,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useNavigationStore, useCartStore, useAuthStore } from '@/lib/store';
import { getImagePath } from '@/lib/utils';
import type { Product, Review } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'h-5 w-5' : size === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${sizeClass} ${
            i < Math.round(rating)
              ? 'fill-[#B87333] text-[#B87333]'
              : 'text-gray-200'
          }`}
        />
      ))}
    </div>
  );
}

function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    'electronic-accessories': 'Electronic accessories',
    fitness: 'Fitness & Wellness',
    'home-essentials': 'Home Essentials',
  };
  return map[category] || category;
}

function getDiscountPercent(price: number, comparePrice?: number | null) {
  if (!comparePrice || comparePrice <= price) return 0;
  return Math.round(((comparePrice - price) / comparePrice) * 100);
}

// ─── Skeleton Loading ─────────────────────────────────────────────────
function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-4 w-48 mb-8" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="flex gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 w-20 rounded-lg" />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    </div>
  );
}

// ─── Write Review Form ────────────────────────────────────────────────
function WriteReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0 || !comment.trim()) {
      toast.error('Please provide a rating and comment');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, userName: name, comment }),
      });
      if (res.ok) {
        toast.success('Review submitted! Thank you.');
        setRating(0);
        setName('');
        setComment('');
      } else {
        toast.error('Failed to submit review');
      }
    } catch {
      toast.error('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-8 rounded-xl border bg-white p-6">
      <h3 className="text-lg font-semibold text-[#1A1A1A]">Write a Review</h3>
      <div className="mt-4 space-y-4">
        {/* Star selector */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">
            Your Rating
          </label>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <button
                key={i}
                type="button"
                onMouseEnter={() => setHoverRating(i + 1)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(i + 1)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`h-6 w-6 ${
                    i < (hoverRating || rating)
                      ? 'fill-[#B87333] text-[#B87333]'
                      : 'text-gray-200'
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">
            Your Name
          </label>
          <Input
            placeholder="Enter your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Comment */}
        <div>
          <label className="text-sm font-medium text-gray-600 block mb-2">
            Your Review
          </label>
          <Textarea
            placeholder="Share your experience with this product..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            className="resize-none"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-[#B87333] hover:bg-[#9E6329] text-white"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
      </div>
    </div>
  );
}

// ─── Review Item ──────────────────────────────────────────────────────
function ReviewItem({ review }: { review: Review }) {
  const dateStr = new Date(review.createdAt).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="flex gap-4 py-5 border-b last:border-b-0">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#B87333]/10 text-sm font-bold text-[#B87333]">
        {review.userName?.charAt(0)?.toUpperCase() || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-[#1A1A1A]">
              {review.userName || 'Anonymous'}
            </p>
            <p className="text-xs text-gray-400">{dateStr}</p>
          </div>
          <StarRating rating={review.rating} />
        </div>
        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {review.comment}
        </p>
      </div>
    </div>
  );
}

// ─── Related Product Card ─────────────────────────────────────────────
function RelatedProductCard({ product }: { product: Product }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const addToCart = useCartStore((s) => s.addItem);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group min-w-[220px] max-w-[280px] shrink-0 cursor-pointer overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={() => {
        navigate('product-detail', { slug: product.slug });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
    >
      <div className="relative aspect-square overflow-hidden bg-[#FAF8F5]">
        <img
          src={getImagePath(product.images?.[0])}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {product.comparePrice && (
          <span className="absolute top-3 left-3 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
            {getDiscountPercent(product.price, product.comparePrice)}% OFF
          </span>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-sm font-semibold text-[#1A1A1A] line-clamp-1">
          {product.name}
        </h4>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-bold text-[#B87333]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.comparePrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{product.comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
            toast.success(`${product.name} added to cart!`);
          }}
          className="mt-3 w-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs"
          size="sm"
        >
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
          Add to Cart
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main ProductDetailPage ───────────────────────────────────────────
export default function ProductDetailPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const params = useNavigationStore((s) => s.params);
  const addToCart = useCartStore((s) => s.addItem);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);

  const slug = params.slug;

  // Product state
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Quantity selector
  const [quantity, setQuantity] = useState(1);

  // Image gallery
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Related products
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

  // Fetch product
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function fetchProduct() {
      setLoading(true);
      setError(null);
      setQuantity(1);
      setSelectedImageIndex(0);
      try {
        // Try fetching by slug first
        let res = await fetch(`/api/products?slug=${encodeURIComponent(slug)}`);
        if (!res.ok) {
          // Fallback: fetch all and filter
          res = await fetch('/api/products');
        }
        if (!res.ok) throw new Error('Product not found');
        const data = await res.json();
        const items = Array.isArray(data) ? data : data.products ?? [];
        const found = items.find(
          (p: Product) => p.slug === slug || p.id === slug
        );
        if (!found && items.length > 0) throw new Error('Product not found');
        if (!cancelled) {
          setProduct(found || items[0] || null);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load product');
          setProduct(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProduct();
    return () => { cancelled = true; };
  }, [slug]);

  // Fetch reviews
  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    async function fetchReviews() {
      setReviewsLoading(true);
      try {
        const res = await fetch(`/api/products/${product.id}/reviews`);
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setReviews(Array.isArray(data) ? data : data.reviews ?? []);
          }
        } else {
          // Use sample reviews
          if (!cancelled) {
            setReviews(SAMPLE_REVIEWS);
          }
        }
      } catch {
        if (!cancelled) setReviews(SAMPLE_REVIEWS);
      } finally {
        if (!cancelled) setReviewsLoading(false);
      }
    }
    fetchReviews();
    return () => { cancelled = true; };
  }, [product?.id]);

  // Fetch related products
  useEffect(() => {
    if (!product?.category) return;
    let cancelled = false;
    async function fetchRelated() {
      try {
        const res = await fetch(
          `/api/products?category=${product.category}&limit=4`
        );
        if (res.ok) {
          const data = await res.json();
          const items = Array.isArray(data) ? data : data.products ?? [];
          if (!cancelled) {
            setRelatedProducts(
              items.filter((p: Product) => p.id !== product.id).slice(0, 4)
            );
          }
        }
      } catch {
        // Silently fail
      }
    }
    fetchRelated();
    return () => { cancelled = true; };
  }, [product?.category, product?.id]);

  // Image zoom handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPosition({ x, y });
  };

  // Add to cart handler
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    toast.success(`${product.name} added to cart!`, {
      description: `Quantity: ${quantity}`,
    });
  };

  // Buy now handler
  const handleBuyNow = () => {
    if (!product) return;
    addToCart(product, quantity);
    navigate('checkout');
  };

  // ─── Loading state ─────────────────────────────────────────────────
  if (loading) return <DetailSkeleton />;

  // ─── Error state ───────────────────────────────────────────────────
  if (error || !product) {
    return (
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-red-50">
          <AlertCircle className="h-8 w-8 text-red-400" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-[#1A1A1A]">
          Product Not Found
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Button
          onClick={() => navigate('products')}
          className="mt-6 bg-[#B87333] hover:bg-[#9E6329] text-white"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Shop
        </Button>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [`${product.slug}.png`];
  const discount = getDiscountPercent(product.price, product.comparePrice);
  const displayReviews = reviews.length > 0 ? reviews : SAMPLE_REVIEWS;
  const avgRating =
    displayReviews.length > 0
      ? displayReviews.reduce((sum, r) => sum + r.rating, 0) / displayReviews.length
      : product.rating;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white"
    >
      {/* ── Breadcrumb ──────────────────────────────────────────────── */}
      <div className="bg-[#FAF8F5] border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="text-gray-500 hover:text-[#B87333] cursor-pointer text-sm"
                  onClick={() => navigate('home')}
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink
                  className="text-gray-500 hover:text-[#B87333] cursor-pointer text-sm"
                  onClick={() => navigate('products')}
                >
                  Shop
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm text-[#1A1A1A] font-medium truncate max-w-[200px] sm:max-w-[300px]">
                  {product.name}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* ── Main Content: Image + Info ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* ─── Left: Image Gallery ──────────────────────────────── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              ref={imageRef}
              className="relative aspect-square overflow-hidden rounded-xl bg-[#FAF8F5] cursor-zoom-in"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={getImagePath(images[selectedImageIndex])}
                alt={product.name}
                className={`h-full w-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? { transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%` }
                    : undefined
                }
              />
              {/* Sale badge */}
              {discount > 0 && (
                <span className="absolute top-4 left-4 rounded-full bg-red-500 px-3 py-1 text-sm font-bold text-white">
                  {discount}% OFF
                </span>
              )}
            </div>

            {/* Thumbnail row */}
            <div className="flex gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`shrink-0 h-20 w-20 rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-[#B87333] shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={getImagePath(img)}
                    alt={`${product.name} view ${idx + 1}`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* ─── Right: Product Info ───────────────────────────────── */}
          <div className="space-y-5">
            {/* Category badge */}
            <Badge className="bg-[#B87333]/10 text-[#B87333] hover:bg-[#B87333]/15 text-xs font-medium border-0">
              {getCategoryLabel(product.category)}
            </Badge>

            {/* Product name */}
            <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl lg:text-4xl">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <StarRating rating={product.rating} size="md" />
              <span className="text-sm text-gray-500">
                {product.rating.toFixed(1)} ({product.reviewCount} reviews)
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-[#B87333]">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.comparePrice && (
                <>
                  <span className="text-lg text-red-400 line-through">
                    ₹{product.comparePrice.toLocaleString('en-IN')}
                  </span>
                  <Badge className="bg-red-500 text-white text-xs border-0">
                    Save ₹{(product.comparePrice - product.price).toLocaleString('en-IN')}
                  </Badge>
                </>
              )}
            </div>

            {/* Free shipping */}
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Truck className="h-4 w-4" />
              <span className="font-medium">Free Shipping</span>
              <span className="text-gray-400">on all orders</span>
            </div>

            {/* Stock status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-green-600">
                    In Stock
                  </span>
                  {product.stock < 5 && (
                    <span className="text-xs text-amber-500 font-medium">
                      — Only {product.stock} left!
                    </span>
                  )}
                </>
              ) : (
                <>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                  <span className="text-sm font-medium text-red-500">
                    Out of Stock
                  </span>
                </>
              )}
            </div>

            <Separator />

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            <Separator />

            {/* Quantity selector */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-[#1A1A1A]">Quantity</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-12 text-center text-sm font-semibold text-[#1A1A1A]">
                  {quantity}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  onClick={() => setQuantity((q) => Math.min(product.stock || 99, q + 1))}
                  disabled={quantity >= (product.stock || 99)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-[#1A1A1A] hover:bg-[#333] text-white h-12 text-sm font-semibold disabled:opacity-50"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              <Button
                onClick={handleBuyNow}
                disabled={product.stock === 0}
                className="flex-1 bg-[#B87333] hover:bg-[#9E6329] text-white h-12 text-sm font-semibold disabled:opacity-50"
              >
                Buy Now
              </Button>
            </div>

            {/* Wishlist & Share */}
            <div className="flex items-center gap-3 pt-1">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-red-500">
                <Heart className="mr-1.5 h-4 w-4" />
                Add to Wishlist
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-[#B87333]">
                <Share2 className="mr-1.5 h-4 w-4" />
                Share
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 pt-4">
              {[
                { icon: Truck, label: 'Free Shipping', desc: 'Across India' },
                { icon: Star, label: 'Premium Quality', desc: 'Certified materials' },
                { icon: ThumbsUp, label: 'Easy Returns', desc: '7-day policy' },
                { icon: UserIcon, label: 'Support', desc: '24/7 assistance' },
              ].map((feat) => (
                <div key={feat.label} className="flex items-start gap-3 rounded-lg bg-[#FAF8F5] p-3">
                  <feat.icon className="h-5 w-5 text-[#B87333] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-[#1A1A1A]">{feat.label}</p>
                    <p className="text-[10px] text-gray-500">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Description & Reviews Tabs ───────────────────────────── */}
        <div className="mt-12 sm:mt-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#B87333] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-gray-500 data-[state=active]:text-[#B87333] px-4 pb-3"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-[#B87333] data-[state=active]:bg-transparent data-[state=active]:shadow-none text-sm font-medium text-gray-500 data-[state=active]:text-[#B87333] px-4 pb-3"
              >
                Reviews ({displayReviews.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="description" className="pt-6">
              <div className="max-w-3xl">
                <h3 className="text-lg font-semibold text-[#1A1A1A] mb-3">
                  About this product
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {product.description}
                </p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">
                      Specifications
                    </h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex justify-between">
                        <span className="text-gray-400">Category</span>
                        <span className="font-medium">{getCategoryLabel(product.category)}</span>
                      </li>
                      <li className="flex justify-between">
                        <span className="text-gray-400">Availability</span>
                        <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h4 className="text-sm font-semibold text-[#1A1A1A] mb-2">
                      Why Choose IndiCore Originals?
                    </h4>
                    <ul className="space-y-1.5 text-sm text-gray-600">
                      <li>• Premium quality products</li>
                      <li>• Rooted in Indian heritage</li>
                      <li>• Free shipping across India</li>
                      <li>• 7-day easy returns</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="pt-6">
              <div className="max-w-3xl">
                {/* Rating summary */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 mb-8 rounded-xl border bg-[#FAF8F5] p-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-[#1A1A1A]">
                      {avgRating.toFixed(1)}
                    </p>
                    <StarRating rating={avgRating} size="md" />
                    <p className="mt-1 text-xs text-gray-500">
                      {displayReviews.length} reviews
                    </p>
                  </div>
                  <div className="flex-1 space-y-2 w-full">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = displayReviews.filter(
                        (r) => Math.round(r.rating) === star
                      ).length;
                      const pct =
                        displayReviews.length > 0
                          ? (count / displayReviews.length) * 100
                          : 0;
                      return (
                        <div key={star} className="flex items-center gap-2 text-xs">
                          <span className="w-6 text-gray-500">{star}</span>
                          <Star className="h-3 w-3 fill-[#B87333] text-[#B87333]" />
                          <div className="flex-1 h-2 rounded-full bg-gray-200 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-[#B87333] transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-gray-400">
                            {count}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reviews list */}
                <div className="space-y-0">
                  {displayReviews.map((review) => (
                    <ReviewItem key={review.id} review={review} />
                  ))}
                </div>

                {/* Write a review form */}
                <WriteReviewForm productId={product.id} />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* ── Related Products ─────────────────────────────────────── */}
        {relatedProducts.length > 0 && (
          <div className="mt-12 sm:mt-16 pb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-[#1A1A1A] sm:text-2xl">
                  You May Also Like
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Similar products from the {getCategoryLabel(product.category)} collection
                </p>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('products', { category: product.category })}
                className="text-[#B87333] hover:text-[#b89558] text-sm font-medium hidden sm:flex"
              >
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {relatedProducts.map((p) => (
                <RelatedProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Sample Reviews ───────────────────────────────────────────────────
const SAMPLE_REVIEWS: Review[] = [
  {
    id: 'sample-1',
    productId: 'sample',
    userName: 'Priya Sharma',
    rating: 5,
    comment:
      'Absolutely love this product! The quality is exceptional and it works even better than expected. IndiCore Originals has become my go-to brand for premium products.',
    createdAt: '2024-11-15T10:30:00Z',
  },
  {
    id: 'sample-2',
    productId: 'sample',
    userName: 'Ananya Patel',
    rating: 4,
    comment:
      'Great quality and fast delivery. The product feels premium and well-built. Only giving 4 stars because the packaging could be slightly better.',
    createdAt: '2024-11-10T08:15:00Z',
  },
  {
    id: 'sample-3',
    productId: 'sample',
    userName: 'Kavya Reddy',
    rating: 5,
    comment:
      'This was a gift for my sister and she absolutely loved it! The design is beautiful and the quality is impressive for the price. Highly recommended!',
    createdAt: '2024-10-28T14:45:00Z',
  },
  {
    id: 'sample-4',
    productId: 'sample',
    userName: 'Meera Joshi',
    rating: 4,
    comment:
      'Excellent design and great quality. Looks exactly like the pictures. Delivery was quick too. Very happy with my purchase!',
    createdAt: '2024-10-20T09:00:00Z',
  },
];

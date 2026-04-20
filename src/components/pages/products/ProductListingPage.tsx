'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  SlidersHorizontal,
  X,
  ShoppingBag,
  Star,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  PackageX,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { useNavigationStore, useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';

// ─── Helpers ──────────────────────────────────────────────────────────
function getCategoryLabel(category: string) {
  const map: Record<string, string> = {
    'portable-fans': 'Portable Fans',
    fitness: 'Fitness & Wellness',
    'home-essentials': 'Home Essentials',
  };
  return map[category] || category;
}

// ─── Constants ────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: 'All', value: '' },
  { label: 'Portable Fans', value: 'portable-fans' },
  { label: 'Fitness & Wellness', value: 'fitness' },
  { label: 'Home Essentials', value: 'home-essentials' },
];

const SORT_OPTIONS = [
  { label: 'Popularity', value: 'popularity' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Newest', value: 'newest' },
];

const PRODUCTS_PER_PAGE = 12;

// ─── Skeletons ────────────────────────────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div className="group overflow-hidden rounded-xl border bg-white">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full mt-2" />
      </div>
    </div>
  );
}

// ─── Product Card (matches homepage design) ───────────────────────────
function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const addToCart = useCartStore((s) => s.addItem);

  const categoryLabel = getCategoryLabel(product.category);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
      className="group cursor-pointer overflow-hidden rounded-xl border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={() => navigate('product-detail', { slug: product.slug })}
    >
      <div className="relative aspect-square overflow-hidden bg-[#FAF8F5]">
        <img
          src={`/products/${product.images?.[0] || product.slug}.png`}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Sale badge */}
        {product.comparePrice && (
          <span className="absolute top-3 left-3 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
            Sale
          </span>
        )}
        {/* Category badge */}
        <Badge className="absolute top-3 right-3 bg-white/90 text-[#1A1A1A] hover:bg-white/90 text-[10px] font-medium">
          {categoryLabel}
        </Badge>
        {/* Low stock warning */}
        {product.stock > 0 && product.stock < 5 && (
          <span className="absolute bottom-3 left-3 rounded-full bg-amber-500/90 px-2 py-0.5 text-[10px] font-semibold text-white">
            Only {product.stock} left!
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A] line-clamp-1">
          {product.name}
        </h3>
        {/* Star rating */}
        <div className="mt-1 flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-3 w-3 ${
                i < Math.round(product.rating)
                  ? 'fill-[#B87333] text-[#B87333]'
                  : 'text-gray-200'
              }`}
            />
          ))}
          <span className="ml-1 text-[10px] text-gray-400">
            ({product.reviewCount})
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-bold text-[#B87333]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        {/* Stock indicator */}
        {product.stock === 0 && (
          <p className="mt-1 text-xs text-red-500 font-medium">Out of Stock</p>
        )}
        <Button
          disabled={product.stock === 0}
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
            toast.success(`${product.name} added to cart!`);
          }}
          className="mt-3 w-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs disabled:opacity-50"
          size="sm"
        >
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
          {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Mobile Filter Sheet Content ──────────────────────────────────────
function FilterControls({
  category,
  setCategory,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  searchQuery,
  setSearchQuery,
}: {
  category: string;
  setCategory: (v: string) => void;
  priceRange: number[];
  setPriceRange: (v: number[]) => void;
  sortBy: string;
  setSortBy: (v: string) => void;
  searchQuery: string;
  setSearchQuery: (v: string) => void;
}) {
  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
          Search
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Separator />

      {/* Category Toggle */}
      <div>
        <label className="text-sm font-medium text-[#1A1A1A] mb-3 block">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={category === cat.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategory(cat.value)}
              className={
                category === cat.value
                  ? 'bg-[#B87333] hover:bg-[#9E6329] text-white border-[#B87333] text-xs'
                  : 'border-gray-200 text-xs hover:border-[#B87333] hover:text-[#B87333]'
              }
            >
              {cat.label}
            </Button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <label className="text-sm font-medium text-[#1A1A1A] mb-3 block">
          Price Range
        </label>
        <Slider
          min={0}
          max={10000}
          step={100}
          value={priceRange}
          onValueChange={setPriceRange}
          className="w-full [&_[data-slot=slider-range]]:bg-[#B87333] [&_[data-slot=slider-thumb]]:border-[#B87333]"
        />
        <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
          <span>₹{priceRange[0].toLocaleString('en-IN')}</span>
          <span>₹{priceRange[1].toLocaleString('en-IN')}</span>
        </div>
      </div>

      <Separator />

      {/* Sort By */}
      <div>
        <label className="text-sm font-medium text-[#1A1A1A] mb-2 block">
          Sort By
        </label>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────
function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getVisiblePages = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      for (
        let i = Math.max(2, currentPage - 1);
        i <= Math.min(totalPages - 1, currentPage + 1);
        i++
      ) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {getVisiblePages().map((page, idx) =>
        page === 'ellipsis' ? (
          <span key={`ellipsis-${idx}`} className="px-2 text-sm text-gray-400">
            ...
          </span>
        ) : (
          <Button
            key={page}
            variant={currentPage === page ? 'default' : 'outline'}
            size="icon"
            className={`h-9 w-9 text-sm ${
              currentPage === page
                ? 'bg-[#B87333] hover:bg-[#9E6329] text-white border-[#B87333]'
                : ''
            }`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        )
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-9 w-9"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

// ─── Main ProductListingPage ──────────────────────────────────────────
export default function ProductListingPage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const params = useNavigationStore((s) => s.params);

  // Filter & sort state
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState(params.category || '');
  const [priceRange, setPriceRange] = useState<number[]>([0, 2000]);
  const [sortBy, setSortBy] = useState(params.sort || 'popularity');
  const [currentPage, setCurrentPage] = useState(1);

  // Product state
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);

  // Mobile filter sheet
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  // Compute total pages
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);

  // Build query params
  const buildQuery = useCallback(() => {
    const sp = new URLSearchParams();
    if (category) sp.set('category', category);
    if (priceRange[0] > 0) sp.set('minPrice', String(priceRange[0]));
    if (priceRange[1] < 10000) sp.set('maxPrice', String(priceRange[1]));
    if (searchQuery) sp.set('search', searchQuery);
    sp.set('sort', sortBy);
    sp.set('page', String(currentPage));
    sp.set('limit', String(PRODUCTS_PER_PAGE));
    return `/api/products?${sp.toString()}`;
  }, [category, priceRange, searchQuery, sortBy, currentPage]);

  // Fetch products
  useEffect(() => {
    let cancelled = false;
    async function fetchProducts() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(buildQuery());
        if (!res.ok) {
          throw new Error(res.status === 404 ? 'Products not found' : 'Failed to load products');
        }
        const data = await res.json();
        if (!cancelled) {
          const items = Array.isArray(data) ? data : data.products ?? [];
          setProducts(items);
          setTotalProducts(data.total ?? items.length);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Something went wrong');
          setProducts([]);
          setTotalProducts(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchProducts();
    return () => { cancelled = true; };
  }, [buildQuery]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [category, priceRange, searchQuery, sortBy]);

  // Handle initial params from navigation (e.g., from homepage category cards)
  useEffect(() => {
    if (params.category) {
      setCategory(params.category);
    }
  }, [params.category]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (category) count++;
    if (priceRange[0] > 0 || priceRange[1] < 10000) count++;
    if (searchQuery) count++;
    if (sortBy !== 'popularity') count++;
    return count;
  }, [category, priceRange, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setCategory('');
    setPriceRange([0, 2000]);
    setSortBy('popularity');
    setCurrentPage(1);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-white"
    >
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div className="bg-[#FAF8F5] border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <h1 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
            Shop All Products
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Browse our curated collection of premium products
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* ── Search & Toolbar ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-6">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Sort dropdown (desktop) */}
          <div className="hidden sm:block">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mobile filter button */}
          <Sheet open={filterSheetOpen} onOpenChange={setFilterSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="sm:hidden relative">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Filters
                {activeFiltersCount > 0 && (
                  <span className="ml-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-[#B87333] text-[10px] font-bold text-white">
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
                <SheetDescription>
                  Refine your product search
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 px-4 pb-6">
                <FilterControls
                  category={category}
                  setCategory={setCategory}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* ── Desktop Filter Bar ─────────────────────────────────────── */}
        <div className="hidden sm:flex flex-wrap items-center gap-4 mb-6 pb-4 border-b">
          {/* Category tabs */}
          <div className="flex items-center gap-2">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                variant={category === cat.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCategory(cat.value)}
                className={
                  category === cat.value
                    ? 'bg-[#B87333] hover:bg-[#9E6329] text-white border-[#B87333] text-xs'
                    : 'border-gray-200 text-xs hover:border-[#B87333] hover:text-[#B87333]'
                }
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {/* Price range */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-xs text-gray-500">Price:</span>
            <Slider
              min={0}
              max={10000}
              step={100}
              value={priceRange}
              onValueChange={setPriceRange}
              className="w-40 [&_[data-slot=slider-range]]:bg-[#B87333] [&_[data-slot=slider-thumb]]:border-[#B87333]"
            />
            <span className="text-xs font-medium text-[#1A1A1A] whitespace-nowrap">
              ₹{priceRange[0].toLocaleString('en-IN')} — ₹{priceRange[1].toLocaleString('en-IN')}
            </span>
          </div>

          {/* Clear filters */}
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <X className="mr-1 h-3 w-3" />
              Clear ({activeFiltersCount})
            </Button>
          )}
        </div>

        {/* ── Results info ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">
            {loading ? (
              'Loading products...'
            ) : error ? (
              ''
            ) : (
              <>
                Showing{' '}
                <span className="font-semibold text-[#1A1A1A]">
                  {products.length}
                </span>{' '}
                {products.length === 1 ? 'product' : 'products'}
                {totalProducts > products.length && (
                  <>
                    {' '}of{' '}
                    <span className="font-semibold text-[#1A1A1A]">
                      {totalProducts}
                    </span>
                  </>
                )}
              </>
            )}
          </p>

          {/* Mobile sort */}
          <div className="sm:hidden">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[160px] h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* ── Loading State ──────────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: PRODUCTS_PER_PAGE }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* ── Error State ────────────────────────────────────────────── */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#1A1A1A]">
              Oops! Something went wrong
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">{error}</p>
            <Button
              onClick={() => {
                setError(null);
                setLoading(true);
                // Re-trigger by changing page
                setCurrentPage((p) => p);
              }}
              className="mt-4 bg-[#B87333] hover:bg-[#9E6329] text-white"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* ── Empty State ────────────────────────────────────────────── */}
        {!loading && !error && products.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-50">
              <PackageX className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-[#1A1A1A]">
              No products found
            </h3>
            <p className="mt-2 max-w-md text-sm text-gray-500">
              Try adjusting your search or filter to find what you&apos;re looking for.
            </p>
            <Button
              onClick={clearFilters}
              className="mt-4 bg-[#B87333] hover:bg-[#9E6329] text-white"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* ── Product Grid ───────────────────────────────────────────── */}
        {!loading && !error && products.length > 0 && (
          <>
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
              <AnimatePresence mode="popLayout">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </AnimatePresence>
            </div>

            {/* ── Pagination ──────────────────────────────────────────── */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        )}
      </div>
    </motion.div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Truck,
  Shield,
  RotateCcw,
  Star,
  Sparkles,
  PenTool,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Quote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore, useCartStore } from '@/lib/store';
import type { Product } from '@/lib/types';

// ─── Product Card ────────────────────────────────────────────────────
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

function ProductCard({ product }: { product: Product }) {
  const navigate = useNavigationStore((s) => s.navigate);
  const addToCart = useCartStore((s) => s.addItem);

  return (
    <div
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
        {product.comparePrice && (
          <span className="absolute top-3 left-3 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-semibold text-white">
            Sale
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A] line-clamp-1">
          {product.name}
        </h3>
        <div className="mt-1 flex items-center gap-2">
          <span className="text-base font-bold text-[#C9A96E]">
            ₹{product.price.toLocaleString('en-IN')}
          </span>
          {product.comparePrice && (
            <span className="text-sm text-gray-400 line-through">
              ₹{product.comparePrice.toLocaleString('en-IN')}
            </span>
          )}
        </div>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            addToCart(product);
          }}
          className="mt-3 w-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs"
          size="sm"
        >
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

// ─── Main HomePage ───────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const categoriesRef = useRef<HTMLDivElement>(null);

  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const [featuredRes, trendingRes] = await Promise.allSettled([
          fetch('/api/products?featured=true&limit=4'),
          fetch('/api/products?trending=true&limit=4'),
        ]);

        if (featuredRes.status === 'fulfilled' && featuredRes.value.ok) {
          const data = await featuredRes.value.json();
          setFeaturedProducts(Array.isArray(data) ? data : data.products ?? []);
        }
        if (trendingRes.status === 'fulfilled' && trendingRes.value.ok) {
          const data = await trendingRes.value.json();
          setTrendingProducts(Array.isArray(data) ? data : data.products ?? []);
        }
      } catch {
        // Products API not available yet - show empty state
      } finally {
        setFeaturedLoading(false);
        setTrendingLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const scrollToCategories = () => {
    categoriesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col">
      {/* ── 1. Hero Section ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[70vh] sm:min-h-[80vh] items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="/products/hero-banner.png"
            alt="LuxeChains Hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A]/80 via-[#1A1A1A]/50 to-[#1A1A1A]/70" />
        </div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6"
        >
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mb-4 inline-block rounded-full border border-[#C9A96E]/40 bg-[#C9A96E]/10 px-4 py-1.5 text-sm font-medium text-[#C9A96E]"
          >
            ✨ New Collection 2024
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            Elegance{' '}
            <span className="text-[#C9A96E]">Redefined</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="mt-4 text-base text-gray-300 sm:text-lg"
          >
            Discover our exquisite collection of necklaces and chains
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button
              onClick={() => navigate('products')}
              size="lg"
              className="bg-[#C9A96E] hover:bg-[#b89558] text-white px-8 text-sm font-semibold"
            >
              Shop Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              onClick={scrollToCategories}
              variant="outline"
              size="lg"
              className="border-white/30 text-white hover:bg-white/10 px-8 text-sm font-semibold bg-transparent"
            >
              Explore Collections
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* ── 2. Free Shipping Badge Section ──────────────────────────── */}
      <section className="border-b bg-[#FAF8F5]">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y sm:divide-y-0 sm:divide-x sm:grid-cols-3 px-4 sm:px-6 lg:px-8">
          {[
            {
              icon: Truck,
              title: 'Free Shipping',
              desc: 'On all orders across India',
            },
            {
              icon: Shield,
              title: 'Secure Payment',
              desc: 'UPI, COD & Card payments accepted',
            },
            {
              icon: RotateCcw,
              title: 'Easy Returns',
              desc: '7-day hassle-free returns',
            },
          ].map((item) => (
            <div
              key={item.title}
              className="flex flex-col items-center gap-2 py-6 px-4 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9A96E]/10">
                <item.icon className="h-6 w-6 text-[#C9A96E]" />
              </div>
              <h3 className="text-sm font-semibold text-[#1A1A1A]">
                {item.title}
              </h3>
              <p className="text-xs text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 3. Featured Products Section ────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
                Featured Collection
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Handpicked pieces for you
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('products')}
              className="text-[#C9A96E] hover:text-[#b89558] text-sm font-medium hidden sm:flex"
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {featuredLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-500">
                Products coming soon
              </p>
              <p className="mt-1 text-xs text-gray-400">
                We&apos;re curating the perfect collection for you
              </p>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button
              variant="outline"
              onClick={() => navigate('products')}
              className="border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E]/5 text-sm"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* ── 4. Categories Section ───────────────────────────────────── */}
      <section
        ref={categoriesRef}
        className="bg-[#FAF8F5] py-12 sm:py-16 lg:py-20"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
              Shop by Category
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Find the perfect piece for every occasion
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Zodiac Sign Chains',
                desc: 'Wear your sign with pride. Astrology-inspired designs crafted in premium materials.',
                icon: Star,
                category: 'zodiac',
                image: '/products/zodiac-aries.png',
              },
              {
                title: 'Custom Chains',
                desc: 'Create something uniquely yours. Personalized necklaces with names, initials & more.',
                icon: PenTool,
                category: 'custom',
                image: '/products/custom-name.png',
              },
              {
                title: 'Stylish Chains',
                desc: 'Trendy designs for the modern you. Layered, chunky, minimal & more.',
                icon: Sparkles,
                category: 'stylish',
                image: '/products/stylish-layered.png',
              },
            ].map((cat) => (
              <Card
                key={cat.category}
                className="group relative cursor-pointer overflow-hidden border-0 p-0 shadow-md hover:shadow-xl transition-shadow duration-300"
                onClick={() =>
                  navigate('products', { category: cat.category })
                }
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={cat.image}
                    alt={cat.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/80 via-[#1A1A1A]/30 to-transparent" />
                  <div className="absolute inset-0 flex flex-col justify-end p-6">
                    <cat.icon className="h-6 w-6 text-[#C9A96E] mb-2" />
                    <h3 className="text-lg font-bold text-white">
                      {cat.title}
                    </h3>
                    <p className="mt-1 text-sm text-gray-300 line-clamp-2">
                      {cat.desc}
                    </p>
                    <Button
                      variant="ghost"
                      className="mt-4 w-fit bg-white/10 hover:bg-white/20 text-white text-xs backdrop-blur-sm"
                    >
                      Shop Now <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5. Trending Products Section ────────────────────────────── */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
                Trending Now
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                Most loved by our customers
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('products', { sort: 'trending' })}
              className="text-[#C9A96E] hover:text-[#b89558] text-sm font-medium hidden sm:flex"
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>

          {trendingLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : trendingProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {trendingProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-gray-200 py-16 text-center">
              <Star className="mx-auto h-10 w-10 text-gray-300" />
              <p className="mt-3 text-sm font-medium text-gray-500">
                Trending products coming soon
              </p>
              <p className="mt-1 text-xs text-gray-400">
                Stay tuned for our bestsellers
              </p>
            </div>
          )}

          <div className="mt-6 text-center sm:hidden">
            <Button
              variant="outline"
              onClick={() => navigate('products')}
              className="border-[#C9A96E] text-[#C9A96E] hover:bg-[#C9A96E]/5 text-sm"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* ── 6. Testimonials Section ─────────────────────────────────── */}
      <section className="bg-[#FAF8F5] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
              What Our Customers Say
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Real reviews from real jewelry lovers
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Priya Sharma',
                rating: 5,
                text: 'Absolutely in love with my zodiac chain! The quality is exceptional and it looks even better in person. Will definitely order again.',
              },
              {
                name: 'Ananya Patel',
                rating: 5,
                text: 'Ordered a custom name necklace for my sister and she was thrilled. The engraving is perfect and the chain feels so premium.',
              },
              {
                name: 'Kavya Reddy',
                rating: 4,
                text: 'Great selection and fast delivery! The layered chain I bought goes with everything. Best jewelry purchase I\'ve made this year.',
              },
            ].map((testimonial, idx) => (
              <Card
                key={idx}
                className="border-0 shadow-md hover:shadow-lg transition-shadow"
              >
                <CardContent className="pt-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < testimonial.rating
                            ? 'fill-[#C9A96E] text-[#C9A96E]'
                            : 'text-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm text-gray-600 leading-relaxed italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A96E]/10 text-sm font-bold text-[#C9A96E]">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1A1A1A]">
                        {testimonial.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        Verified Customer
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7. CTA Newsletter Section ───────────────────────────────── */}
      <section className="bg-[#1A1A1A] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Join the LuxeChains Family
          </h2>
          <p className="mt-3 text-sm text-gray-400">
            Subscribe to our newsletter for exclusive offers, early access to
            new collections, and 10% off your first order.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email address"
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 focus-visible:border-[#C9A96E] focus-visible:ring-[#C9A96E]/30"
            />
            <Button className="bg-[#C9A96E] hover:bg-[#b89558] text-white font-semibold shrink-0">
              Subscribe
            </Button>
          </div>
          <p className="mt-3 text-xs text-gray-500">
            No spam, ever. Unsubscribe anytime.
          </p>
        </div>
      </section>
    </div>
  );
}

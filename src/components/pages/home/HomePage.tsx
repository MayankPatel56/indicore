'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Truck,
  Shield,
  RotateCcw,
  Star,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  ChevronRight,
  Zap,
  Globe,
  Cpu,
  Gem,
  Clock,
  Award,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigationStore, useCartStore } from '@/lib/store';
import { getImagePath } from '@/lib/utils';
import type { Product } from '@/lib/types';

// ─── Animation Variants ────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (i: number = 0) => ({
    opacity: 1,
    transition: { delay: i * 0.12, duration: 0.6, ease: 'easeOut' },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: (i: number = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
};

const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── Section Wrapper with Scroll Animation ──────────────────────────────
function AnimatedSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? 'visible' : 'hidden'}
      variants={fadeUp}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── Product Card ───────────────────────────────────────────────────────
function ProductCardSkeleton() {
  return (
    <div className="group overflow-hidden rounded-2xl border border-[#1A1A1A]/6 bg-white">
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
      className="group cursor-pointer overflow-hidden rounded-2xl border border-[#1A1A1A]/6 bg-white transition-all duration-500 hover:shadow-xl hover:shadow-[#B87333]/5 hover:-translate-y-1"
      onClick={() => navigate('product-detail', { slug: product.slug })}
    >
      <div className="relative aspect-square overflow-hidden bg-[#F7F5F2]">
        <img
          src={getImagePath(product.images?.[0])}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        {product.comparePrice && (
          <span className="absolute top-3 left-3 rounded-full bg-[#B87333] px-2.5 py-0.5 text-xs font-semibold text-white">
            Sale
          </span>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold text-[#1A1A1A] line-clamp-1 group-hover:text-[#B87333] transition-colors">
          {product.name}
        </h3>
        <div className="mt-1.5 flex items-center gap-2">
          <span className="text-base font-bold text-[#B87333]">
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
          className="mt-3 w-full bg-[#1A1A1A] hover:bg-[#333] text-white text-xs rounded-xl transition-all duration-300 hover:shadow-md"
          size="sm"
        >
          <ShoppingBag className="mr-1.5 h-3.5 w-3.5" />
          Add to Cart
        </Button>
      </div>
    </div>
  );
}

// ─── Main HomePage ──────────────────────────────────────────────────────
export default function HomePage() {
  const navigate = useNavigationStore((s) => s.navigate);
  const productsRef = useRef<HTMLDivElement>(null);

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
        // Products API not available yet
      } finally {
        setFeaturedLoading(false);
        setTrendingLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const scrollToProducts = () => {
    productsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col">
      {/* ═══════════════════════════════════════════════════════════════
          1. HERO — Flagship Product Showcase
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-[#1A1A1A]">
        {/* Background Image with Parallax-like overlay */}
        <div className="absolute inset-0">
          <img
            src="/products/hero-flagship.png"
            alt="IndiCore Originals Flagship Product"
            className="h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1A1A1A] via-[#1A1A1A]/70 to-[#1A1A1A]/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A] via-transparent to-transparent" />
        </div>

        {/* Floating ambient shapes */}
        <div className="absolute top-20 right-10 w-72 h-72 rounded-full bg-[#B87333]/5 blur-3xl" />
        <div className="absolute bottom-20 left-10 w-96 h-96 rounded-full bg-[#B87333]/3 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <div>
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={0}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-[#B87333]/30 bg-[#B87333]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-[#B87333]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B87333] animate-pulse" />
                  Premium Originals
                </span>
              </motion.div>

              <motion.h1
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={1}
                className="mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl xl:text-7xl leading-[1.1]"
              >
                Rooted in
                <br />
                <span className="text-[#B87333]">Heritage.</span>
                <br />
                <span className="text-white/80">Engineered for</span>
                <br />
                <span className="text-white">Tomorrow.</span>
              </motion.h1>

              <motion.p
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={2}
                className="mt-6 max-w-md text-base text-white/50 sm:text-lg leading-relaxed"
              >
                Discover IndiCore Originals — where centuries of Indian craftsmanship meet cutting-edge modern design.
              </motion.p>

              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={3}
                className="mt-8 flex flex-col sm:flex-row items-start gap-4"
              >
                <Button
                  onClick={() => navigate('products')}
                  size="lg"
                  className="bg-[#B87333] hover:bg-[#9E6329] text-white px-8 text-sm font-semibold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#B87333]/25"
                >
                  Explore Collection
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  onClick={scrollToProducts}
                  variant="outline"
                  size="lg"
                  className="border-white/15 text-white/70 hover:bg-white/5 hover:text-white px-8 text-sm font-semibold rounded-xl bg-transparent backdrop-blur-sm"
                >
                  Learn More
                </Button>
              </motion.div>

              {/* Stats Row */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                custom={4}
                className="mt-12 flex items-center gap-8"
              >
                {[
                  { value: '10K+', label: 'Happy Customers' },
                  { value: '500+', label: 'Products' },
                  { value: '4.9', label: 'Rating' },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-bold text-white">{stat.value}</p>
                    <p className="text-[11px] text-white/35 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Right: Product Showcase */}
            <motion.div
              initial={{ opacity: 0, y: 80, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.6, duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="hidden lg:flex justify-center items-center"
            >
              <div className="relative">
                {/* Glow ring */}
                <div className="absolute inset-0 -m-8 rounded-full bg-[#B87333]/10 blur-2xl" />
                <div className="relative w-80 h-80 xl:w-96 xl:h-96 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src="/products/hero-flagship.png"
                    alt="IndiCore Flagship Product"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/60 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-xs text-[#B87333] font-semibold uppercase tracking-wider">The Original</p>
                    <p className="text-lg font-bold text-white mt-1">IndiCore Signature Series</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] uppercase tracking-widest text-white/25 font-medium">Scroll</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ArrowDown className="h-4 w-4 text-white/25" />
          </motion.div>
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          2. TRUST BADGES
          ═══════════════════════════════════════════════════════════════ */}
      <section className="border-b border-[#1A1A1A]/6 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-[#1A1A1A]/6 sm:divide-y-0 sm:divide-x sm:grid-cols-3 px-4 sm:px-6 lg:px-8">
          {[
            { icon: Truck, title: 'Free Shipping', desc: 'On all orders across India' },
            { icon: Shield, title: 'Secure Payment', desc: 'UPI, COD & Card payments' },
            { icon: RotateCcw, title: 'Easy Returns', desc: '7-day hassle-free returns' },
          ].map((item, i) => (
            <AnimatedSection key={item.title} delay={i * 0.1}>
              <div className="flex flex-col items-center gap-2.5 py-6 px-4 text-center group">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#B87333]/8 group-hover:bg-[#B87333]/12 transition-colors duration-300">
                  <item.icon className="h-5 w-5 text-[#B87333]" />
                </div>
                <h3 className="text-sm font-semibold text-[#1A1A1A]">{item.title}</h3>
                <p className="text-xs text-[#1A1A1A]/40">{item.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          3. HERITAGE — Indian Origin Story
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#F7F5F2] overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Image */}
            <AnimatedSection>
              <div className="relative">
                <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl border-2 border-[#B87333]/20" />
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl">
                  <img
                    src="/products/heritage-section.png"
                    alt="Indian Heritage Craftsmanship"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#B87333]/15 to-transparent" />
                </div>
                {/* Floating badge */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="absolute -bottom-6 -right-4 sm:-right-6 bg-white rounded-2xl shadow-lg px-5 py-4 border border-[#1A1A1A]/6"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#B87333]/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-[#B87333]" />
                    </div>
                    <div>
                      <p className="text-lg font-bold text-[#1A1A1A]">1000+</p>
                      <p className="text-[10px] text-[#1A1A1A]/40 uppercase tracking-wider">Years of Heritage</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </AnimatedSection>

            {/* Right: Story */}
            <div className="space-y-6">
              <AnimatedSection delay={0.1}>
                <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B87333]">
                  <span className="w-8 h-px bg-[#B87333]" />
                  Our Story
                </span>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <h2 className="text-3xl font-bold text-[#1A1A1A] sm:text-4xl leading-tight">
                  Born from India&apos;s{' '}
                  <span className="text-[#B87333]">Timeless</span>{' '}
                  Craftsmanship
                </h2>
              </AnimatedSection>
              <AnimatedSection delay={0.3}>
                <p className="text-base text-[#1A1A1A]/55 leading-relaxed">
                  Every IndiCore product carries the soul of a tradition that spans millennia. Our artisans,
                  descendants of master craftsmen from across India, infuse each creation with techniques
                  perfected through generations.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.4}>
                <p className="text-base text-[#1A1A1A]/55 leading-relaxed">
                  From the intricate metalwork of Rajasthan to the precision engineering of modern design
                  studios — we bridge worlds, creating products that honor the past while embracing the future.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.5}>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  {[
                    { icon: Gem, label: 'Authentic Materials' },
                    { icon: Award, label: 'Master Artisans' },
                    { icon: Globe, label: 'Sustainable Sourcing' },
                    { icon: Star, label: 'Quality Certified' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2.5 group cursor-default">
                      <div className="w-8 h-8 rounded-lg bg-[#B87333]/8 flex items-center justify-center flex-shrink-0 group-hover:bg-[#B87333]/12 transition-colors">
                        <item.icon className="h-4 w-4 text-[#B87333]" />
                      </div>
                      <span className="text-sm text-[#1A1A1A]/65 font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          4. MODERN TECH — Features & Innovation
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B87333]">
              <span className="w-8 h-px bg-[#B87333]" />
              Innovation
              <span className="w-8 h-px bg-[#B87333]" />
            </span>
            <h2 className="mt-4 text-3xl font-bold text-[#1A1A1A] sm:text-4xl">
              Modern Tech,{' '}
              <span className="text-[#B87333]">Timeless</span> Design
            </h2>
            <p className="mt-4 text-base text-[#1A1A1A]/45">
              Each product combines precision engineering with artisanal beauty — built for the modern individual.
            </p>
          </AnimatedSection>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Cpu,
                title: 'Precision Engineered',
                desc: 'Advanced manufacturing processes ensure every product meets exacting quality standards.',
              },
              {
                icon: Shield,
                title: 'Built to Last',
                desc: 'Premium materials and rigorous testing guarantee durability that stands the test of time.',
              },
              {
                icon: Zap,
                title: 'Rapid Prototyping',
                desc: 'From concept to creation in record time, without compromising on quality.',
              },
              {
                icon: Globe,
                title: 'Sustainable Process',
                desc: 'Eco-conscious production methods that minimize waste and maximize resource efficiency.',
              },
              {
                icon: Gem,
                title: 'Premium Materials',
                desc: 'Sourced from the finest suppliers across India and the world.',
              },
              {
                icon: Award,
                title: 'Award-Winning Design',
                desc: 'Recognized by industry experts for blending heritage aesthetics with modern functionality.',
              },
            ].map((feature, i) => (
              <AnimatedSection key={feature.title} delay={i * 0.08}>
                <Card className="group h-full border-[#1A1A1A]/6 rounded-2xl hover:border-[#B87333]/20 transition-all duration-500 hover:shadow-lg hover:shadow-[#B87333]/5 cursor-default">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-[#B87333]/8 flex items-center justify-center mb-4 group-hover:bg-[#B87333]/12 group-hover:scale-105 transition-all duration-300">
                      <feature.icon className="h-6 w-6 text-[#B87333]" />
                    </div>
                    <h3 className="text-base font-semibold text-[#1A1A1A] mb-2 group-hover:text-[#B87333] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#1A1A1A]/45 leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          5. FEATURED PRODUCTS
          ═══════════════════════════════════════════════════════════════ */}
      <section ref={productsRef} className="py-16 sm:py-24 lg:py-32 bg-[#F7F5F2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B87333]">
                <span className="w-8 h-px bg-[#B87333]" />
                Curated
              </span>
              <h2 className="mt-3 text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
                Featured Collection
              </h2>
              <p className="mt-1 text-sm text-[#1A1A1A]/40">
                Handpicked originals for you
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('products')}
              className="text-[#B87333] hover:text-[#9E6329] text-sm font-medium hidden sm:flex hover:bg-[#B87333]/5 rounded-xl"
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </AnimatedSection>

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
            <div className="rounded-2xl border-2 border-dashed border-[#1A1A1A]/10 py-16 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-[#B87333]/30" />
              <p className="mt-3 text-sm font-medium text-[#1A1A1A]/50">
                Products coming soon
              </p>
              <p className="mt-1 text-xs text-[#1A1A1A]/30">
                We&apos;re curating the perfect collection for you
              </p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button
              variant="outline"
              onClick={() => navigate('products')}
              className="border-[#B87333]/30 text-[#B87333] hover:bg-[#B87333]/5 text-sm rounded-xl"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          6. CATEGORIES
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B87333]">
              <span className="w-8 h-px bg-[#B87333]" />
              Collections
              <span className="w-8 h-px bg-[#B87333]" />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
              Shop by Collection
            </h2>
            <p className="mt-2 text-sm text-[#1A1A1A]/40">
              Find the perfect piece for your style
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                title: 'Portable Fans',
                desc: 'Stay cool anywhere with our range of rechargeable desk fans, neck fans, and portable cooling solutions.',
                icon: Cpu,
                category: 'electronic-accessories',
                image: '/products/neck-fan.png',
              },
              {
                title: 'Fitness & Wellness',
                desc: 'Premium fitness gear designed to support your health goals. Sweat belts, trainers, and more.',
                icon: Award,
                category: 'fitness',
                image: '/products/sweat-belt.png',
              },
              {
                title: 'Home Essentials',
                desc: 'Smart kitchen and home gadgets that make everyday life easier and more efficient.',
                icon: Zap,
                category: 'home-essentials',
                image: '/products/bag-sealer.png',
              },
            ].map((cat, i) => (
              <AnimatedSection key={cat.category} delay={i * 0.1}>
                <Card
                  className="group relative cursor-pointer overflow-hidden border-0 p-0 shadow-lg rounded-2xl hover:shadow-2xl transition-all duration-500"
                  onClick={() =>
                    navigate('products', { category: cat.category })
                  }
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={cat.image}
                      alt={cat.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1A]/85 via-[#1A1A1A]/40 to-[#1A1A1A]/20" />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-8">
                      <cat.icon className="h-6 w-6 text-[#B87333] mb-3" />
                      <h3 className="text-xl font-bold text-white">
                        {cat.title}
                      </h3>
                      <p className="mt-2 text-sm text-white/55 line-clamp-2 leading-relaxed">
                        {cat.desc}
                      </p>
                      <div className="mt-4 flex items-center gap-2 text-sm font-medium text-[#B87333] group-hover:gap-3 transition-all duration-300">
                        Shop Now
                        <ArrowRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          7. TRENDING PRODUCTS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 lg:py-32 bg-[#F7F5F2]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="flex items-center justify-between mb-10">
            <div>
              <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B87333]">
                <span className="w-8 h-px bg-[#B87333]" />
                Popular
              </span>
              <h2 className="mt-3 text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
                Trending Now
              </h2>
              <p className="mt-1 text-sm text-[#1A1A1A]/40">
                Most loved by our community
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('products', { sort: 'trending' })}
              className="text-[#B87333] hover:text-[#9E6329] text-sm font-medium hidden sm:flex hover:bg-[#B87333]/5 rounded-xl"
            >
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </AnimatedSection>

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
            <div className="rounded-2xl border-2 border-dashed border-[#1A1A1A]/10 py-16 text-center">
              <Star className="mx-auto h-10 w-10 text-[#B87333]/30" />
              <p className="mt-3 text-sm font-medium text-[#1A1A1A]/50">
                Trending products coming soon
              </p>
              <p className="mt-1 text-xs text-[#1A1A1A]/30">
                Stay tuned for our bestsellers
              </p>
            </div>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Button
              variant="outline"
              onClick={() => navigate('products')}
              className="border-[#B87333]/30 text-[#B87333] hover:bg-[#B87333]/5 text-sm rounded-xl"
            >
              View All Products
            </Button>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          8. TESTIMONIALS
          ═══════════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center max-w-2xl mx-auto mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B87333]">
              <span className="w-8 h-px bg-[#B87333]" />
              Community
              <span className="w-8 h-px bg-[#B87333]" />
            </span>
            <h2 className="mt-4 text-2xl font-bold text-[#1A1A1A] sm:text-3xl">
              What People Say
            </h2>
            <p className="mt-2 text-sm text-[#1A1A1A]/40">
              Real stories from the IndiCore community
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: 'Arjun Mehta',
                rating: 5,
                text: 'The quality is exceptional. You can feel the heritage in every detail. This is what premium Indian craftsmanship looks like in the modern era.',
              },
              {
                name: 'Sneha Kapoor',
                rating: 5,
                text: 'Ordered from their Tech Series and was blown away. The precision is remarkable — truly world-class products made in India.',
              },
              {
                name: 'Rahul Deshmukh',
                rating: 5,
                text: 'Finally, a brand that bridges our rich heritage with modern design. The packaging, the product, the experience — all top-notch.',
              },
            ].map((testimonial, idx) => (
              <AnimatedSection key={idx} delay={idx * 0.1}>
                <Card className="h-full border-[#1A1A1A]/6 rounded-2xl hover:shadow-lg hover:border-[#B87333]/15 transition-all duration-500">
                  <CardContent className="pt-6">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating
                              ? 'fill-[#B87333] text-[#B87333]'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="mt-4 text-sm text-[#1A1A1A]/55 leading-relaxed">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#B87333]/10 text-sm font-bold text-[#B87333]">
                        {testimonial.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#1A1A1A]">
                          {testimonial.name}
                        </p>
                        <p className="text-xs text-[#1A1A1A]/35">
                          Verified Customer
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════
          9. CTA — Newsletter / Checkout Streamline
          ═══════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden bg-[#1A1A1A] py-16 sm:py-24 lg:py-32">
        {/* Ambient background */}
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#B87333]/5 blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <AnimatedSection>
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#B87333]">
              <span className="w-8 h-px bg-[#B87333]" />
              Join Us
              <span className="w-8 h-px bg-[#B87333]" />
            </span>
          </AnimatedSection>
          <AnimatedSection delay={0.1}>
            <h2 className="mt-6 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
              Join the IndiCore{' '}
              <span className="text-[#B87333]">Community</span>
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={0.2}>
            <p className="mt-4 text-sm text-white/40 sm:text-base">
              Get early access to new collections, exclusive offers, and stories from our artisans. 
              Be the first to know when limited editions drop.
            </p>
          </AnimatedSection>
          <AnimatedSection delay={0.3}>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-white/5 border-white/10 text-white placeholder:text-white/25 focus-visible:border-[#B87333] focus-visible:ring-[#B87333]/20 rounded-xl h-12"
              />
              <Button className="bg-[#B87333] hover:bg-[#9E6329] text-white font-semibold shrink-0 rounded-xl h-12 px-6 transition-all duration-300 hover:shadow-lg hover:shadow-[#B87333]/25">
                Subscribe
              </Button>
            </div>
            <p className="mt-4 text-xs text-white/20">
              No spam. Unsubscribe anytime. We respect your inbox.
            </p>
          </AnimatedSection>

          {/* Quick checkout CTA */}
          <AnimatedSection delay={0.4}>
            <div className="mt-12 pt-12 border-t border-white/6">
              <p className="text-sm text-white/30 mb-4">Ready to explore?</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  onClick={() => navigate('products')}
                  size="lg"
                  className="bg-[#B87333] hover:bg-[#9E6329] text-white px-8 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-[#B87333]/25"
                >
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  Shop Now
                </Button>
                <Button
                  onClick={() => navigate('contact')}
                  variant="outline"
                  size="lg"
                  className="border-white/10 text-white/50 hover:bg-white/5 hover:text-white px-8 rounded-xl"
                >
                  Get in Touch
                </Button>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </div>
  );
}

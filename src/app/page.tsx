'use client';

import dynamic from 'next/dynamic';
import AnnouncementBanner from '@/components/layout/AnnouncementBanner';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HomePage from '@/components/pages/home/HomePage';
import ProductListingPage from '@/components/pages/products/ProductListingPage';
import ProductDetailPage from '@/components/pages/products/ProductDetailPage';
import CartPage from '@/components/pages/cart/CartPage';
import CheckoutPage from '@/components/pages/checkout/CheckoutPage';
import LoginPage from '@/components/pages/auth/LoginPage';
import SignupPage from '@/components/pages/auth/SignupPage';
import ProfilePage from '@/components/pages/auth/ProfilePage';
import ContactPage from '@/components/pages/contact/ContactPage';
import AdminDashboard from '@/components/pages/admin/AdminDashboard';
import { useNavigationStore } from '@/lib/store';
import { AnimatePresence, motion } from 'framer-motion';

const OrderConfirmationPage = dynamic(
  () => import('@/components/pages/checkout/OrderConfirmationPage'),
  { ssr: false }
);
const OrderTrackingPage = dynamic(
  () => import('@/components/pages/checkout/OrderTrackingPage'),
  { ssr: false }
);

const storePages = [
  'products',
  'product-detail',
  'cart',
  'checkout',
  'login',
  'signup',
  'profile',
  'contact',
  'order-confirmation',
  'order-tracking',
];

export default function Home() {
  const page = useNavigationStore((s) => s.page);

  // Admin dashboard has its own layout (sidebar, no store header/footer)
  if (page === 'admin') {
    return <AdminDashboard />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AnnouncementBanner />
      <Header />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            {page === 'products' && <ProductListingPage />}
            {page === 'product-detail' && <ProductDetailPage />}
            {page === 'cart' && <CartPage />}
            {page === 'checkout' && <CheckoutPage />}
            {page === 'login' && <LoginPage />}
            {page === 'signup' && <SignupPage />}
            {page === 'profile' && <ProfilePage />}
            {page === 'contact' && <ContactPage />}
            {page === 'order-confirmation' && <OrderConfirmationPage />}
            {page === 'order-tracking' && <OrderTrackingPage />}
            {(page === 'home' || !storePages.includes(page)) && (
              <HomePage />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}

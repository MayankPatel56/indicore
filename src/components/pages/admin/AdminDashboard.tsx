'use client';

import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Megaphone,
  Settings,
  LogOut,
  Menu,
  Diamond,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useNavigationStore, useAdminStore, useAuthStore } from '@/lib/store';
import type { AdminPage } from '@/lib/types';
import AdminLogin from './AdminLogin';
import AdminOverview from './AdminOverview';
import AdminProducts from './AdminProducts';
import AdminOrders from './AdminOrders';
import AdminUsers from './AdminUsers';
import AdminBanner from './AdminBanner';
import AdminSettings from './AdminSettings';

const navItems: { page: AdminPage; label: string; icon: React.ReactNode }[] = [
  { page: 'overview', label: 'Dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
  { page: 'products', label: 'Products', icon: <Package className="h-5 w-5" /> },
  { page: 'orders', label: 'Orders', icon: <ShoppingCart className="h-5 w-5" /> },
  { page: 'users', label: 'Users', icon: <Users className="h-5 w-5" /> },
  { page: 'banner', label: 'Banner', icon: <Megaphone className="h-5 w-5" /> },
  { page: 'settings', label: 'Settings', icon: <Settings className="h-5 w-5" /> },
];

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const adminPage = useNavigationStore((s) => s.adminPage);
  const setAdminPage = useNavigationStore((s) => s.setAdminPage);
  const navigate = useNavigationStore((s) => s.navigate);
  const logout = useAuthStore((s) => s.logout);
  const user = useAuthStore((s) => s.user);

  const handleNav = (page: AdminPage) => {
    setAdminPage(page);
    onNavigate?.();
  };

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold/20">
          <Diamond className="h-5 w-5 text-gold" />
        </div>
        <span className="text-lg font-bold text-white">IndiCore Originals</span>
      </div>

      <Separator className="bg-white/10" />

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = adminPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => handleNav(item.page)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gold/15 text-gold'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item.icon}
                {item.label}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
                )}
              </button>
            );
          })}
        </nav>
      </ScrollArea>

      <Separator className="bg-white/10" />

      {/* Footer */}
      <div className="p-3 space-y-1">
        <button
          onClick={() => {
            navigate('home');
            onNavigate?.();
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Back to Store
        </button>
        <Separator className="bg-white/10 my-1" />
        <div className="flex items-center justify-between px-3 py-2">
          <div className="text-xs text-gray-500 truncate">
            {user?.name || 'Admin'}
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-gray-400 hover:bg-white/5 hover:text-red-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function TopBar() {
  const adminPage = useNavigationStore((s) => s.adminPage);
  const setSidebarOpen = useAdminStore((s) => s.setSidebarOpen);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigationStore((s) => s.navigate);
  const user = useAuthStore((s) => s.user);

  const pageTitles: Record<AdminPage, string> = {
    overview: 'Dashboard',
    products: 'Products',
    orders: 'Orders',
    users: 'Users',
    banner: 'Banner Management',
    settings: 'Settings',
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 sm:px-6">
      {/* Mobile hamburger */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="text-lg font-semibold text-charcoal">
        {pageTitles[adminPage]}
      </h1>

      <div className="ml-auto flex items-center gap-3">
        <span className="hidden text-sm text-muted-foreground sm:inline">
          {user?.name || 'Admin'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            logout();
            navigate('home');
          }}
          className="text-muted-foreground hover:text-red-500"
        >
          <LogOut className="mr-1.5 h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
}

function AdminContent() {
  const adminPage = useNavigationStore((s) => s.adminPage);

  switch (adminPage) {
    case 'overview':
      return <AdminOverview />;
    case 'products':
      return <AdminProducts />;
    case 'orders':
      return <AdminOrders />;
    case 'users':
      return <AdminUsers />;
    case 'banner':
      return <AdminBanner />;
    case 'settings':
      return <AdminSettings />;
    default:
      return <AdminOverview />;
  }
}

export default function AdminDashboard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const user = useAuthStore((s) => s.user);
  const sidebarOpen = useAdminStore((s) => s.sidebarOpen);
  const setSidebarOpen = useAdminStore((s) => s.setSidebarOpen);

  const isAdminUser = user?.role === 'admin';

  if (!isAuthenticated || !isAdminUser) {
    return <AdminLogin />;
  }

  return (
    <div className="flex h-screen bg-cream">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-charcoal">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar (Sheet) */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="w-64 p-0 bg-charcoal border-white/10">
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
          </SheetHeader>
          <SidebarContent onNavigate={() => setSidebarOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <TopBar />
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <AdminContent />
        </main>
      </div>
    </div>
  );
}

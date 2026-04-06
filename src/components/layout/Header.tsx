'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Diamond,
  Search,
  ShoppingBag,
  User,
  Menu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useNavigationStore, useCartStore, useAuthStore } from '@/lib/store';

const navLinks = [
  { label: 'Home', page: 'home' as const },
  { label: 'Shop', page: 'products' as const },
  { label: 'Contact', page: 'contact' as const },
];

export default function Header() {
  const navigate = useNavigationStore((s) => s.navigate);
  const page = useNavigationStore((s) => s.page);
  const cartCount = useCartStore((s) => s.getItemCount());
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNavClick = (pageName: typeof navLinks[number]['page']) => {
    navigate(pageName);
    setMobileOpen(false);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate('products', { search: searchQuery.trim() });
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <Diamond className="h-6 w-6 text-[#C9A96E]" />
          <span className="text-xl font-bold tracking-tight text-[#1A1A1A]">
            Luxe<span className="text-[#C9A96E]">Chains</span>
          </span>
        </button>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavClick(link.page)}
              className={`text-sm font-medium transition-colors hover:text-[#C9A96E] ${
                page === link.page
                  ? 'text-[#C9A96E] border-b-2 border-[#C9A96E] pb-0.5'
                  : 'text-[#1A1A1A]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search */}
          <div ref={searchRef} className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-label="Search"
              className="text-[#1A1A1A] hover:text-[#C9A96E]"
            >
              <Search className="h-5 w-5" />
            </Button>

            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-lg border shadow-lg p-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search necklaces, chains..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 text-sm"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    className="bg-[#C9A96E] hover:bg-[#b89558] text-white text-xs"
                  >
                    Go
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Cart */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('cart')}
            aria-label="Shopping cart"
            className="relative text-[#1A1A1A] hover:text-[#C9A96E]"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-[#C9A96E] text-white text-[10px] rounded-full p-0 border-0">
                {cartCount > 9 ? '9+' : cartCount}
              </Badge>
            )}
          </Button>

          {/* User */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() =>
              isAuthenticated ? navigate('profile') : navigate('login')
            }
            aria-label="Account"
            className="hidden sm:flex text-[#1A1A1A] hover:text-[#C9A96E]"
          >
            <User className="h-5 w-5" />
          </Button>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="text-[#1A1A1A] hover:text-[#C9A96E]"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <Diamond className="h-5 w-5 text-[#C9A96E]" />
                    <span>
                      Luxe<span className="text-[#C9A96E]">Chains</span>
                    </span>
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.page}
                      onClick={() => handleNavClick(link.page)}
                      className={`rounded-md px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[#FAF8F5] ${
                        page === link.page
                          ? 'bg-[#FAF8F5] text-[#C9A96E]'
                          : 'text-[#1A1A1A]'
                      }`}
                    >
                      {link.label}
                    </button>
                  ))}
                  <div className="my-2 h-px bg-border" />
                  <button
                    onClick={() => {
                      navigate('cart');
                      setMobileOpen(false);
                    }}
                    className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF8F5] flex items-center gap-2"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Cart {cartCount > 0 && `(${cartCount})`}
                  </button>
                  <button
                    onClick={() => {
                      if (isAuthenticated) {
                        navigate('profile');
                      } else {
                        navigate('login');
                      }
                      setMobileOpen(false);
                    }}
                    className="rounded-md px-3 py-2.5 text-left text-sm font-medium text-[#1A1A1A] hover:bg-[#FAF8F5] flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    {isAuthenticated ? 'My Account' : 'Login'}
                  </button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

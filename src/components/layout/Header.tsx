'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Hexagon,
  Search,
  ShoppingBag,
  User,
  Menu,
  LayoutDashboard,
  LogOut,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAdmin = user?.role === 'admin';
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef<HTMLDivElement>(null);

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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#1A1A1A]/6">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <button
          onClick={() => navigate('home')}
          className="flex items-center gap-2 transition-opacity hover:opacity-80"
        >
          <img
            src="/logo.png"
            alt="IndiCore Originals"
            className="h-8 w-auto"
          />
        </button>

        {/* Center: Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => handleNavClick(link.page)}
              className={`text-sm font-medium transition-colors hover:text-[#B87333] ${
                page === link.page
                  ? 'text-[#B87333] border-b-2 border-[#B87333] pb-0.5'
                  : 'text-[#1A1A1A]/70'
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
              className="text-[#1A1A1A]/70 hover:text-[#B87333]"
            >
              <Search className="h-5 w-5" />
            </Button>

            {searchOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl border border-[#1A1A1A]/8 shadow-lg p-3 animate-in fade-in-0 slide-in-from-top-2 duration-200">
                <div className="flex gap-2">
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 text-sm border-[#1A1A1A]/10 rounded-lg"
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleSearch}
                    className="bg-[#B87333] hover:bg-[#9E6329] text-white text-xs rounded-lg"
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
            className="relative text-[#1A1A1A]/70 hover:text-[#B87333]"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center bg-[#B87333] text-white text-[10px] rounded-full p-0 border-0">
                {cartCount > 9 ? '9+' : cartCount}
              </Badge>
            )}
          </Button>

          {/* User */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Account"
                className="hidden sm:flex text-[#1A1A1A]/70 hover:text-[#B87333]"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {isAuthenticated && user ? (
                <>
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('profile')}>
                    <User className="mr-2 h-4 w-4" />
                    My Account
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('admin')} className="text-[#B87333] font-medium">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => { logout(); navigate('home'); }} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem onClick={() => navigate('login')}>
                  <User className="mr-2 h-4 w-4" />
                  Login
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Hamburger */}
          <div className="md:hidden">
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="text-[#1A1A1A]/70 hover:text-[#B87333]"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <img
                      src="/logo.png"
                      alt="IndiCore Originals"
                      className="h-5 w-auto"
                    />
                  </SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  {navLinks.map((link) => (
                    <button
                      key={link.page}
                      onClick={() => handleNavClick(link.page)}
                      className={`rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-[#FAF8F5] ${
                        page === link.page
                          ? 'bg-[#FAF8F5] text-[#B87333]'
                          : 'text-[#1A1A1A]/70'
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
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1A1A1A]/70 hover:bg-[#FAF8F5] flex items-center gap-2"
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
                    className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#1A1A1A]/70 hover:bg-[#FAF8F5] flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    {isAuthenticated ? 'My Account' : 'Login'}
                  </button>
                  {isAuthenticated && isAdmin && (
                    <button
                      onClick={() => {
                        navigate('admin');
                        setMobileOpen(false);
                      }}
                      className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#B87333] hover:bg-[#FAF8F5] flex items-center gap-2"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Admin Dashboard
                    </button>
                  )}
                  {isAuthenticated && (
                    <button
                      onClick={() => {
                        logout();
                        navigate('home');
                        setMobileOpen(false);
                      }}
                      className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

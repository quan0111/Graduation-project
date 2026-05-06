'use client';

import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState, useRef, useEffect } from 'react';
import { useMe } from '@/modules/auth/api/get-auth-me';
import { useLogout } from '@/modules/auth/api/logout';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user } = useMe();
  const { mutate: logout } = useLogout();

  // 🔥 FIX: đúng field backend
  const cartCount = user?.cart?.itemCount ?? 0;

  // 👉 click ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">

      {/* TOP BAR */}
      <div className="hidden md:block bg-primary text-primary-foreground py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>Miễn phí vận chuyển cho đơn hàng trên 500k đ</div>

          <div className="flex gap-6">
            <Link to="#" className="hover:opacity-80">
              Hỗ trợ khách hàng
            </Link>

            {/* SELLER */}
            {user && (
              user.role === "SELLER" ? (
                <Link
                  to="/seller/dashboard"
                  className="hover:opacity-80"
                >
                  Seller Center
                </Link>
              ) : (
                <Link
                  to="/seller"
                  className="hover:opacity-80"
                >
                  Become Seller
                </Link>
              )
            )}

            {/* ADMIN */}
            {user?.role === "ADMIN" && (
              <Link to="/admin" className="hover:opacity-80">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* MAIN HEADER */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-3 md:gap-6">

          {/* LOGO */}
          <Link to="/" className="shrink-0">
            <div className="text-xl md:text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
              MarketHub
            </div>
          </Link>

          {/* SEARCH */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-4 pr-12"
              />

              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-white p-2 rounded">
                <Search size={16} />
              </button>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center gap-3 md:gap-4">

            {/* WISHLIST */}
            <button className="p-2 hover:bg-muted rounded hidden md:block">
              <Heart size={20} />
            </button>

            {/* CART */}
            <Link to="/cart" className="relative p-2 hover:bg-muted rounded">
              <ShoppingCart size={20} />

              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* USER */}
            {user ? (
              <div ref={dropdownRef} className="relative">

                {/* CLICK AREA */}
                <div
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 cursor-pointer hover:bg-muted px-2 py-1 rounded"
                >
                  <img
                    src={user.avatarUrl || "https://i.pravatar.cc/100"}
                    className="w-8 h-8 rounded-full object-cover"
                  />

                  <span className="hidden md:block text-sm font-medium">
                    {user.fullName || user.email.split("@")[0]}
                  </span>
                </div>

                {/* DROPDOWN */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-12 w-48 bg-white border rounded-xl shadow-lg z-50 overflow-hidden">

                    <Link
                      to="/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-muted"
                    >
                      Hồ sơ
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsDropdownOpen(false)}
                      className="block px-4 py-2 hover:bg-muted"
                    >
                      Đơn hàng
                    </Link>

                    {/* SELLER */}
                    {user.role === "SELLER" ? (
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-muted"
                      >
                        Seller Center
                      </Link>
                    ) : (
                      <Link
                        to="/seller/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-muted"
                      >
                        Kênh người bán
                      </Link>
                    )}

                    {/* ADMIN */}
                    {user.role === "ADMIN" && (
                      <Link
                        to="/admin"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 hover:bg-muted"
                      >
                        Admin
                      </Link>
                    )}

                    <div className="border-t" />

                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout(undefined);
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-muted text-red-500"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
                  <User size={18} />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
            )}

            {/* MOBILE MENU */}
            <button
              className="md:hidden p-2 hover:bg-muted rounded"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

          </div>
        </div>
      </div>
    </header>
  );
}
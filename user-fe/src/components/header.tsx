'use client';

import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useMe } from '@/modules/auth/api/get-auth-me';
// 👉 hooks
import {  useLogout } from '@/modules/auth/api/logout';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // 🔥 auth
  const { data: user } = useMe();
  const { mutate: logout } = useLogout();
  const cartCount = user?.cart?.itemCount ?? 0;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">

      {/* ===== TOP BAR ===== */}
      <div className="hidden md:block bg-primary text-primary-foreground py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>Miễn phí vận chuyển cho đơn hàng trên 500k đ</div>
          <div className="flex gap-6">
            <Link to="#" className="hover:opacity-80">Hỗ trợ khách hàng</Link>

            {user?.role === "SELLER" && (
              <Link to="/seller" className="hover:opacity-80">
                Seller Center
              </Link>
            )}

            {user?.role === "ADMIN" && (
              <Link to="/admin" className="hover:opacity-80">
                Admin
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ===== MAIN HEADER ===== */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-3 md:gap-6">

          {/* LOGO */}
          <Link to="/" className="shrink-0">
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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

          {/* MOBILE SEARCH */}
          <div className="flex-1 md:hidden">
            <button className="p-2 hover:bg-muted rounded">
              <Search size={20} />
            </button>
          </div>

          {/* ===== RIGHT SIDE ===== */}
          <div className="flex items-center gap-3 md:gap-4">

            {/* WISHLIST */}
            <button className="p-2 hover:bg-muted rounded hidden md:block relative">
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

            {/* ===== USER ===== */}
            {user ? (
              <div className="relative group flex items-center gap-2 cursor-pointer">

                <img
                  src={user.avatarUrl || "https://i.pravatar.cc/100"}
                  className="w-8 h-8 rounded-full object-cover"
                />

                <span className="hidden md:block text-sm font-medium">
                  {user.fullName || user.email.split("@")[0]}
                </span>

                {/* DROPDOWN */}
                <div className="absolute right-0 top-10 w-44 bg-white border rounded shadow hidden group-hover:block z-50">

                  <Link
                    to="/profile"
                    className="block px-4 py-2 hover:bg-muted"
                  >
                    Hồ sơ
                  </Link>

                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-muted"
                  >
                    Đơn hàng
                  </Link>

                  {user.role === "SELLER" && (
                    <Link
                      to="/seller"
                      className="block px-4 py-2 hover:bg-muted"
                    >
                      Seller Center
                    </Link>
                  )}

                  {user.role === "ADMIN" && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 hover:bg-muted"
                    >
                      Admin
                    </Link>
                  )}

                  <button
                    onClick={() => logout(undefined)}
                    className="w-full text-left px-4 py-2 hover:bg-muted text-red-500"
                  >
                    Đăng xuất
                  </button>
                </div>
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

        {/* ===== MOBILE MENU ===== */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 border-t pt-4 space-y-2">

            <Link to="/products" className="block px-4 py-2">
              Tất cả sản phẩm
            </Link>

            {user && (
              <>
                <Link to="/profile" className="block px-4 py-2">
                  Hồ sơ
                </Link>

                <button
                  onClick={() => logout(undefined)}
                  className="block px-4 py-2 text-red-500"
                >
                  Đăng xuất
                </button>
              </>
            )}

          </nav>
        )}
      </div>
    </header>
  );
}
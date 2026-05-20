"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, Menu, Search, ShoppingCart, User, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLogout } from "@/modules/auth/api/logout";
import { useMe } from "@/modules/auth/api/get-auth-me";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: user } = useMe();
  const { mutate: logout } = useLogout();
  const cartCount = user?.cart?.totalItems ?? user?.cart?.itemCount ?? 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = () => {
    const query = searchTerm.trim();
    navigate(query ? `/products?search=${encodeURIComponent(query)}` : "/products");
    setIsMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white">
      <div className="hidden bg-primary px-4 py-2 text-sm text-primary-foreground md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>Miễn phí vận chuyển cho đơn hàng trên 500k đ</div>

          <div className="flex gap-6">
            <Link to="#" className="hover:opacity-80">
              Hỗ trợ khách hàng
            </Link>

            {user ? (
              user.role === "SELLER" ? (
                <Link to="/seller/dashboard" className="hover:opacity-80">
                  Seller Center
                </Link>
              ) : (
                <Link to="/seller" className="hover:opacity-80">
                  Become Seller
                </Link>
              )
            ) : null}

            {user?.role === "ADMIN" ? (
              <Link to="/admin" className="hover:opacity-80">
                Admin
              </Link>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-3 md:py-4">
        <div className="flex items-center gap-2 md:gap-6">
          <Link to="/" className="shrink-0">
            <div className="bg-linear-to-r from-primary to-accent bg-clip-text text-xl font-bold text-transparent md:text-2xl">
              MarketHub
            </div>
          </Link>

          <div className="hidden max-w-2xl flex-1 md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="w-full pl-4 pr-12"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
              />

              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-primary p-2 text-white"
                aria-label="Tìm kiếm"
              >
                <Search size={16} />
              </button>
            </div>
          </div>

          <div className="ml-auto flex items-center gap-2 md:gap-4">
            <Link to="/wishlist" className="rounded p-2 hover:bg-muted" aria-label="Wishlist">
              <Heart size={20} />
            </Link>

            <Link to="/cart" className="relative rounded p-2 hover:bg-muted" aria-label="Giỏ hàng">
              <ShoppingCart size={20} />
              {cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-xs font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </Link>

            {user ? (
              <div ref={dropdownRef} className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen((value) => !value)}
                  className="flex items-center gap-2 rounded px-2 py-1 hover:bg-muted"
                >
                  <img
                    src={user.avatarUrl || "https://i.pravatar.cc/100"}
                    className="size-8 rounded-full object-cover"
                    alt={user.fullName || user.email}
                  />
                  <span className="hidden text-sm font-medium md:block">
                    {user.fullName || user.email.split("@")[0]}
                  </span>
                </button>

                {isDropdownOpen ? (
                  <div className="absolute right-0 top-12 z-50 w-48 overflow-hidden rounded-xl border bg-white shadow-lg">
                    <Link to="/profile" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-muted">
                      Hồ sơ
                    </Link>
                    <Link to="/orders" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-muted">
                      Đơn hàng
                    </Link>
                    <Link to="/returns" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-muted">
                      Đổi trả
                    </Link>
                    <Link to="/wishlist" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-muted">
                      Wishlist
                    </Link>

                    {user.role === "SELLER" ? (
                      <Link to="/seller/dashboard" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-muted">
                        Seller Center
                      </Link>
                    ) : (
                      <Link to="/seller" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-muted">
                        Kênh người bán
                      </Link>
                    )}

                    {user.role === "ADMIN" ? (
                      <Link to="/admin" onClick={() => setIsDropdownOpen(false)} className="block px-4 py-2 hover:bg-muted">
                        Admin
                      </Link>
                    ) : null}

                    <div className="border-t" />
                    <button
                      type="button"
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout(undefined);
                      }}
                      className="w-full px-4 py-2 text-left text-red-500 hover:bg-muted"
                    >
                      Đăng xuất
                    </button>
                  </div>
                ) : null}
              </div>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm" className="hidden gap-2 md:flex">
                  <User size={18} />
                  <span>Đăng nhập</span>
                </Button>
              </Link>
            )}

            <button
              type="button"
              className="rounded p-2 hover:bg-muted md:hidden"
              onClick={() => setIsMenuOpen((value) => !value)}
              aria-label="Mở menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {isMenuOpen ? (
          <div className="mt-3 space-y-3 md:hidden">
            <div className="relative">
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleSearch();
                  }
                }}
                placeholder="Tìm kiếm sản phẩm..."
                className="pr-11"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="absolute right-1 top-1/2 -translate-y-1/2 rounded bg-primary p-2 text-white"
                aria-label="Tìm kiếm"
              >
                <Search size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="rounded-lg border px-3 py-2">
                Sản phẩm
              </Link>
              <Link to="/promotions" onClick={() => setIsMenuOpen(false)} className="rounded-lg border px-3 py-2">
                Khuyến mãi
              </Link>
              <Link to="/wishlist" onClick={() => setIsMenuOpen(false)} className="rounded-lg border px-3 py-2">
                Wishlist
              </Link>
              <Link to={user?.role === "SELLER" ? "/seller/dashboard" : "/seller"} onClick={() => setIsMenuOpen(false)} className="rounded-lg border px-3 py-2">
                Kênh người bán
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  );
}

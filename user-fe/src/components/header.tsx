'use client';

import { Link } from 'react-router-dom';
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-border">
      {/* Top Bar */}
      <div className="hidden md:block bg-primary text-primary-foreground py-2 px-4 text-sm">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>Miễn phí vận chuyển cho đơn hàng trên 500k đ</div>
          <div className="flex gap-6">
            <Link to="#" className="hover:opacity-80 transition-opacity">Hỗ trợ khách hàng</Link>
            <Link to="#" className="hover:opacity-80 transition-opacity">Seller Center</Link>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex items-center gap-3 md:gap-6 mb-3 md:mb-0">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              MarketHub
            </div>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                className="w-full pl-4 pr-12 py-2 text-sm"
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground p-2 rounded hover:bg-primary/90 transition-colors">
                <Search size={16} />
              </button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="flex-1 md:hidden">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Search size={20} />
            </button>
          </div>

          {/* Icons */}
          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors relative hidden md:block">
              <Heart size={20} className="text-foreground" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
            </button>
            <Link to="/cart" className="p-2 hover:bg-muted rounded-lg transition-colors relative">
              <ShoppingCart size={20} className="text-foreground" />
              <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">0</span>
            </Link>
            <Button variant="outline" size="sm" className="gap-2 hidden md:flex">
              <User size={18} />
              <span>Tài khoản</span>
            </Button>
            <button
              className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Categories Navigation */}
        <nav className="hidden md:flex gap-6 overflow-x-auto pt-3">
          <Link to="/products" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Tất cả</Link>
          <Link to="/products?category=electronics" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Điện tử</Link>
          <Link to="/products?category=fashion" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Thời trang</Link>
          <Link to="/products?category=home" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Nhà</Link>
          <Link to="/products?category=sports" className="whitespace-nowrap text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Thể thao</Link>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 space-y-2 border-t border-border pt-4">
            <Link to="/products" className="block px-4 py-2 hover:bg-muted rounded-lg text-sm">Tất cả sản phẩm</Link>
            <Link to="/products?category=electronics" className="block px-4 py-2 hover:bg-muted rounded-lg text-sm">Điện tử</Link>
            <Link to="/products?category=fashion" className="block px-4 py-2 hover:bg-muted rounded-lg text-sm">Thời trang</Link>
            <Link to="/products?category=home" className="block px-4 py-2 hover:bg-muted rounded-lg text-sm">Nhà</Link>
            <Link to="/account" className="block px-4 py-2 hover:bg-muted rounded-lg text-sm">Tài khoản</Link>
          </nav>
        )}
      </div>
    </header>
  );
}

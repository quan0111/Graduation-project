'use client'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { Search, ShoppingCart, Menu, X } from 'lucide-react'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-border">

      <div className="bg-primary text-primary-foreground text-sm py-2">
        <div className="container flex justify-between items-center">
          <div>Giao hàng miễn phí cho đơn hàng trên 100.000đ</div>
          <div className="flex gap-4">
            <a href="#" className="hover:opacity-80">Trợ giúp</a>
            <a href="#" className="hover:opacity-80">Đăng nhập</a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="shrink-0">
            <div className="text-2xl font-bold text-primary">ShopHub</div>
          </Link>

          {/* Search bar - hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md">
            <div className="w-full flex items-center bg-gray-100 rounded-full px-4 py-2">
              <Search className="w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                className="bg-transparent ml-2 w-full outline-none text-sm"
              />
            </div>
          </div>

          {/* Cart icon */}
          <div className="flex items-center gap-3">
            <Link to="/admin/seed" className="text-xs text-gray-500 hover:text-gray-700 hidden lg:inline">
              Seed
            </Link>
            <Link to="/cart" className="relative">
              <ShoppingCart className="w-6 h-6 text-gray-700 hover:text-primary transition" />
              <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                0
              </span>
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden text-gray-700"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-3">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-2">
            <Search className="w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="bg-transparent ml-2 w-full outline-none text-sm"
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-border p-4">
          <nav className="flex flex-col gap-2">
            <Link to="/" className="px-4 py-2 hover:bg-gray-100 rounded">
              Trang chủ
            </Link>
            <Link to="/search" className="px-4 py-2 hover:bg-gray-100 rounded">
              Tìm kiếm
            </Link>
            <Link to="/cart" className="px-4 py-2 hover:bg-gray-100 rounded">
              Giỏ hàng
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}

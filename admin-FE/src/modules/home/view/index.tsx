import { ProductCard } from '../component/productCard'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  useEffect(() => {
    // MOCK DATA
    const mockCategories = [
      { id: 1, name: 'Điện thoại' },
      { id: 2, name: 'Laptop' },
      { id: 3, name: 'Phụ kiện' },
      { id: 4, name: 'Gaming' }
    ]

    const mockProducts = [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        image_url: 'https://via.placeholder.com/300',
        price: 25000000,
        original_price: 28000000,
        rating: 4.8,
        reviews_count: 120,
        category: 'Điện thoại'
      },
      {
        id: 2,
        name: 'MacBook Air M3',
        image_url: 'https://via.placeholder.com/300',
        price: 32000000,
        original_price: 35000000,
        rating: 4.9,
        reviews_count: 85,
        category: 'Laptop'
      },
      {
        id: 3,
        name: 'Tai nghe Sony WH-1000XM5',
        image_url: 'https://via.placeholder.com/300',
        price: 7000000,
        original_price: 8000000,
        rating: 4.7,
        reviews_count: 210,
        category: 'Phụ kiện'
      },
      {
        id: 4,
        name: 'Bàn phím cơ RGB',
        image_url: 'https://via.placeholder.com/300',
        price: 1500000,
        original_price: 2000000,
        rating: 4.6,
        reviews_count: 50,
        category: 'Gaming'
      }
    ]

    setCategories(mockCategories)
    setProducts(mockProducts)
    setLoading(false)
  }, [])

  const filteredProducts = selectedCategory
    ? products.filter((p) => p.category === selectedCategory)
    : products

  return (
    <div className="min-h-screen bg-surface">

      <div className="bg-linear-to-r from-primary to-primary/80 text-white py-12">
        <div className="container">
          <h1 className="text-4xl font-bold mb-2">Chào mừng đến ShopHub</h1>
          <p className="text-lg opacity-90">
            Khám phá hàng ngàn sản phẩm chất lượng cao
          </p>
        </div>
      </div>

      <div className="border-b border-border bg-white sticky top-16 z-40">
        <div className="container py-4">
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-full ${
                selectedCategory === null
                  ? 'bg-primary text-white'
                  : 'bg-gray-100'
              }`}
            >
              Tất cả
            </button>

            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.name)}
                className={`px-4 py-2 rounded-full ${
                  selectedCategory === category.name
                    ? 'bg-primary text-white'
                    : 'bg-gray-100'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products */}
      <div className="container py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {selectedCategory || 'Sản phẩm nổi bật'}
          </h2>

          <Link
            to="/search"
            className="text-primary hover:underline text-sm font-medium"
          >
            Xem tất cả →
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading...</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-12">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                image={product.image_url}
                price={product.price}
                originalPrice={product.original_price}
                rating={product.rating}
                reviewsCount={product.reviews_count}
                category={product.category}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
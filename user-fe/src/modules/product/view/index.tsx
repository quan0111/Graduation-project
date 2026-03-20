'use client'

import { useEffect, useState } from 'react'
import { getProductById, getRelatedProducts } from '../api'
import { ProductCard } from '../components/productcard'
import type { IProduct } from '../types'
import Image from 'next/image'
import { Star, ShoppingCart, Heart } from 'lucide-react'
import useCart
import { useFavorites } from '@/lib/hooks'
import { Button } from '@/components/ui/button'

interface ProductViewProps {
  productId: string
}

export function ProductView({ productId }: ProductViewProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [isFavorited, setIsFavorited] = useState(false)
  const { addItem } = useCart()
  const { addFavorite, removeFavorite, favorites } = useFavorites()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true)
        const productData = await getProductById(productId)
        
        if (!productData) {
          return
        }

        setProduct(productData)
        setIsFavorited(favorites.includes(productData.id))

        const related = await getRelatedProducts(productData.category, productId)
        setRelatedProducts(related)
      } catch (error) {
        console.error('[ProductView] Error fetching product:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId, favorites])

  const handleAddToCart = () => {
    if (!product) return
    addItem({
      product,
      quantity,
    })
  }

  const handleFavorite = () => {
    if (!product) return
    if (isFavorited) {
      removeFavorite(product.id)
    } else {
      addFavorite(product.id)
    }
    setIsFavorited(!isFavorited)
  }

  if (loading) {
    return <div className="text-center py-12">Đang tải...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Sản phẩm không tìm thấy</div>
  }

  const originalPrice = product.original_price ? parseInt(product.original_price) : null
  const currentPrice = parseInt(product.price)
  const discount = originalPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0

  return (
    <div className="space-y-8">
      {/* Product Detail */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative h-96 md:h-full bg-muted rounded-lg overflow-hidden">
          <Image
            src={product.image_url || '/placeholder.jpg'}
            alt={product.name}
            fill
            className="object-cover"
          />
          {discount > 0 && (
            <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
              -{discount}%
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div>
            <div className="text-sm text-muted-foreground mb-2">{product.category}</div>
            <h1 className="text-3xl font-bold text-foreground mb-4">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(product.rating || 4)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.reviews_count || 0} đánh giá
              </span>
            </div>

            {/* Price */}
            <div className="space-y-2 mb-6 pb-6 border-b border-border">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-primary">
                  {currentPrice.toLocaleString('vi-VN')}đ
                </span>
                {originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {originalPrice.toLocaleString('vi-VN')}đ
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b border-border">
              <h3 className="font-bold text-foreground mb-2">Mô tả sản phẩm</h3>
              <p className="text-muted-foreground">{product.description}</p>
            </div>

            {/* Stock */}
            <div className="mb-6 pb-6 border-b border-border">
              <p className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {product.stock > 0 ? `${product.stock} sản phẩm còn hàng` : 'Hết hàng'}
              </p>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-foreground font-medium">Số lượng:</span>
              <div className="flex items-center border border-border rounded-lg">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 hover:bg-muted"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stock}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center border-l border-r border-border outline-none"
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="px-4 py-2 hover:bg-muted"
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Thêm vào giỏ
              </Button>
              <Button
                onClick={handleFavorite}
                variant="outline"
                className="px-6"
              >
                <Heart
                  className="w-4 h-4"
                  fill={isFavorited ? 'currentColor' : 'none'}
                />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


import {Link} from 'react-router-dom'
import { Star } from 'lucide-react'

interface ProductCardProps {
  id: string
  name: string
  image: string
  price: number
  originalPrice?: number
  rating: number
  reviewsCount: number
  category: string
}

export function ProductCard({
  id,
  name,
  image,
  price,
  originalPrice,
  rating,
  reviewsCount,
  category,
}: ProductCardProps) {
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0

  return (
    <Link to={`/product/${id}`}>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition border border-border h-full flex flex-col">
        {/* Image container */}
        <div className="relative w-full aspect-square bg-gray-100 overflow-hidden group">
          < img
            src={image}
            alt={name}
            className="object-cover group-hover:scale-105 transition"
          />
          {discount > 0 && (
            <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded">
              -{discount}%
            </div>
          )}
        </div>

        <div className="p-3 flex-1 flex flex-col justify-between">
          <div>
            <p className="text-xs text-gray-500 mb-1">{category}</p>
            <h3 className="text-sm font-medium text-foreground line-clamp-2 mb-2">
              {name}
            </h3>
          </div>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.round(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">({reviewsCount})</span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {price.toLocaleString('vi-VN')}đ
            </span>
            {originalPrice && (
              <span className="text-xs text-gray-400 line-through">
                {originalPrice.toLocaleString('vi-VN')}đ
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

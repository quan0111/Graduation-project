'use client'

import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ICartItem } from '../types'
import { formatPrice } from '@/modules/product/utils/index'

interface CartItemComponentProps {
  item: ICartItem
  onQuantityChange: (quantity: number) => void
  onRemove: () => void
}

export function CartItemComponent({
  item,
  onQuantityChange,
  onRemove,
}: CartItemComponentProps) {
  const itemTotal = item.product.price * item.quantity

  return (
    <div className="flex gap-4 pb-4 border-b border-border last:border-b-0">
      {/* Product image */}
      <div className="relative w-24 h-24 flex-shrink-0">
        <img
          src={item.product.Images?.[0].url}
          alt={item.product.name}
          className="object-cover rounded-lg"
        />
      </div>

      {/* Product details */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-medium text-foreground line-clamp-2">
            {item.product.name}
          </h3>
          <p className="text-sm text-muted-foreground">{item.product.category_id}</p>
        </div>

        {/* Price and quantity */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-primary">
              {formatPrice(item.product.price)}
            </p>
            <p className="text-xs text-muted-foreground">
              Tổng: {formatPrice(itemTotal)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quantity controls */}
            <div className="flex items-center border border-border rounded">
              <button
                onClick={() => onQuantityChange(item.quantity - 1)}
                className="px-2 py-1 text-sm hover:bg-secondary"
              >
                -
              </button>
              <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
              <button
                onClick={() => onQuantityChange(item.quantity + 1)}
                className="px-2 py-1 text-sm hover:bg-secondary"
              >
                +
              </button>
            </div>

            {/* Remove button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={onRemove}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

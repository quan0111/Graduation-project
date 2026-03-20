'use client'

import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'
import { formatPrice } from '@/modules/product/utils/index'

interface CartSummaryProps {
  subtotal: number
  shippingFee?: number
  itemCount: number
}

export function CartSummary({
  subtotal,
  shippingFee = 0,
  itemCount,
}: CartSummaryProps) {
  const total = subtotal + shippingFee
  const isFreeShipping = subtotal >= 100000

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-bold mb-4 text-foreground">Tóm tắt đơn hàng</h3>

      <div className="space-y-3 border-b border-border pb-4 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Sản phẩm ({itemCount})</span>
          <span className="font-medium text-foreground">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Vận chuyển</span>
          {isFreeShipping ? (
            <span className="font-medium text-primary">Miễn phí</span>
          ) : (
            <span className="font-medium text-foreground">{formatPrice(shippingFee)}</span>
          )}
        </div>

        {isFreeShipping && subtotal > 0 && (
          <div className="text-xs text-primary bg-primary/10 p-2 rounded">
            ✓ Bạn được miễn phí vận chuyển
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-6 pt-4">
        <span className="text-lg font-bold text-foreground">Tổng cộng</span>
        <span className="text-2xl font-bold text-primary">{formatPrice(total)}</span>
      </div>

      <Link to="/checkout" className="w-full block">
        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-base h-10">
          Tiến tới thanh toán
        </Button>
      </Link>

      <Link to="/search" className="w-full block mt-3">
        <Button
          variant="outline"
          className="w-full text-base h-10"
        >
          Tiếp tục mua sắm
        </Button>
      </Link>
    </div>
  )
}

'use client'

import { Link } from 'react-router-dom'
import { CartItemComponent,CartSummary } from '../components'
import { useCart } from '@/modules/product/hooks/useCart'
import { Button } from '@/components/ui/button'
import { Empty,EmptyContent,EmptyDescription,EmptyHeader,EmptyTitle } from '@/components/ui/empty'

export function CartView() {
  const { cart, updateQuantity, removeItem, clearCart, isLoaded } = useCart()

  if (!isLoaded) {
    return (
      <div className="text-center py-12">Đang tải giỏ hàng...</div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-foreground">Giỏ hàng của bạn</h1>

      {cart.items.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Giỏ hàng trống</EmptyTitle>
            <EmptyDescription>
              Hãy thêm một số sản phẩm để tiếp tục mua sắm
            </EmptyDescription>
          </EmptyHeader>

          <EmptyContent>
            <Link to="/search">
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          </EmptyContent>
        </Empty>
        
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg border border-border overflow-hidden p-6 space-y-4">
              {cart.items.map((item) => (
                <CartItemComponent
                  key={item.id}
                  item={item}
                  onQuantityChange={(qty) => updateQuantity(item.product.id, qty)}
                  onRemove={() => removeItem(item.product.id)}
                />
              ))}
            </div>

            <Link to="/search" className="mt-6 inline-block">
              <Button variant="outline">← Tiếp tục mua sắm</Button>
            </Link>
          </div>

          {/* Order summary */}
          <div className="sticky top-24 h-fit">
            <CartSummary
              subtotal={cart.total}
              shippingFee={cart.total >= 100000 ? 0 : 25000}
              itemCount={cart.itemCount}
            />
            <Link to="/checkout" className="block mt-3">
              <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                Tiến hành thanh toán
              </Button>
            </Link>
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={clearCart}
            >
              Xóa giỏ hàng
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

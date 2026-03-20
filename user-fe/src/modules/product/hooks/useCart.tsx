import { useEffect, useState } from 'react'
import type { IProduct } from '../types'
import type { ICart,ICartItem } from '@/modules/cart/types'
import { getStorageItem, setStorageItem,STORAGE_KEYS,parsePrice } from '../utils'
/**
 * Hook to manage shopping cart
 */
export function useCart() {
  const [cart, setCart] = useState<ICart>({
    items: [],
    total: 0,
    itemCount: 0,
  })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = getStorageItem<ICartItem[]>(STORAGE_KEYS.CART, [])
    if (savedCart.length > 0) {
      updateCart(savedCart)
    }
    setIsLoaded(true)
  }, [])

  // Update cart calculations
  const updateCart = (items: ICartItem[]) => {
    const total = items.reduce(
      (sum, item) => sum + parsePrice(item.product.price) * item.quantity,
      0
    )
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    setCart({ items, total, itemCount })
    setStorageItem(STORAGE_KEYS.CART, items)
  }

  // Add item to cart
  const addItem = (product: IProduct, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.items?.find((item) => item.product.id === product.id)

      let newItems: ICartItem[]
      if (existingItem) {
        newItems = prevCart.items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        newItems = [
          ...prevCart.items,
          {
            id: `${product.id}-${Date.now()}`,
            product,
            quantity,
            addedAt: Date.now(),
            product_id: "",
          },
        ]
      }

      updateCart(newItems)
      return { ...prevCart, items: newItems }
    })
  }

  // Remove item from cart
  const removeItem = (productId: string) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.product.id !== productId)
      updateCart(newItems)
      return { ...prevCart, items: newItems }
    })
  }

  // Update quantity
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
      updateCart(newItems)
      return { ...prevCart, items: newItems }
    })
  }

  // Clear cart
  const clearCart = () => {
    setCart({ items: [], total: 0, itemCount: 0 })
    setStorageItem(STORAGE_KEYS.CART, [])
  }

  // Get cart items for checkout
  const getCheckoutItems = () => {
    return cart.items.map((item) => ({
      product_name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
    }))
  }

  return {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCheckoutItems,
    isLoaded,
  }
}

/**
 * Hook to manage cart quantity for a specific product
 */
export function useCartItem(productId: string) {
  const { cart, updateQuantity, removeItem } = useCart()

  const item = cart.items.find((item) => item.product.id === productId)

  return {
    quantity: item?.quantity || 0,
    updateQuantity: (qty: number) => updateQuantity(productId, qty),
    remove: () => removeItem(productId),
  }
}

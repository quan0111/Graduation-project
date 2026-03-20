/**
 * Format price to Vietnamese Dong format
 * @example formatPrice(100000) => "100,000đ"
 */
export function formatPrice(price: string | number): string {
  const numPrice = typeof price === 'string' ? parseInt(price, 10) : price
  if (isNaN(numPrice)) return '0đ'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(numPrice)
}

/**
 * Format date to Vietnamese format
 * @example formatDate("2024-01-15") => "15/01/2024"
 */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return dateString
  }
}

/**
 * Format date with time
 * @example formatDateTime("2024-01-15T10:30:00") => "15/01/2024 10:30"
 */
export function formatDateTime(dateString: string): string {
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateString
  }
}

/**
 * Generate order number
 * @example generateOrderNumber() => "ORD20240115123456"
 */
export function generateOrderNumber(): string {
  const date = new Date()
  const timestamp = date.getTime().toString().slice(-6)
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '')
  return `ORD${dateStr}${timestamp}`
}

/**
 * Calculate discount percentage
 * @example calculateDiscount(1000000, 800000) => 20
 */
export function calculateDiscount(
  originalPrice: number | string,
  salePrice: number | string
): number {
  const original = typeof originalPrice === 'string' ? parseInt(originalPrice, 10) : originalPrice
  const sale = typeof salePrice === 'string' ? parseInt(salePrice, 10) : salePrice
  if (original === 0) return 0
  return Math.round(((original - sale) / original) * 100)
}

/**
 * Truncate text with ellipsis
 * @example truncateText("Hello World", 5) => "Hello..."
 */
export function truncateText(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

/**
 * Validate email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number (Vietnamese format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+84|0)[0-9]{9,10}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

/**
 * Parse price string to number
 */
export function parsePrice(price: string | number): number {
  if (typeof price === 'number') return price
  return parseInt(price.replace(/[^0-9]/g, ''), 10) || 0
}

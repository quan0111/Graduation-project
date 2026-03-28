'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import type { ShopInfo } from '../types'

interface ShopInfoFormProps {
  data: ShopInfo
  onNext: (data: ShopInfo) => void
}

export function ShopInfoForm({ data, onNext }: ShopInfoFormProps) {
  const [formData, setFormData] = useState(data)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.shopName.trim()) newErrors.shopName = 'Tên shop là bắt buộc'
    if (!formData.pickupAddress.trim()) newErrors.pickupAddress = 'Địa chỉ lấy hàng là bắt buộc'
    if (!formData.city.trim()) newErrors.city = 'Thành phố là bắt buộc'
    if (!formData.district.trim()) newErrors.district = 'Quận/Huyện là bắt buộc'
    if (!formData.ward.trim()) newErrors.ward = 'Phường/Xã là bắt buộc'
    if (!formData.email.trim()) newErrors.email = 'Email là bắt buộc'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Email không hợp lệ'
    if (!formData.phone.trim()) newErrors.phone = 'Số điện thoại là bắt buộc'
    if (!/^(\+84|0)[0-9]{9,10}$/.test(formData.phone)) newErrors.phone = 'Số điện thoại không hợp lệ'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleNext = () => {
    if (validateForm()) {
      onNext(formData)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Thông tin Shop</h2>
        <p className="text-muted-foreground">Cung cấp thông tin cơ bản về cửa hàng của bạn</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6 space-y-4">
        {/* Shop Name */}
        <div>
          <Label htmlFor="shopName" className="text-foreground font-medium">
            Tên Shop <span className="text-red-500">*</span>
          </Label>
          <Input
            id="shopName"
            name="shopName"
            placeholder="Nhập tên shop của bạn"
            value={formData.shopName}
            onChange={handleChange}
            className="mt-2"
          />
          {errors.shopName && <p className="text-red-500 text-sm mt-1">{errors.shopName}</p>}
        </div>

        {/* Pickup Address */}
        <div>
          <Label htmlFor="pickupAddress" className="text-foreground font-medium">
            Địa chỉ lấy hàng <span className="text-red-500">*</span>
          </Label>
          <Input
            id="pickupAddress"
            name="pickupAddress"
            placeholder="Số nhà, đường phố"
            value={formData.pickupAddress}
            onChange={handleChange}
            className="mt-2"
          />
          {errors.pickupAddress && <p className="text-red-500 text-sm mt-1">{errors.pickupAddress}</p>}
        </div>

        {/* City, District, Ward */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city" className="text-foreground font-medium">
              Thành phố <span className="text-red-500">*</span>
            </Label>
            <Input
              id="city"
              name="city"
              placeholder="TPHCM"
              value={formData.city}
              onChange={handleChange}
              className="mt-2"
            />
            {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <Label htmlFor="district" className="text-foreground font-medium">
              Quận/Huyện <span className="text-red-500">*</span>
            </Label>
            <Input
              id="district"
              name="district"
              placeholder="Quận 1"
              value={formData.district}
              onChange={handleChange}
              className="mt-2"
            />
            {errors.district && <p className="text-red-500 text-sm mt-1">{errors.district}</p>}
          </div>
          <div>
            <Label htmlFor="ward" className="text-foreground font-medium">
              Phường/Xã <span className="text-red-500">*</span>
            </Label>
            <Input
              id="ward"
              name="ward"
              placeholder="Phường 1"
              value={formData.ward}
              onChange={handleChange}
              className="mt-2"
            />
            {errors.ward && <p className="text-red-500 text-sm mt-1">{errors.ward}</p>}
          </div>
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email" className="text-foreground font-medium">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="shop@example.com"
            value={formData.email}
            onChange={handleChange}
            className="mt-2"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone" className="text-foreground font-medium">
            Số điện thoại <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+84 9xx xxx xxx"
            value={formData.phone}
            onChange={handleChange}
            className="mt-2"
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Quay lại</Button>
        <Button onClick={handleNext} className="bg-primary text-primary-foreground">
          Tiếp theo
        </Button>
      </div>
    </div>
  )
}

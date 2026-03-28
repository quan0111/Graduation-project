'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import type { TaxInfo } from '../types'

interface TaxFormProps {
  initialData?: TaxInfo
  onSubmit: (data: TaxInfo) => void
  isLoading?: boolean
}

export function TaxForm({ initialData, onSubmit, isLoading = false }: TaxFormProps) {
  const [businessType, setBusinessType] = useState(initialData?.businessType || 'individual')
  const [businessPlace, setBusinessPlace] = useState(initialData?.businessRegistrationPlace || '')
  const [registeredEmail, setRegisteredEmail] = useState(initialData?.registeredEmail || '')
  const [taxNumber, setTaxNumber] = useState(initialData?.taxNumber || '')
  const [codEnabled, setCodEnabled] = useState(initialData?.codEnabled ?? true)
  const [dailyEnabled, setDailyEnabled] = useState(initialData?.dailyDeliveryEnabled ?? true)
  const [expressEnabled, setExpressEnabled] = useState(initialData?.expressDeliveryEnabled ?? true)
  const [instantEnabled, setInstantEnabled] = useState(initialData?.instantDeliveryEnabled ?? false)
  const [bnplEnabled, setBnplEnabled] = useState(initialData?.buyNowPayLaterEnabled ?? false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!businessPlace.trim()) newErrors.businessPlace = 'Vui lòng nhập địa chỉ đăng ký kinh doanh'
    if (!registeredEmail.trim()) newErrors.registeredEmail = 'Vui lòng nhập email đăng ký'
    if (!taxNumber.trim()) newErrors.taxNumber = 'Vui lòng nhập mã số thuế'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        businessType: businessType as 'individual' | 'household' | 'company',
        businessRegistrationPlace: businessPlace,
        registeredEmail,
        taxNumber,
        codEnabled,
        dailyDeliveryEnabled: dailyEnabled,
        expressDeliveryEnabled: expressEnabled,
        instantDeliveryEnabled: instantEnabled,
        buyNowPayLaterEnabled: bnplEnabled,
      })
    }
  }

  return (
    <div className="space-y-8">
      {/* Business Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4">Loại hình kinh doanh <span className="text-destructive">*</span></h3>
        <RadioGroup value={businessType} onValueChange={setBusinessType} disabled={isLoading}>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="individual" id="individual" />
            <label htmlFor="individual" className="cursor-pointer text-foreground">Cá nhân</label>
          </div>
          <div className="flex items-center space-x-2 mb-3">
            <RadioGroupItem value="household" id="household" />
            <label htmlFor="household" className="cursor-pointer text-foreground">Hộ kinh doanh</label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="company" id="company" />
            <label htmlFor="company" className="cursor-pointer text-foreground">Công ty</label>
          </div>
        </RadioGroup>
      </div>

      {/* Business Registration Place */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Địa chỉ đăng ký kinh doanh <span className="text-destructive">*</span>
        </label>
        <textarea
          placeholder="Nhập đầy đủ địa chỉ đăng ký kinh doanh"
          value={businessPlace}
          onChange={(e) => setBusinessPlace(e.target.value)}
          disabled={isLoading}
          className="w-full border border-border rounded-lg p-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          rows={3}
        />
        {errors.businessPlace && <p className="text-destructive text-sm mt-1">{errors.businessPlace}</p>}
      </div>

      {/* Registered Email */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Email nhân hóa đơn điện tử <span className="text-destructive">*</span>
        </label>
        <Input
          type="email"
          placeholder="Nhập email"
          value={registeredEmail}
          onChange={(e) => setRegisteredEmail(e.target.value)}
          disabled={isLoading}
          className="border-border"
        />
        {errors.registeredEmail && <p className="text-destructive text-sm mt-1">{errors.registeredEmail}</p>}
      </div>

      {/* Tax Number */}
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Mã số thuế <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="Nhập mã số thuế"
          value={taxNumber}
          onChange={(e) => setTaxNumber(e.target.value)}
          disabled={isLoading}
          className="border-border"
        />
        <p className="text-xs text-muted-foreground mt-1">Mã số thuế là mã số thuế kinh doanh</p>
        {errors.taxNumber && <p className="text-destructive text-sm mt-1">{errors.taxNumber}</p>}
      </div>

      {/* Service Settings */}
      <div className="border-t border-border pt-8">
        <h3 className="text-lg font-semibold text-foreground mb-6">Cài đặt dịch vụ</h3>

        {/* COD */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Hóa Tốc (COD đã được kích hoạt)</p>
            <p className="text-sm text-muted-foreground mt-1">Cho phép khách hàng thanh toán khi nhận hàng</p>
          </div>
          <Switch
            checked={codEnabled}
            onCheckedChange={setCodEnabled}
            disabled={isLoading}
          />
        </div>

        {/* Daily Delivery */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Giao Hàng Trong Ngày</p>
            <p className="text-sm text-muted-foreground mt-1">Cho phép giao hàng trong cùng ngày</p>
          </div>
          <Switch
            checked={dailyEnabled}
            onCheckedChange={setDailyEnabled}
            disabled={isLoading}
          />
        </div>

        {/* Express Delivery */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Giao Hàng Nhanh</p>
            <p className="text-sm text-muted-foreground mt-1">Cho phép giao hàng nhanh chóng</p>
          </div>
          <Switch
            checked={expressEnabled}
            onCheckedChange={setExpressEnabled}
            disabled={isLoading}
          />
        </div>

        {/* Instant Delivery */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-border">
          <div>
            <p className="font-medium text-foreground">Giao Hàng Tức Thì</p>
            <p className="text-sm text-muted-foreground mt-1">Cho phép giao hàng tức thì (nếu có sẵn)</p>
          </div>
          <Switch
            checked={instantEnabled}
            onCheckedChange={setInstantEnabled}
            disabled={isLoading}
          />
        </div>

        {/* Buy Now Pay Later */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Mua Ngay Trả Sau</p>
            <p className="text-sm text-muted-foreground mt-1">Cho phép khách hàng mua hàng trước trả tiền sau</p>
          </div>
          <Switch
            checked={bnplEnabled}
            onCheckedChange={setBnplEnabled}
            disabled={isLoading}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-secondary/10 border border-secondary rounded-lg p-4">
        <p className="text-sm text-foreground">
          Tôi xác nhận rằng tất cả dữ liệu đã cung cấp là chính xác và trung thực. Tôi đã đọc và đồng ý với Chính sách Bảo Mật của ShopHub.
        </p>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" disabled={isLoading}>
          Quay lại
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Hoàn tất'}
        </Button>
      </div>
    </div>
  )
}

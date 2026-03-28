'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { TaxInfo } from '../types'

interface ShippingSettingsProps {
  data: TaxInfo
  onNext: (data: TaxInfo) => void
  onPrev: () => void
}

export function ShippingSettings({ data, onNext, onPrev }: ShippingSettingsProps) {
  const [formData, setFormData] = useState(data)

  const handleNext = () => {
    onNext(formData)
  }

  const handleToggle = (field: keyof TaxInfo) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }))
  }

  const shippingOptions = [
    {
      id: 'codEnabled',
      label: 'COD (Thanh toán khi nhận)',
      description: 'Cho phép khách hàng thanh toán khi nhận hàng',
    },
    {
      id: 'dailyDeliveryEnabled',
      label: 'Giao hàng Hôm Nay',
      description: 'Giao hàng trong cùng ngày cho các đơn hàng phù hợp',
    },
    {
      id: 'expressDeliveryEnabled',
      label: 'Giao hàng Nhanh',
      description: 'Giao hàng nhanh trong 1-2 ngày',
    },
    {
      id: 'instantDeliveryEnabled',
      label: 'Giao hàng Tức Thì',
      description: 'Giao hàng trong vòng 30 phút đến 2 giờ',
    },
    {
      id: 'buyNowPayLaterEnabled',
      label: 'Mua Ngay Trả Sau',
      description: 'Cho phép khách hàng trả tiền sau khi nhận hàng',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Cài đặt Vận chuyển</h2>
        <p className="text-muted-foreground">Chọn các phương thức giao hàng mà shop của bạn hỗ trợ</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-6">
        <div className="space-y-4">
          {shippingOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-start gap-4 p-4 border border-border rounded-lg hover:bg-secondary transition"
            >
              <Checkbox
                id={option.id}
                checked={formData[option.id as keyof TaxInfo] as boolean}
                onCheckedChange={() => handleToggle(option.id as keyof TaxInfo)}
                className="mt-1"
              />
              <div className="flex-1">
                <Label
                  htmlFor={option.id}
                  className="text-foreground font-medium cursor-pointer block mb-1"
                >
                  {option.label}
                </Label>
                <p className="text-muted-foreground text-sm">{option.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-900">
            💡 <strong>Gợi ý:</strong> Kích hoạt nhiều phương thức giao hàng sẽ giúp bạn nhận được nhiều đơn hàng hơn. Khách hàng sẽ lựa chọn phương thức phù hợp với nhu cầu của họ.
          </p>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrev}>
          ← Quay lại
        </Button>
        <Button onClick={handleNext} className="bg-primary text-primary-foreground">
          Tiếp theo →
        </Button>
      </div>
    </div>
  )
}

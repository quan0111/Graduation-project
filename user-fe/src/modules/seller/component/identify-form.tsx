
import { useState } from 'react'
import {  Camera } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { IdentityInfo } from '../types'

interface IdentityFormProps {
  initialData?: IdentityInfo
  onSubmit: (data: IdentityInfo) => void
  onPrev?: () => void
  isLoading?: boolean
}

export function IdentityForm({ initialData, onSubmit, onPrev, isLoading = false }: IdentityFormProps) {
  const [fullName, setFullName] = useState(initialData?.fullName || '')
  const [cccdNumber, setCccdNumber] = useState(initialData?.cccdNumber || '')
  const [cccdFrontPreview, setCccdFrontPreview] = useState<string | null>(null)
  const [cccdBackPreview, setCccdBackPreview] = useState<string | null>(null)
  const [cccdFrontFile, setCccdFrontFile] = useState<File | null>(initialData?.cccdFrontImage || null)
  const [cccdBackFile, setCccdBackFile] = useState<File | null>(initialData?.cccdBackImage || null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isFront: boolean) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setErrors(prev => ({ ...prev, [isFront ? 'cccdFront' : 'cccdBack']: 'Vui lòng chọn file ảnh' }))
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      if (isFront) {
        setCccdFrontPreview(reader.result as string)
        setCccdFrontFile(file)
      } else {
        setCccdBackPreview(reader.result as string)
        setCccdBackFile(file)
      }
    }
    reader.readAsDataURL(file)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!fullName.trim()) newErrors.fullName = 'Vui lòng nhập họ tên'
    if (!cccdNumber.trim()) newErrors.cccdNumber = 'Vui lòng nhập số CCCD'
    if (!cccdFrontFile) newErrors.cccdFront = 'Vui lòng tải ảnh mặt trước CCCD'
    if (!cccdBackFile) newErrors.cccdBack = 'Vui lòng tải ảnh mặt sau CCCD'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validate()) {
      onSubmit({
        fullName,
        cccdNumber,
        cccdFrontImage: cccdFrontFile,
        cccdBackImage: cccdBackFile,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Họ và Tên <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="Nhập họ tên đầy đủ"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          disabled={isLoading}
          className="border-border"
        />
        {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}
      </div>

      <div>
        <label className="block text-sm font-semibold text-foreground mb-2">
          Số CCCD <span className="text-destructive">*</span>
        </label>
        <Input
          placeholder="Nhập số CCCD (12 chữ số)"
          value={cccdNumber}
          onChange={(e) => setCccdNumber(e.target.value.replace(/\D/g, '').slice(0, 12))}
          disabled={isLoading}
          className="border-border"
          maxLength={12}
        />
        {errors.cccdNumber && <p className="text-destructive text-sm mt-1">{errors.cccdNumber}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CCCD Front */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            CCCD Mặt Trước <span className="text-destructive">*</span>
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition cursor-pointer relative overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, true)}
              disabled={isLoading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {cccdFrontPreview ? (
              <div className="space-y-2">
                <div className="relative h-40 w-full">
                  <img
                    src={cccdFrontPreview}
                    alt="CCCD mặt trước"
                    className="object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCccdFrontPreview(null)}
                  className="text-primary text-sm hover:underline"
                >
                  Thay đổi ảnh
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Tải ảnh lên</p>
                <p className="text-xs text-muted-foreground">Chọn hoặc kéo thả ảnh</p>
              </div>
            )}
          </div>
          {errors.cccdFront && <p className="text-destructive text-sm mt-1">{errors.cccdFront}</p>}
        </div>

        {/* CCCD Back */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            CCCD Mặt Sau <span className="text-destructive">*</span>
          </label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition cursor-pointer relative overflow-hidden">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, false)}
              disabled={isLoading}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            {cccdBackPreview ? (
              <div className="space-y-2">
                <div className="relative h-40 w-full">
                  <img
                    src={cccdBackPreview}
                    alt="CCCD mặt sau"
                    className="object-contain"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setCccdBackPreview(null)}
                  className="text-primary text-sm hover:underline"
                >
                  Thay đổi ảnh
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Camera className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm font-medium">Tải ảnh lên</p>
                <p className="text-xs text-muted-foreground">Chọn hoặc kéo thả ảnh</p>
              </div>
            )}
          </div>
          {errors.cccdBack && <p className="text-destructive text-sm mt-1">{errors.cccdBack}</p>}
        </div>
      </div>

      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={onPrev} disabled={isLoading}>
          Quay lại
        </Button>
        <Button onClick={handleSubmit} disabled={isLoading}>
          {isLoading ? 'Đang xử lý...' : 'Tiếp theo'}
        </Button>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { StepIndicator } from '../../component/step-indicator'
import { ShopInfoForm } from '../../component/shop-info'
import { ShippingSettings } from '../../component/shipp-setting'
import { IdentityForm } from '../../component/identify-form'
import { TaxForm } from '../../component/tax-form'
import { Button } from '@/components/ui/button'

import { useApplySeller } from "@/modules/seller/api/apply"
import { toast } from "sonner"

import type { ShopInfo, IdentityInfo, TaxInfo, SellerRegistration } from '../../types'

type RegistrationStep = 'shop-info' | 'shipping' | 'identity' | 'tax' | 'complete'

const STEPS: { id: RegistrationStep; label: string }[] = [
  { id: 'shop-info', label: 'Thông tin Shop' },
  { id: 'shipping', label: 'Cài đặt vận chuyển' },
  { id: 'identity', label: 'Thông tin định danh' },
  { id: 'tax', label: 'Thông tin thuế' },
  { id: 'complete', label: 'Hoàn tất' },
]

export function SellerRegistrationView() {
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('shop-info')
  const [completedSteps, setCompletedSteps] = useState<RegistrationStep[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const applyMutation = useApplySeller()

  const [registration, setRegistration] = useState<SellerRegistration>({
    shopInfo: {
      shopName: '',
      pickupAddress: '',
      city: '',
      district: '',
      ward: '',
      email: '',
      phone: '',
    },
    identityInfo: {
      fullName: '',
      cccdFrontImage: null,
      cccdBackImage: null,
      cccdNumber: '',
    },
    taxInfo: {
      businessType: 'individual',
      businessRegistrationPlace: '',
      registeredEmail: '',
      taxNumber: '',
      codEnabled: true,
      dailyDeliveryEnabled: true,
      expressDeliveryEnabled: true,
      instantDeliveryEnabled: false,
      buyNowPayLaterEnabled: false,
    },
    currentStep: 'shop-info',
  })

  // ================= STEP HANDLERS =================

  const handleShopInfoSubmit = (data: ShopInfo) => {
    setRegistration(prev => ({ ...prev, shopInfo: data }))
    setCompletedSteps(prev => ([...new Set([...prev, 'shop-info'])] as RegistrationStep[]))
    setCurrentStep('shipping')
  }

  const handleShippingNext = (data: TaxInfo) => {
    setRegistration(prev => ({ ...prev, taxInfo: data }))
    setCompletedSteps(prev => ([...new Set([...prev, 'shipping'])] as RegistrationStep[]))
    setCurrentStep('identity')
  }

  const handleIdentitySubmit = (data: IdentityInfo) => {
    setRegistration(prev => ({ ...prev, identityInfo: data }))
    setCompletedSteps(prev => ([...new Set([...prev, 'identity'])] as RegistrationStep[]))
    setCurrentStep('tax')
  }

  const handleTaxSubmit = (data: TaxInfo) => {
    setRegistration(prev => ({ ...prev, taxInfo: data }))
    setCompletedSteps(prev => ([...new Set([...prev, 'tax'])] as RegistrationStep[]))
    setCurrentStep('complete')
  }

  const handlePrevStep = () => {
    if (currentStep === 'shipping') setCurrentStep('shop-info')
    else if (currentStep === 'identity') setCurrentStep('shipping')
    else if (currentStep === 'tax') setCurrentStep('identity')
  }

  // ================= 🔥 CALL API (FIXED) =================

  const handleComplete = async () => {
    try {
      setIsLoading(true)

      const payload = {
        // shop
        shopName: registration.shopInfo.shopName,

        // contact
        businessPhone: registration.shopInfo.phone,
        businessEmail: registration.shopInfo.email,

        // address
        addressLine: registration.shopInfo.pickupAddress,
        ward: registration.shopInfo.ward,
        district: registration.shopInfo.district,
        province: registration.shopInfo.city,

        // tax
        taxCode: registration.taxInfo.taxNumber,
      }

      console.log("🚀 payload:", payload)

      const userId = 1 // TODO: replace bằng auth user

      await applyMutation.mutateAsync({
        data: payload,
        userId,
      })

      toast.success("Đăng ký thành công 🎉")

      setCompletedSteps(prev => (
        [...new Set([...prev, 'complete'])] as RegistrationStep[]
      ))

    } catch (err: any) {
      console.error(err)
      toast.error(err?.response?.data?.detail || "Đăng ký thất bại ❌")
    } finally {
      setIsLoading(false)
    }
  }

  // ================= UI =================

  return (
    <div className="min-h-screen bg-background">

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-2">
              Đăng ký trở thành Người bán ShopHub
            </h1>
            <p className="text-muted-foreground">
              Hoàn thành các bước dưới đây để bắt đầu kinh doanh
            </p>
          </div>

          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          <div className="bg-card rounded-lg border p-8">

            {currentStep === 'shop-info' && (
              <ShopInfoForm data={registration.shopInfo} onNext={handleShopInfoSubmit} />
            )}

            {currentStep === 'shipping' && (
              <ShippingSettings
                data={registration.taxInfo}
                onNext={handleShippingNext}
                onPrev={handlePrevStep}
              />
            )}

            {currentStep === 'identity' && (
              <IdentityForm
                initialData={registration.identityInfo}
                onSubmit={handleIdentitySubmit}
                isLoading={isLoading}
              />
            )}

            {currentStep === 'tax' && (
              <TaxForm
                initialData={registration.taxInfo}
                onSubmit={handleTaxSubmit}
                isLoading={isLoading}
              />
            )}

            {currentStep === 'complete' && (
              <div className="text-center py-12">

                <h2 className="text-2xl font-bold mb-4">
                  Xác nhận đăng ký
                </h2>

                <p className="mb-6 text-muted-foreground">
                  Nhấn hoàn tất để gửi yêu cầu đăng ký seller
                </p>

                <Button
                  onClick={handleComplete}
                  disabled={isLoading}
                >
                  {isLoading ? "Đang gửi..." : "Hoàn tất"}
                </Button>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
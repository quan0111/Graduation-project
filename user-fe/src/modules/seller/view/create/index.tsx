'use client'

import { useState } from 'react'
import { StepIndicator } from '../../component/step-indicator'
import { ShopInfoForm } from '../../component/shop-info'
import { ShippingSettings } from '../../component/shipp-setting'
import { IdentityForm } from '../../component/identify-form'
import { TaxForm } from '../../component/tax-form'
import { Button } from '@/components/ui/button'
import type { RegistrationStep, SellerRegistration, IdentityInfo, TaxInfo, ShopInfo } from '../../types'

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

  const handleShopInfoSubmit = (data: ShopInfo) => {
    setIsLoading(true)
    setTimeout(() => {
      setRegistration(prev => ({
        ...prev,
        shopInfo: data,
      }))
      setCompletedSteps(prev => [...new Set<RegistrationStep>([...prev, 'shop-info'])])
      setCurrentStep('shipping')
      setIsLoading(false)
    }, 500)
  }

  const handleShippingNext = (data: TaxInfo) => {
    setIsLoading(true)
    setTimeout(() => {
      setRegistration(prev => ({
        ...prev,
        taxInfo: data,
      }))
      setCompletedSteps(prev => [...new Set<RegistrationStep>([...prev, 'shipping'])])
      setCurrentStep('identity')
      setIsLoading(false)
    }, 500)
  }

  const handleIdentitySubmit = (data: IdentityInfo) => {
    setIsLoading(true)
    setTimeout(() => {
      setRegistration(prev => ({
        ...prev,
        identityInfo: data,
      }))
      setCompletedSteps(prev => [...new Set<RegistrationStep>([...prev, 'identity'])])
      setCurrentStep('tax')
      setIsLoading(false)
    }, 500)
  }

  const handleTaxSubmit = (data: TaxInfo) => {
    setIsLoading(true)
    setTimeout(() => {
      setRegistration(prev => ({
        ...prev,
        taxInfo: data,
      }))
      setCompletedSteps(prev => [...new Set<RegistrationStep>([...prev, 'tax'])])
      setCurrentStep('complete')
      setIsLoading(false)
    }, 500)
  }

  const handlePrevStep = () => {
    if (currentStep === 'shipping') setCurrentStep('shop-info')
    else if (currentStep === 'identity') setCurrentStep('shipping')
    else if (currentStep === 'tax') setCurrentStep('identity')
  }

  const handleComplete = async () => {
    // Here you would typically send the registration data to your backend
    console.log('Registration complete:', registration)
    
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      setCompletedSteps(prev => [...new Set<RegistrationStep>([...prev, 'complete'])])
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-background">

      <div className="container py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground mb-2">Đăng ký trở thành Người bán ShopHub</h1>
            <p className="text-muted-foreground">Hoàn thành các bước dưới đây để bắt đầu kinh doanh</p>
          </div>

          {/* Step Indicator */}
          <StepIndicator steps={STEPS} currentStep={currentStep} completedSteps={completedSteps} />

          {/* Step Content */}
          <div className="bg-card rounded-lg border border-border p-8">
            {/* Shop Info Step */}
            {currentStep === 'shop-info' && (
              <ShopInfoForm data={registration.shopInfo} onNext={handleShopInfoSubmit} />
            )}

            {/* Shipping Step */}
            {currentStep === 'shipping' && (
              <ShippingSettings data={registration.taxInfo} onNext={handleShippingNext} onPrev={handlePrevStep} />
            )}

            {/* Identity Step */}
            {currentStep === 'identity' && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-6">Thông tin định danh</h2>
                <p className="text-muted-foreground mb-8">
                  Vui lòng cung cấp thông tin định danh của bạn. Ảnh CCCD phải rõ ràng và dễ đọc.
                </p>
                <IdentityForm
                  initialData={registration.identityInfo}
                  onSubmit={handleIdentitySubmit}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Tax Step */}
            {currentStep === 'tax' && (
              <div>
                <TaxForm
                  initialData={registration.taxInfo}
                  onSubmit={handleTaxSubmit}
                  isLoading={isLoading}
                />
              </div>
            )}

            {/* Complete Step */}
            {currentStep === 'complete' && (
              <div className="text-center py-12">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                    <svg className="w-10 h-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Đăng ký thành công!</h2>
                <p className="text-muted-foreground mb-8">
                  Cảm ơn bạn đã đăng ký. Hệ thống của chúng tôi sẽ xác minh thông tin của bạn trong 24-48 giờ.
                  Bạn sẽ nhận được email thông báo khi tài khoản được kích hoạt.
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Số điện thoại hỗ trợ: <span className="font-semibold text-foreground">1900 1234</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Email hỗ trợ: <span className="font-semibold text-foreground">seller@shophub.com</span>
                  </p>
                </div>
                <Button className="mt-8">Quay về Trang chủ</Button>
              </div>
            )}


          </div>
        </div>
      </div>
    </div>
  )
}

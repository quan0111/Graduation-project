'use client'

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock3, Store, UserRound } from 'lucide-react'
import { toast } from "sonner"

import { Button } from '@/components/ui/button'
import { useMe } from "@/modules/auth/api/get-auth-me"
import { useApplySeller } from "@/modules/seller/api/apply"
import { useGetMySeller } from "@/modules/seller/api/get-my-application"
import { IdentityForm } from '../../component/identify-form'
import { ShippingSettings } from '../../component/shipp-setting'
import { ShopInfoForm } from '../../component/shop-info'
import { StepIndicator } from '../../component/step-indicator'
import { TaxForm } from '../../component/tax-form'
import type {
  IdentityInfo,
  SellerRegistration,
  ShopInfo,
  TaxInfo,
} from '../../types'

type RegistrationStep =
  | 'shop-info'
  | 'shipping'
  | 'identity'
  | 'tax'
  | 'complete'

const STEPS: { id: RegistrationStep; label: string }[] = [
  { id: 'shop-info', label: 'Thong tin Shop' },
  { id: 'shipping', label: 'Cai dat van chuyen' },
  { id: 'identity', label: 'Thong tin dinh danh' },
  { id: 'tax', label: 'Thong tin thue' },
  { id: 'complete', label: 'Hoan tat' },
]

export function SellerRegistrationView() {
  const navigate = useNavigate()
  const { data: user, isLoading: isUserLoading } = useMe()
  const { data: application } = useGetMySeller(!!user)
  const applyMutation = useApplySeller()

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

  useEffect(() => {
    if (user?.role === "SELLER") {
      navigate("/seller/dashboard", { replace: true })
    }
  }, [navigate, user])

  const markStepCompleted = (step: RegistrationStep) => {
    setCompletedSteps((previous) => [...new Set([...previous, step])] as RegistrationStep[])
  }

  const handleShopInfoSubmit = (data: ShopInfo) => {
    setRegistration((previous) => ({ ...previous, shopInfo: data }))
    markStepCompleted('shop-info')
    setCurrentStep('shipping')
  }

  const handleShippingNext = (data: TaxInfo) => {
    setRegistration((previous) => ({ ...previous, taxInfo: data }))
    markStepCompleted('shipping')
    setCurrentStep('identity')
  }

  const handleIdentitySubmit = (data: IdentityInfo) => {
    setRegistration((previous) => ({ ...previous, identityInfo: data }))
    markStepCompleted('identity')
    setCurrentStep('tax')
  }

  const handleTaxSubmit = (data: TaxInfo) => {
    setRegistration((previous) => ({ ...previous, taxInfo: data }))
    markStepCompleted('tax')
    setCurrentStep('complete')
  }

  const handlePrevStep = () => {
    if (currentStep === 'shipping') setCurrentStep('shop-info')
    if (currentStep === 'identity') setCurrentStep('shipping')
    if (currentStep === 'tax') setCurrentStep('identity')
  }

  const handleComplete = async () => {
    if (!user) {
      toast.error("Vui long dang nhap")
      navigate("/login")
      return
    }

    try {
      setIsLoading(true)

      const payload = {
        shopName: registration.shopInfo.shopName,
        businessPhone: registration.shopInfo.phone,
        businessEmail: registration.shopInfo.email,
        addressLine: registration.shopInfo.pickupAddress,
        ward: registration.shopInfo.ward,
        district: registration.shopInfo.district,
        province: registration.shopInfo.city,
        taxCode: registration.taxInfo.taxNumber,
      }

      await applyMutation.mutateAsync({ data: payload })
      markStepCompleted('complete')
      toast.success("Gui yeu cau mo shop thanh cong")
      navigate("/seller", { replace: true })
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Dang ky that bai")
    } finally {
      setIsLoading(false)
    }
  }

  if (isUserLoading) {
    return <div className="p-8">Dang tai...</div>
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-[32px] border bg-card p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
            <UserRound className="size-8" />
          </div>
          <h1 className="text-3xl font-semibold">Dang nhap de tro thanh nguoi ban</h1>
          <p className="mt-3 text-muted-foreground">
            Chi tai khoan da dang nhap moi co the gui yeu cau mo shop va bat dau dang san pham.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/login">
              <Button>Dang nhap</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline">Tao tai khoan</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (application?.status === "PENDING") {
    return (
      <div className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-[32px] border bg-card p-10 shadow-sm">
          <div className="mb-5 flex size-16 items-center justify-center rounded-3xl bg-amber-100 text-amber-700">
            <Clock3 className="size-8" />
          </div>
          <h1 className="text-3xl font-semibold">Yeu cau mo shop dang cho duyet</h1>
          <p className="mt-3 text-muted-foreground">
            Shop <span className="font-medium text-foreground">{application.shopName}</span> da duoc gui len admin.
            Khi duoc phe duyet, role cua ban se doi sang seller va ban se vao dashboard nguoi ban.
          </p>
          <div className="mt-8 flex gap-3">
            <Link to="/">
              <Button variant="outline">Ve trang chu</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (application?.status === "APPROVED") {
    return (
      <div className="min-h-screen bg-background px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-[32px] border bg-card p-10 shadow-sm">
          <div className="mb-5 flex size-16 items-center justify-center rounded-3xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 className="size-8" />
          </div>
          <h1 className="text-3xl font-semibold">Shop da duoc phe duyet</h1>
          <p className="mt-3 text-muted-foreground">
            Ban da co quyen seller. Neu chua duoc chuyen huong, hay vao dashboard de bat dau dang san pham.
          </p>
          <div className="mt-8">
            <Link to="/seller/dashboard">
              <Button>
                <Store className="size-4" />
                Vao seller dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-12 text-center">
            <h1 className="mb-2 text-3xl font-bold">Dang ky tro thanh Nguoi ban ShopHub</h1>
            <p className="text-muted-foreground">
              Hoan thanh cac buoc duoi day de gui yeu cau mo shop.
            </p>
          </div>

          <StepIndicator
            steps={STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />

          <div className="rounded-lg border bg-card p-8">
            {currentStep === 'shop-info' && (
              <ShopInfoForm
                data={registration.shopInfo}
                onNext={handleShopInfoSubmit}
              />
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
              <div className="py-12 text-center">
                <h2 className="mb-4 text-2xl font-bold">Xac nhan dang ky</h2>
                <p className="mb-6 text-muted-foreground">
                  Nhan hoan tat de gui yeu cau dang ky seller.
                </p>
                <Button onClick={handleComplete} disabled={isLoading}>
                  {isLoading ? "Dang gui..." : "Hoan tat"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

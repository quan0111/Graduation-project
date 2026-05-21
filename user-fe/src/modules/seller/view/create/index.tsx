'use client'

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, Clock3, Store, UserRound, ArrowLeft, ShieldCheck, Rocket } from 'lucide-react'
import { toast } from "sonner"

import { Button } from '@/components/ui/button'
import { useMe } from "@/modules/auth/api/get-auth-me"
import { useApplySeller } from "@/modules/seller/api/apply"
import { useGetMySeller } from "@/modules/seller/api/get-my-application"
import { uploadImage } from "@/modules/upload/api/upload-image"
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
  RegistrationStep,
} from '../../types'


const STEPS: { id: RegistrationStep; label: string }[] = [
  { id: 'shop-info', label: 'Cửa hàng' },
  { id: 'shipping', label: 'Vận chuyển' },
  { id: 'identity', label: 'Định danh' },
  { id: 'tax', label: 'Thuế' },
  { id: 'complete', label: 'Hoàn tất' },
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
    setRegistration((previous) => ({ ...previous, taxInfo: { ...previous.taxInfo, ...data } }))
    markStepCompleted('tax')
    setCurrentStep('complete')
  }

  const handlePrevStep = () => {
    if (currentStep === 'shipping') setCurrentStep('shop-info')
    if (currentStep === 'identity') setCurrentStep('shipping')
    if (currentStep === 'tax') setCurrentStep('identity')
    if (currentStep === 'complete') setCurrentStep('tax')
  }

  const handleComplete = async () => {
    if (!user) {
      toast.error("Vui lòng đăng nhập")
      navigate("/login")
      return
    }

    try {
      setIsLoading(true)
      const [frontUpload, backUpload] = await Promise.all([
        registration.identityInfo.cccdFrontImage
          ? uploadImage({ file: registration.identityInfo.cccdFrontImage, folder: "seller-identity" })
          : Promise.resolve(null),
        registration.identityInfo.cccdBackImage
          ? uploadImage({ file: registration.identityInfo.cccdBackImage, folder: "seller-identity" })
          : Promise.resolve(null),
      ])

      const payload = {
        shopName: registration.shopInfo.shopName,
        businessPhone: registration.shopInfo.phone,
        businessEmail: registration.shopInfo.email,
        addressLine: registration.shopInfo.pickupAddress,
        ward: registration.shopInfo.ward,
        district: registration.shopInfo.district,
        province: registration.shopInfo.city,
        taxCode: registration.taxInfo.taxNumber,
        identityFullName: registration.identityInfo.fullName,
        identityNumber: registration.identityInfo.cccdNumber,
        identityFrontUrl: frontUpload?.url,
        identityBackUrl: backUpload?.url,
        shippingOptions: {
          codEnabled: registration.taxInfo.codEnabled,
          dailyDeliveryEnabled: registration.taxInfo.dailyDeliveryEnabled,
          expressDeliveryEnabled: registration.taxInfo.expressDeliveryEnabled,
          instantDeliveryEnabled: registration.taxInfo.instantDeliveryEnabled,
          buyNowPayLaterEnabled: registration.taxInfo.buyNowPayLaterEnabled,
        },
        taxInfo: {
          businessType: registration.taxInfo.businessType,
          businessRegistrationPlace: registration.taxInfo.businessRegistrationPlace,
          registeredEmail: registration.taxInfo.registeredEmail,
          taxNumber: registration.taxInfo.taxNumber,
        },
      }

      await applyMutation.mutateAsync({ data: payload })
      markStepCompleted('complete')
      toast.success("Gửi yêu cầu mở shop thành công")
      navigate("/", { replace: true })
    } catch (error: any) {
      toast.error(error?.response?.data?.detail || "Đăng ký thất bại")
    } finally {
      setIsLoading(false)
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="animate-pulse font-medium text-slate-500">Đang tải dữ liệu...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] bg-size-[16px_16px] px-4">
        <div className="w-full max-w-lg overflow-hidden rounded-4xl border bg-white shadow-2xl shadow-slate-200/50 transition-all hover:shadow-primary/5">
          <div className="bg-primary/5 p-8 text-center border-b border-primary/10">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-xl shadow-primary/10 text-primary ring-1 ring-primary/20">
              <UserRound className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bắt đầu kinh doanh</h1>
            <p className="mt-2 text-sm text-slate-500 font-medium">Đăng nhập để khởi tạo gian hàng của bạn</p>
          </div>
          <div className="p-8">
            <p className="text-center text-slate-600 leading-relaxed mb-8">
              Chỉ tài khoản đã đăng nhập mới có thể gửi yêu cầu mở shop và truy cập các công cụ hỗ trợ người bán chuyên nghiệp.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link to="/login" className="w-full">
                <Button className="w-full rounded-2xl h-12 text-base shadow-lg shadow-primary/20">Đăng nhập</Button>
              </Link>
              <Link to="/register" className="w-full">
                <Button variant="outline" className="w-full rounded-2xl h-12 text-base border-slate-200 hover:bg-slate-50">Tạo tài khoản</Button>
              </Link>
            </div>
            <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-slate-400 hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Quay lại trang chủ
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (application?.status === "PENDING") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4">
        <div className="w-full max-w-2xl rounded-[40px] border bg-white p-12 text-center shadow-2xl shadow-amber-200/20 ring-1 ring-amber-100">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-4xl bg-amber-50 text-amber-600 shadow-inner ring-1 ring-amber-100">
            <Clock3 className="h-12 w-12 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Yêu cầu đang được xử lý</h1>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700 ring-1 ring-amber-100">
            <Store className="h-4 w-4" />
            {application.shopName}
          </div>
          <p className="mt-8 text-lg text-slate-500 leading-relaxed max-w-md mx-auto">
            Hồ sơ của bạn đã được gửi lên ban quản trị. Chúng tôi sẽ phê duyệt trong vòng <span className="font-bold text-slate-900">24h làm việc</span>.
          </p>
          <div className="mt-12 flex justify-center gap-4">
            <Link to="/">
              <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold border-slate-200 hover:bg-slate-50">Về trang chủ</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (application?.status === "REJECTED" || application?.status === "NEED_MORE_INFO") {
    const isRejected = application.status === "REJECTED"
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4">
        <div className="w-full max-w-2xl rounded-[40px] border bg-white p-12 text-center shadow-2xl shadow-slate-200/30 ring-1 ring-slate-100">
          <div className={`mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-4xl ${isRejected ? "bg-red-50 text-red-600 ring-red-100" : "bg-amber-50 text-amber-600 ring-amber-100"} shadow-inner ring-1`}>
            <Store className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            {isRejected ? "Hồ sơ chưa được duyệt" : "Cần bổ sung thông tin"}
          </h1>
          <div className="mt-6 rounded-3xl bg-slate-50 p-6 text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Ghi chú từ quản trị viên</p>
            <p className="mt-3 text-base font-medium leading-7 text-slate-700">
              {application.note || "Chưa có ghi chú chi tiết. Vui lòng kiểm tra lại thông tin shop, định danh và thuế trước khi gửi lại."}
            </p>
          </div>
          <div className="mt-10 flex justify-center gap-4">
            <Button
              className="rounded-2xl h-12 px-8 font-bold"
              onClick={() => {
                setCompletedSteps([])
                setCurrentStep("shop-info")
              }}
            >
              Cập nhật hồ sơ
            </Button>
            <Link to="/">
              <Button variant="outline" className="rounded-2xl h-12 px-8 font-bold border-slate-200 hover:bg-slate-50">Về trang chủ</Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (application?.status === "APPROVED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50/50 px-4">
        <div className="w-full max-w-2xl rounded-[40px] border bg-white p-12 text-center shadow-2xl shadow-emerald-200/20 ring-1 ring-emerald-100">
          <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-4xl bg-emerald-50 text-emerald-600 shadow-inner ring-1 ring-emerald-100">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Chúc mừng bạn!</h1>
          <p className="mt-6 text-lg text-slate-500 font-medium">
            Gian hàng của bạn đã chính thức được phê duyệt.
          </p>
          <div className="mt-10 p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-between">
            <div className="text-left">
              <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Trạng thái hiện tại</p>
              <p className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
                Đối tác bán hàng
              </p>
            </div>
            <Link to="/seller/dashboard">
              <Button className="rounded-2xl h-14 px-8 text-base font-bold shadow-xl shadow-primary/20 group">
                <Rocket className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Bắt đầu ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      {/* Header Bar */}
      <div className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 flex h-20 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary shadow-lg shadow-primary/20">
              <Store className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">Đăng ký người bán</h1>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Trung tâm người bán</p>
            </div>
          </div>
          <Link 
            to="/" 
            className="group flex items-center gap-2 rounded-full bg-slate-50 px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-all duration-300"
          >
            <span className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">Thoát</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200 group-hover:ring-red-200">
              <ArrowLeft className="h-4 w-4 rotate-180 group-hover:text-red-500" />
            </div>
          </Link>
        </div>
      </div>

      <div className="container py-12 lg:py-20">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            {/* Left Sidebar Info */}
            <div className="hidden lg:block">
              <div className="sticky top-32 space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">Mở rộng kinh doanh cùng chúng tôi</h2>
                  <p className="mt-4 text-slate-500 leading-relaxed font-medium">
                    Tiếp cận hàng triệu khách hàng tiềm năng chỉ với vài bước đăng ký đơn giản.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Duyệt hồ sơ nhanh chóng trong 24h</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Công cụ quản lý bán hàng chuyên nghiệp</p>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm font-semibold text-slate-700">Hỗ trợ vận chuyển đa dạng đơn vị</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-10">
              <div className="px-4">
                <StepIndicator
                  steps={STEPS}
                  currentStep={currentStep}
                  completedSteps={completedSteps}
                />
              </div>

              <div className="overflow-hidden rounded-[40px] border bg-white shadow-2xl shadow-slate-200/50 ring-1 ring-slate-100">
                <div className="p-8 lg:p-12">
                  {currentStep === 'shop-info' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <ShopInfoForm
                        data={registration.shopInfo}
                        onNext={handleShopInfoSubmit}
                      />
                    </div>
                  )}

                  {currentStep === 'shipping' && (
                    <div key={`shipping-${currentStep}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <ShippingSettings
                        data={registration.taxInfo}
                        onNext={handleShippingNext}
                        onPrev={handlePrevStep}
                      />
                    </div>
                  )}

                  {currentStep === 'identity' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <IdentityForm
                        initialData={registration.identityInfo}
                        onSubmit={handleIdentitySubmit}
                        onPrev={handlePrevStep}
                        isLoading={isLoading}
                      />
                    </div>
                  )}

                  {currentStep === 'tax' && (
                    <div key={`tax-${currentStep}`} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                      <TaxForm
                        initialData={registration.taxInfo}
                        onSubmit={handleTaxSubmit}
                        onPrev={handlePrevStep}
                        isLoading={isLoading}
                      />
                    </div>
                  )}

                  {currentStep === 'complete' && (
                    <div className="py-12 text-center animate-in zoom-in duration-500">
                      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary/10 text-primary shadow-inner">
                        <CheckCircle2 className="h-10 w-10" />
                      </div>
                      <h2 className="text-3xl font-extrabold text-slate-900">Xác nhận thông tin</h2>
                      <p className="mt-4 text-lg text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                        Bạn đã hoàn thành tất cả các bước. Nhấn "Hoàn tất" để gửi yêu cầu cho chúng tôi.
                      </p>
                      <div className="mt-10 flex flex-col items-center gap-4">
                        <Button 
                          onClick={handleComplete} 
                          disabled={isLoading}
                          className="rounded-2xl h-14 px-12 text-base font-bold shadow-xl shadow-primary/20 w-full sm:w-auto"
                        >
                          {isLoading ? (
                            <span className="flex items-center gap-2">
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Đang xử lý...
                            </span>
                          ) : "Gửi yêu cầu ngay"}
                        </Button>
                        <button 
                          onClick={handlePrevStep}
                          className="text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          Kiểm tra lại hồ sơ
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

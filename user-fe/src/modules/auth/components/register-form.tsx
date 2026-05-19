
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldLabel } from '@/components/ui/field'
import { Mail, Lock, User, Eye, EyeOff, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { useRegister } from '../api/register'
import { useAuthStore } from '@/stores/auth.store'

export function SignupForm() {
  const registerMutation = useRegister()
  const navigate = useNavigate()
  const { setUser } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

 const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu không khớp')
      return
    }

    setIsLoading(true)

    registerMutation.mutate(
      {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      },
      {
        onSuccess: (data: any) => {
          if (data?.user) {
            setUser(data.user)
          }
          toast.success('Đăng ký thành công!')
          setIsLoading(false)
          navigate('/', { replace: true })
        },
        onError: (err: any) => {
          toast.error(err?.response?.data?.detail || 'Đăng ký thất bại')
          setIsLoading(false)
        },
      }
    )
  }

  return (
    <Card className="w-full max-w-md border-0 shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-2xl">Đăng Ký Tài Khoản</CardTitle>
        <CardDescription>
          Tạo tài khoản để bắt đầu mua sắm
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field>
            <FieldLabel htmlFor="fullName">Họ và Tên</FieldLabel>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="fullName"
                name="fullName"
                type="text"
                placeholder="Nhập tên của bạn"
                className="pl-10"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@example.com"
                className="pl-10"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="phone">Số điện thoại</FieldLabel>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="0123456789"
                className="pl-10"
                value={formData.phone}
                onChange={handleChange}
                required
              />
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </Field>

          <Field>
            <FieldLabel htmlFor="confirmPassword">Xác nhận mật khẩu</FieldLabel>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="pl-10 pr-10"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </Field>

          <label className="flex items-start gap-2 cursor-pointer">
            <input type="checkbox" className="w-4 h-4 rounded border-border mt-1" required />
            <span className="text-sm text-muted-foreground">
              Tôi đồng ý với{' '}
              <Link to="/" className="text-primary hover:underline">
                Điều khoản sử dụng
              </Link>{' '}
              và{' '}
              <Link to="/" className="text-primary hover:underline">
                Chính sách bảo mật
              </Link>
            </span>
          </label>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-linear-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white py-2 rounded-lg font-semibold"
          >
            {isLoading ? 'Đang đăng ký...' : 'Đăng Ký'}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-primary hover:underline font-semibold">
            Đăng nhập
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}

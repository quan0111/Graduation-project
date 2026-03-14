import { AuthLayout } from '@/modules/auth/components/auth-layout'
import { LoginForm } from '@/modules/auth/components/login-form'

export default function LoginPage() {
  return (
    <AuthLayout>
      <LoginForm />
    </AuthLayout>
  )
}

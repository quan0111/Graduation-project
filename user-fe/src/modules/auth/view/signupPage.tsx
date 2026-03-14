import { AuthLayout } from '@/modules/auth/components/auth-layout'
import { SignupForm } from '../components/register-form'

export default function SignupPage() {
  return (
    <AuthLayout>
      <SignupForm />
    </AuthLayout>
  )
}

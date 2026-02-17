import { useEffect } from 'react'
import { Navigate } from 'react-router'
import { TrendingUp, Wallet, PiggyBank } from 'lucide-react'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { LoginForm } from '@/features/auth/components/login-form'

function LoginPage() {
  const { isAuthenticated, isLoading, initialize } = useAuth()

  useEffect(() => {
    const unsubscribe = initialize()
    return unsubscribe
  }, [initialize])

  if (!isLoading && isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding (hidden on mobile) */}
      <div className="relative hidden flex-1 overflow-hidden lg:flex lg:items-center lg:justify-center">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-600" />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/50 via-transparent to-cyan-400/50 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-400/20 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 left-10 size-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute bottom-20 right-10 size-96 rounded-full bg-white/5 blur-3xl" />

        {/* Content */}
        <div className="relative z-10 max-w-md space-y-8 px-8 text-white">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="flex size-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                <Wallet className="size-7" />
              </div>
              <h1 className="text-4xl font-bold">FinTrack</h1>
            </div>
            <p className="text-lg text-white/80">
              Gerencie suas finanças de forma inteligente
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <TrendingUp className="size-4" />
              </div>
              <div>
                <p className="font-medium">Acompanhe seus gastos</p>
                <p className="text-sm text-white/70">
                  Visualize para onde seu dinheiro está indo com gráficos
                  detalhados
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
                <PiggyBank className="size-4" />
              </div>
              <div>
                <p className="font-medium">Economize mais</p>
                <p className="text-sm text-white/70">
                  Defina metas e acompanhe sua evolução financeira
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-12 sm:px-8">
        {/* Mobile logo */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-600">
            <Wallet className="size-5 text-white" />
          </div>
          <span className="text-xl font-bold">FinTrack</span>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}

export default LoginPage
export const Component = LoginPage

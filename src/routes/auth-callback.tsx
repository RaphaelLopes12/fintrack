import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import { Loader2, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const processed = useRef(false)

  useEffect(() => {
    if (processed.current) return
    processed.current = true

    async function handleCallback() {
      try {
        const queryParams = new URLSearchParams(window.location.search)
        const hashParams = new URLSearchParams(
          window.location.hash.substring(1)
        )

        const errorDescription =
          hashParams.get('error_description') ||
          queryParams.get('error_description')

        if (errorDescription) {
          toast.error(errorDescription)
          navigate('/login', { replace: true })
          return
        }

        const code = queryParams.get('code')

        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code)

          if (error) {
            toast.error('Erro na autenticação. Tente novamente.')
            navigate('/login', { replace: true })
            return
          }

          toast.success('Login realizado com sucesso!')
          navigate('/', { replace: true })
          return
        }

        // Hash-based flow - Supabase handles automatically via onAuthStateChange
        const { data } = await supabase.auth.getSession()

        if (data.session) {
          toast.success('Login realizado com sucesso!')
          navigate('/', { replace: true })
        } else {
          toast.error('Erro na autenticação. Tente novamente.')
          navigate('/login', { replace: true })
        }
      } catch {
        toast.error('Erro inesperado na autenticação.')
        navigate('/login', { replace: true })
      }
    }

    handleCallback()
  }, [navigate])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="flex size-12 items-center justify-center rounded-xl bg-emerald-600">
          <Wallet className="size-7 text-white" />
        </div>
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          Autenticando, aguarde...
        </p>
      </div>
    </div>
  )
}

export default AuthCallbackPage
export const Component = AuthCallbackPage

import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { Loader2, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    async function handleCallback() {
      try {
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href
        )

        if (error) {
          toast.error('Erro na autenticacao. Tente novamente.')
          navigate('/login', { replace: true })
          return
        }

        toast.success('Login realizado com sucesso!')
        navigate('/', { replace: true })
      } catch {
        toast.error('Erro inesperado na autenticacao.')
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

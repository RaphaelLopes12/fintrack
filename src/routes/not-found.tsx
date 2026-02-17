import { Link } from 'react-router'
import { FileQuestion } from 'lucide-react'
import { Button } from '@/components/ui/button'

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-20 items-center justify-center rounded-2xl bg-muted">
          <FileQuestion className="size-10 text-muted-foreground" />
        </div>

        <h1 className="mt-6 text-7xl font-bold tracking-tighter text-foreground">
          404
        </h1>

        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Página não encontrada
        </h2>

        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          A página que você está procurando não existe ou foi movida para outro
          endereço.
        </p>

        <Button asChild className="mt-8">
          <Link to="/">Voltar ao início</Link>
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
export const Component = NotFoundPage

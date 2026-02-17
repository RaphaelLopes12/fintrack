import { CheckCircle, MinusCircle, AlertTriangle, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { ImportSummary } from '@/features/transactions/types/import.types'

interface ImportResultStepProps {
  summary: ImportSummary
  onClose: () => void
  onImportMore: () => void
}

export function ImportResultStep({
  summary,
  onClose,
  onImportMore,
}: ImportResultStepProps) {
  return (
    <div className="space-y-6 py-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-center gap-3 rounded-lg border p-4">
          <CheckCircle className="size-5 text-emerald-500" />
          <div>
            <p className="text-2xl font-bold">{summary.imported}</p>
            <p className="text-sm text-muted-foreground">
              transações importadas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-4">
          <MinusCircle className="size-5 text-muted-foreground" />
          <div>
            <p className="text-2xl font-bold">{summary.skipped}</p>
            <p className="text-sm text-muted-foreground">
              transações ignoradas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-lg border p-4">
          <AlertTriangle className="size-5 text-amber-500" />
          <div>
            <p className="text-2xl font-bold">{summary.duplicates}</p>
            <p className="text-sm text-muted-foreground">
              duplicatas detectadas
            </p>
          </div>
        </div>

        {summary.errors.length > 0 && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 p-4">
            <XCircle className="size-5 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{summary.errors.length}</p>
              <p className="text-sm text-muted-foreground">erros</p>
            </div>
          </div>
        )}
      </div>

      {summary.errors.length > 0 && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <p className="mb-2 text-sm font-medium text-destructive">
            Detalhes dos erros:
          </p>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {summary.errors.map((error, i) => (
              <li key={i}>• {error}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button variant="outline" onClick={onImportMore}>
          Importar Mais
        </Button>
        <Button onClick={onClose}>Fechar</Button>
      </div>
    </div>
  )
}

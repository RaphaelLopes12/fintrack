import { useState } from 'react'
import { Download, Upload, FileSpreadsheet, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { transactionService } from '@/features/transactions/services/transaction.service'
import { formatDateShort } from '@/lib/format'

function formatAmountForCsv(amount: number): string {
  return amount.toFixed(2).replace('.', ',')
}

export function DataSettings() {
  const user = useAuth((state) => state.user)
  const [isExporting, setIsExporting] = useState(false)

  async function handleExportCsv() {
    if (!user?.id) {
      toast.error('Usuario nao autenticado.')
      return
    }

    setIsExporting(true)

    try {
      const transactions = await transactionService.getTransactions(user.id)

      if (transactions.length === 0) {
        toast.info('Nenhuma transacao encontrada para exportar.')
        setIsExporting(false)
        return
      }

      const header = 'Data;Tipo;Descricao;Categoria;Valor;Cartao de Credito'
      const rows = transactions.map((t) => {
        const date = formatDateShort(t.date)
        const type = t.type === 'income' ? 'Receita' : 'Despesa'
        const description = t.description.replace(/;/g, ',')
        const categoryName = t.category?.name ?? ''
        const amount = formatAmountForCsv(t.amount)
        const creditCard = t.credit_card_id ?? ''

        return `${date};${type};${description};${categoryName};${amount};${creditCard}`
      })

      const csvContent = '\uFEFF' + [header, ...rows].join('\n')
      const blob = new Blob([csvContent], {
        type: 'text/csv;charset=utf-8;',
      })

      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `fintrack-transacoes-${new Date().toISOString().slice(0, 10)}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success(`${transactions.length} transacao(oes) exportada(s) com sucesso!`)
    } catch {
      toast.error('Erro ao exportar transacoes. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dados</CardTitle>
        <CardDescription>Exporte ou importe seus dados financeiros</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Export section */}
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <FileSpreadsheet className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium">Exportar Transacoes</h4>
            <p className="text-sm text-muted-foreground">
              Baixe todas as suas transacoes em formato CSV. O arquivo utiliza
              ponto-e-virgula como separador, compativel com Excel e Google
              Sheets no formato brasileiro.
            </p>
            <Button
              size="sm"
              className="mt-3"
              onClick={handleExportCsv}
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Download className="size-4" />
              )}
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Import section (placeholder) */}
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-medium">Importar Transacoes</h4>
              <Badge variant="secondary" className="text-[10px]">
                Em breve
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Importe transacoes a partir de um arquivo CSV ou extrato bancario.
            </p>
            <Button size="sm" className="mt-3" disabled>
              <Upload className="size-4" />
              Importar CSV
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

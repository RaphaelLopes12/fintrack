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
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/features/auth/hooks/use-auth'
import { transactionService } from '@/features/transactions/services/transaction.service'
import { formatDateShort } from '@/lib/format'
import { ImportDialog } from './import-dialog'

function formatAmountForCsv(amount: number): string {
  return amount.toFixed(2).replace('.', ',')
}

export function DataSettings() {
  const user = useAuth((state) => state.user)
  const [isExporting, setIsExporting] = useState(false)
  const [importOpen, setImportOpen] = useState(false)

  async function handleExportCsv() {
    if (!user?.id) {
      toast.error('Usuário não autenticado.')
      return
    }

    setIsExporting(true)

    try {
      const transactions = await transactionService.getTransactions(user.id)

      if (transactions.length === 0) {
        toast.info('Nenhuma transação encontrada para exportar.')
        setIsExporting(false)
        return
      }

      const header = 'Data;Tipo;Descrição;Categoria;Valor;Cartão de Crédito'
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

      toast.success(`${transactions.length} transação(ões) exportada(s) com sucesso!`)
    } catch {
      toast.error('Erro ao exportar transações. Tente novamente.')
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
            <h4 className="text-sm font-medium">Exportar Transações</h4>
            <p className="text-sm text-muted-foreground">
              Baixe todas as suas transações em formato CSV. O arquivo utiliza
              ponto-e-vírgula como separador, compatível com Excel e Google
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

        {/* Import section */}
        <div className="flex items-start gap-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted">
            <Upload className="size-5 text-muted-foreground" />
          </div>
          <div className="flex-1 space-y-1">
            <h4 className="text-sm font-medium">Importar Transações</h4>
            <p className="text-sm text-muted-foreground">
              Importe transações a partir de um arquivo CSV ou extrato bancário
              OFX. Compatível com os principais bancos brasileiros.
            </p>
            <Button
              size="sm"
              className="mt-3"
              onClick={() => setImportOpen(true)}
            >
              <Upload className="size-4" />
              Importar CSV/OFX
            </Button>
          </div>
        </div>
      </CardContent>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} />
    </Card>
  )
}

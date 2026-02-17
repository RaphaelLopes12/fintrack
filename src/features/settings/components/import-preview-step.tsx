import {
  ArrowUpCircle,
  ArrowDownCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useCategories } from '@/features/transactions/hooks/use-categories'
import { formatCurrency, formatDateShort } from '@/lib/format'
import type { ParsedTransaction } from '@/features/transactions/types/import.types'

interface ImportPreviewStepProps {
  transactions: ParsedTransaction[]
  selectedCount: number
  toggleTransaction: (id: string) => void
  toggleAll: (selected: boolean) => void
  updateCategory: (id: string, categoryId: string) => void
  setDefaultCategory: (categoryId: string) => void
  startImport: () => void
  isImporting: boolean
  replaceImport: () => void
  isReplacing: boolean
  goBack: () => void
}

export function ImportPreviewStep({
  transactions,
  selectedCount,
  toggleTransaction,
  toggleAll,
  updateCategory,
  setDefaultCategory,
  startImport,
  isImporting,
  replaceImport,
  isReplacing,
  goBack,
}: ImportPreviewStepProps) {
  const { data: allCategories = [] } = useCategories()

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)
  const duplicateCount = transactions.filter((t) => t.isDuplicate).length
  const uncategorizedSelected = transactions.filter(
    (t) => t.selected && !t.categoryId
  ).length

  const allSelected = transactions.every((t) => t.selected)

  return (
    <div className="space-y-4 py-2">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-3">
        <Badge variant="secondary" className="text-xs">
          {transactions.length} transações
        </Badge>
        <Badge
          variant="secondary"
          className="bg-emerald-500/10 text-emerald-500 text-xs"
        >
          <ArrowUpCircle className="size-3" />
          {formatCurrency(totalIncome)}
        </Badge>
        <Badge
          variant="secondary"
          className="bg-red-500/10 text-red-500 text-xs"
        >
          <ArrowDownCircle className="size-3" />
          {formatCurrency(totalExpense)}
        </Badge>
        {duplicateCount > 0 && (
          <Badge
            variant="secondary"
            className="bg-amber-500/10 text-amber-500 text-xs"
          >
            <AlertTriangle className="size-3" />
            {duplicateCount} duplicatas
          </Badge>
        )}
      </div>

      {/* Default category selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground shrink-0">
          Categoria padrão para não categorizadas:
        </span>
        <Select onValueChange={setDefaultCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Selecionar..." />
          </SelectTrigger>
          <SelectContent>
            {allCategories.map((cat) => (
              <SelectItem key={cat.id} value={cat.id}>
                <div className="flex items-center gap-2">
                  <span
                    className="size-2.5 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  {cat.name} ({cat.type === 'income' ? 'Receita' : 'Despesa'})
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="max-h-[50vh] overflow-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={(checked) => toggleAll(!!checked)}
                />
              </TableHead>
              <TableHead className="w-24">Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="w-20">Tipo</TableHead>
              <TableHead className="w-28 text-right">Valor</TableHead>
              <TableHead className="w-44">Categoria</TableHead>
              <TableHead className="w-24">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((tx) => {
              const categoriesForType = allCategories.filter(
                (c) => c.type === tx.type
              )

              return (
                <TableRow
                  key={tx.id}
                  className={
                    tx.isDuplicate ? 'bg-amber-500/5' : undefined
                  }
                >
                  <TableCell>
                    <Checkbox
                      checked={tx.selected}
                      onCheckedChange={() => toggleTransaction(tx.id)}
                    />
                  </TableCell>
                  <TableCell className="text-xs whitespace-nowrap">
                    {formatDateShort(tx.date)}
                  </TableCell>
                  <TableCell
                    className="max-w-[200px] truncate text-xs"
                    title={tx.description}
                  >
                    {tx.description}
                  </TableCell>
                  <TableCell>
                    {tx.type === 'income' ? (
                      <Badge
                        variant="secondary"
                        className="bg-emerald-500/10 text-emerald-500 text-[10px]"
                      >
                        Receita
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-red-500/10 text-red-500 text-[10px]"
                      >
                        Despesa
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-xs font-medium whitespace-nowrap">
                    {formatCurrency(tx.amount)}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={tx.categoryId ?? undefined}
                      onValueChange={(value) =>
                        updateCategory(tx.id, value)
                      }
                    >
                      <SelectTrigger className="h-7 w-full text-xs">
                        <SelectValue placeholder="Selecionar" />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesForType.map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-1.5">
                              <span
                                className="size-2 rounded-full"
                                style={{
                                  backgroundColor: cat.color,
                                }}
                              />
                              {cat.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {tx.isDuplicate && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-500/10 text-amber-500 text-[10px]"
                      >
                        Duplicada
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {uncategorizedSelected > 0 && (
        <p className="text-xs text-amber-500">
          {uncategorizedSelected} transação(ões) selecionada(s) sem categoria.
          Atribua uma categoria antes de importar.
        </p>
      )}

      {duplicateCount > 0 && selectedCount === 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <AlertTriangle className="size-4 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-500 flex-1">
            Todas as transações já foram importadas anteriormente.
            Deseja substituir a importação anterior?
          </p>
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 border-amber-500/30 text-amber-500 hover:bg-amber-500/10"
            onClick={replaceImport}
            disabled={isReplacing}
          >
            <RefreshCw className={`size-3.5 ${isReplacing ? 'animate-spin' : ''}`} />
            {isReplacing ? 'Removendo...' : 'Substituir importação'}
          </Button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={goBack}>
          Voltar
        </Button>
        <Button
          onClick={startImport}
          disabled={selectedCount === 0 || uncategorizedSelected > 0 || isImporting}
        >
          Importar {selectedCount} transação(ões)
        </Button>
      </div>
    </div>
  )
}

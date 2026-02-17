import { useState, useCallback } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { useAuth } from '@/features/auth/hooks/use-auth'
import { useCategories } from './use-categories'
import { transactionKeys } from './use-transactions'
import { transactionService } from '../services/transaction.service'
import { categoryService } from '../services/category.service'
import {
  parseImportFile,
  autoCategorize,
  markDuplicates,
} from '../services/import-parser'
import type {
  ParsedTransaction,
  ImportStep,
  ImportSummary,
  ParseResult,
} from '../types/import.types'
import type { TransactionInsert } from '@/types'

export function useImportTransactions() {
  const user = useAuth((state) => state.user)
  const queryClient = useQueryClient()
  const { data: categories = [] } = useCategories()

  const [step, setStep] = useState<ImportStep>('upload')
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [transactions, setTransactions] = useState<ParsedTransaction[]>([])
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [isParsing, setIsParsing] = useState(false)

  const handleFileParsed = useCallback(
    async (file: File) => {
      setIsParsing(true)
      try {
        const result = await parseImportFile(file)

        if (result.transactions.length === 0) {
          toast.warning(
            result.errors.length > 0
              ? result.errors[0]
              : 'Nenhuma transação encontrada no arquivo.'
          )
          setIsParsing(false)
          return
        }

        let cats = categories
        if (cats.length === 0 && user?.id) {
          try {
            cats = await categoryService.getCategories(user.id)
          } catch {
            /* empty */
          }
        }

        if (cats.length === 0 && user?.id) {
          try {
            cats = await categoryService.seedDefaultCategories(user.id)
            queryClient.invalidateQueries({ queryKey: ['categories'] })
            toast.info('Categorias padrão criadas automaticamente.')
          } catch {
            console.warn('Falha ao criar categorias padrão.')
          }
        }

        let txns = autoCategorize(result.transactions, cats)

        if (user?.id && txns.length > 0) {
          try {
            const existing = await transactionService.getTransactions(user.id)
            txns = markDuplicates(txns, existing)
          } catch {
            console.warn('Detecção de duplicatas falhou, continuando sem ela.')
          }
        }

        setParseResult(result)
        setTransactions(txns)
        setStep('preview')

        if (result.errors.length > 0) {
          result.errors.forEach((err) => toast.warning(err))
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : 'Erro ao processar o arquivo.'
        )
      } finally {
        setIsParsing(false)
      }
    },
    [categories, user?.id, queryClient]
  )

  const toggleTransaction = useCallback((id: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, selected: !t.selected } : t))
    )
  }, [])

  const toggleAll = useCallback((selected: boolean) => {
    setTransactions((prev) => prev.map((t) => ({ ...t, selected })))
  }, [])

  const updateCategory = useCallback((id: string, categoryId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, categoryId } : t))
    )
  }, [])

  const setDefaultCategory = useCallback((categoryId: string) => {
    setTransactions((prev) =>
      prev.map((t) => (t.categoryId === null ? { ...t, categoryId } : t))
    )
  }, [])

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      const selected = transactions.filter((t) => t.selected && t.categoryId)

      if (selected.length === 0) {
        throw new Error('Nenhuma transação selecionada para importar.')
      }

      const inserts: TransactionInsert[] = selected.map((t) => ({
        user_id: user.id,
        category_id: t.categoryId!,
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: t.date,
        is_recurring: false,
        notes: t.memo
          ? `Importado | ${t.memo}`
          : 'Importado via extrato',
      }))

      setStep('importing')

      const result = await transactionService.bulkCreateTransactions(inserts)

      const importSummary: ImportSummary = {
        total: transactions.length,
        imported: result.created,
        skipped: transactions.filter((t) => !t.selected).length,
        duplicates: transactions.filter((t) => t.isDuplicate).length,
        errors: result.errors,
      }

      setSummary(importSummary)
      setStep('result')

      return importSummary
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`${data.imported} transação(ões) importada(s) com sucesso!`)
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao importar transações.'
      )
      setStep('preview')
    },
  })

  const replaceImportMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('Usuário não autenticado')

      const deleted = await transactionService.deleteImportedTransactions(user.id)
      toast.info(`${deleted} transação(ões) anterior(es) removida(s).`)

      setTransactions((prev) =>
        prev.map((t) => ({ ...t, isDuplicate: false, selected: true }))
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Erro ao remover transações anteriores.'
      )
    },
  })

  const reset = useCallback(() => {
    setStep('upload')
    setParseResult(null)
    setTransactions([])
    setSummary(null)
    setIsParsing(false)
  }, [])

  const selectedCount = transactions.filter(
    (t) => t.selected && t.categoryId
  ).length

  return {
    step,
    parseResult,
    transactions,
    summary,
    isParsing,
    selectedCount,
    handleFileParsed,
    toggleTransaction,
    toggleAll,
    updateCategory,
    setDefaultCategory,
    startImport: () => importMutation.mutate(),
    isImporting: importMutation.isPending,
    replaceImport: () => replaceImportMutation.mutate(),
    isReplacing: replaceImportMutation.isPending,
    reset,
    goBack: () => setStep('upload'),
  }
}

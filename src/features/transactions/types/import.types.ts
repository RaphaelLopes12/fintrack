export interface ParsedTransaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  originalDescription: string
  fitId?: string
  memo?: string
  selected: boolean
  categoryId: string | null
  isDuplicate: boolean
}

export interface ParseResult {
  transactions: ParsedTransaction[]
  fileType: 'csv' | 'ofx'
  fileName: string
  errors: string[]
}

export interface ImportSummary {
  total: number
  imported: number
  skipped: number
  duplicates: number
  errors: string[]
}

export type ImportStep = 'upload' | 'preview' | 'importing' | 'result'

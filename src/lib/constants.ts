export const CARD_BRANDS = [
  { value: 'visa', label: 'Visa' },
  { value: 'mastercard', label: 'Mastercard' },
  { value: 'elo', label: 'Elo' },
  { value: 'amex', label: 'American Express' },
  { value: 'hipercard', label: 'Hipercard' },
  { value: 'other', label: 'Outro' },
] as const

export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Receita' },
  { value: 'expense', label: 'Despesa' },
] as const

export const FREQUENCIES = [
  { value: 'weekly', label: 'Semanal' },
  { value: 'monthly', label: 'Mensal' },
  { value: 'yearly', label: 'Anual' },
] as const

export const DEFAULT_CATEGORIES = {
  income: [
    { name: 'Salário', icon: 'banknote', color: '#22c55e' },
    { name: 'Freelance', icon: 'laptop', color: '#3b82f6' },
    { name: 'Investimentos', icon: 'trending-up', color: '#8b5cf6' },
    { name: 'Presente', icon: 'gift', color: '#ec4899' },
    { name: 'Outros', icon: 'circle', color: '#6b7280' },
  ],
  expense: [
    { name: 'Alimentação', icon: 'utensils', color: '#f97316' },
    { name: 'Transporte', icon: 'car', color: '#3b82f6' },
    { name: 'Moradia', icon: 'home', color: '#8b5cf6' },
    { name: 'Saúde', icon: 'heart-pulse', color: '#ef4444' },
    { name: 'Educação', icon: 'graduation-cap', color: '#06b6d4' },
    { name: 'Lazer', icon: 'gamepad-2', color: '#f59e0b' },
    { name: 'Roupas', icon: 'shirt', color: '#ec4899' },
    { name: 'Assinaturas', icon: 'repeat', color: '#6366f1' },
    { name: 'Contas', icon: 'file-text', color: '#64748b' },
    { name: 'Outros', icon: 'circle', color: '#6b7280' },
  ],
} as const

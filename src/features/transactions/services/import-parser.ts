import type { Category, TransactionWithCategory } from '@/types'
import type { ParsedTransaction, ParseResult } from '../types/import.types'

function extractOFXField(block: string, fieldName: string): string | null {
  const regex = new RegExp(`<${fieldName}>([^<\\r\\n]+)`, 'i')
  const match = block.match(regex)
  return match ? match[1].trim() : null
}

function parseOFXDate(dateStr: string): string {
  const clean = dateStr.replace(/\[.*\]/, '').trim()
  const year = clean.substring(0, 4)
  const month = clean.substring(4, 6)
  const day = clean.substring(6, 8)
  return `${year}-${month}-${day}`
}

function parseOFX(content: string): ParsedTransaction[] {
  const transactions: ParsedTransaction[] = []
  const blockRegex = /<STMTTRN>([\s\S]*?)(<\/STMTTRN>|(?=<STMTTRN>))/gi
  let match: RegExpExecArray | null

  while ((match = blockRegex.exec(content)) !== null) {
    const block = match[1]

    const trnType = extractOFXField(block, 'TRNTYPE')
    const dtPosted = extractOFXField(block, 'DTPOSTED')
    const trnAmt = extractOFXField(block, 'TRNAMT')
    const name = extractOFXField(block, 'NAME')
    const memo = extractOFXField(block, 'MEMO')
    const fitId = extractOFXField(block, 'FITID')

    if (!dtPosted || !trnAmt) continue

    const rawAmount = parseFloat(trnAmt.replace(',', '.'))
    if (isNaN(rawAmount)) continue

    const amount = Math.abs(rawAmount)
    let type: 'income' | 'expense' = rawAmount < 0 ? 'expense' : 'income'

    if (trnType?.toUpperCase() === 'DEBIT' && rawAmount < 0) {
      type = 'expense'
    } else if (trnType?.toUpperCase() === 'CREDIT' && rawAmount > 0) {
      type = 'income'
    }

    const description = (name || memo || 'Transação importada').trim()

    transactions.push({
      id: crypto.randomUUID(),
      date: parseOFXDate(dtPosted),
      description,
      amount,
      type,
      originalDescription: description,
      fitId: fitId ?? undefined,
      memo: memo && name ? memo.trim() : undefined,
      selected: true,
      categoryId: null,
      isDuplicate: false,
    })
  }

  return transactions
}

function detectSeparator(firstLine: string): string {
  const semicolonCount = (firstLine.match(/;/g) || []).length
  const commaCount = (firstLine.match(/,/g) || []).length
  return semicolonCount >= commaCount ? ';' : ','
}

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function parseBrazilianNumber(value: string): number {
  let cleaned = value.replace(/[R$\s]/g, '').trim()

  const lastComma = cleaned.lastIndexOf(',')
  const lastDot = cleaned.lastIndexOf('.')

  if (lastComma > lastDot) {
    cleaned = cleaned.replace(/\./g, '').replace(',', '.')
  } else if (lastDot > lastComma) {
    cleaned = cleaned.replace(/,/g, '')
  }

  return parseFloat(cleaned) || 0
}

function parseCSVDate(dateStr: string): string {
  const trimmed = dateStr.trim()

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('/')
    return `${year}-${month}-${day}`
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(trimmed)) {
    const [day, month, year] = trimmed.split('-')
    return `${year}-${month}-${day}`
  }

  return trimmed
}

function splitCSVLine(line: string, separator: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === separator && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current.trim())
  return fields
}

interface ColumnMapping {
  date: number
  description: number
  amount: number
  type: number | null
}

function mapHeaders(headers: string[]): ColumnMapping | null {
  const normalized = headers.map((h) =>
    removeAccents(h.toLowerCase().trim().replace(/^"|"$/g, ''))
  )

  const dateAliases = ['data', 'date', 'dt', 'data lancamento', 'data transacao']
  const descAliases = [
    'descricao',
    'description',
    'historico',
    'lancamento',
    'memo',
    'nome',
    'detalhes',
    'titulo',
  ]
  const amountAliases = ['valor', 'value', 'amount', 'quantia', 'vl', 'vlr']
  const typeAliases = ['tipo', 'type', 'natureza']

  const findIndex = (aliases: string[]) =>
    normalized.findIndex((h) => aliases.some((a) => h.includes(a)))

  const date = findIndex(dateAliases)
  const description = findIndex(descAliases)
  const amount = findIndex(amountAliases)
  const type = findIndex(typeAliases)

  if (date === -1 || description === -1 || amount === -1) {
    console.warn('Colunas não reconhecidas:', normalized)
    if (normalized.length >= 3) {
      return { date: 0, description: 1, amount: 2, type: null }
    }
    return null
  }

  return { date, description, amount, type: type === -1 ? null : type }
}

function parseCSV(content: string): ParsedTransaction[] {
  const cleaned = content.replace(/^\uFEFF/, '')

  const lines = cleaned
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  if (lines.length < 2) return []

  const separator = detectSeparator(lines[0])
  const headers = splitCSVLine(lines[0], separator)
  const mapping = mapHeaders(headers)

  if (!mapping) return []

  const transactions: ParsedTransaction[] = []

  for (let i = 1; i < lines.length; i++) {
    const fields = splitCSVLine(lines[i], separator)
    if (fields.length <= mapping.amount) continue

    const dateStr = fields[mapping.date]
    const descriptionStr = fields[mapping.description]?.replace(/^"|"$/g, '')
    const amountStr = fields[mapping.amount]?.replace(/^"|"$/g, '')

    if (!dateStr || !descriptionStr || !amountStr) continue

    const date = parseCSVDate(dateStr)
    const rawAmount = parseBrazilianNumber(amountStr)
    if (rawAmount === 0) continue

    let type: 'income' | 'expense'

    if (mapping.type !== null && fields[mapping.type]) {
      const typeVal = removeAccents(fields[mapping.type].toLowerCase().trim())
      type =
        typeVal === 'receita' ||
        typeVal === 'income' ||
        typeVal === 'credit' ||
        typeVal === 'credito'
          ? 'income'
          : 'expense'
    } else {
      type = rawAmount < 0 || amountStr.trim().startsWith('-') ? 'expense' : 'income'
    }

    transactions.push({
      id: crypto.randomUUID(),
      date,
      description: descriptionStr.trim(),
      amount: Math.abs(rawAmount),
      type,
      originalDescription: descriptionStr.trim(),
      selected: true,
      categoryId: null,
      isDuplicate: false,
    })
  }

  return transactions
}

export function parseImportFile(file: File): Promise<ParseResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    const fileName = file.name
    const extension = fileName.split('.').pop()?.toLowerCase()

    reader.onload = (e) => {
      const content = e.target?.result as string

      try {
        let transactions: ParsedTransaction[]
        let fileType: 'csv' | 'ofx'

        if (extension === 'ofx') {
          transactions = parseOFX(content)
          fileType = 'ofx'
        } else {
          transactions = parseCSV(content)
          fileType = 'csv'
        }

        if (transactions.length === 0) {
          resolve({
            transactions: [],
            fileType: fileType,
            fileName,
            errors: ['Nenhuma transação encontrada no arquivo.'],
          })
          return
        }

        resolve({ transactions, fileType, fileName, errors: [] })
      } catch (error) {
        reject(
          new Error(
            `Erro ao processar o arquivo: ${error instanceof Error ? error.message : 'Formato inválido'}`
          )
        )
      }
    }

    reader.onerror = () => reject(new Error('Erro ao ler o arquivo.'))
    reader.readAsText(file, extension === 'ofx' ? 'iso-8859-1' : 'utf-8')
  })
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Alimentação': [
    'supermercado', 'mercado', 'restaurante', 'lanchonete', 'padaria',
    'ifood', 'rappi', 'uber eats', 'mcdonald', 'burger', 'pizza',
    'sushi', 'cafe', 'acougue', 'hortifruti', 'atacadao', 'assai',
    'carrefour', 'extra', 'pao de acucar', 'sacolao', 'hortifruit',
    'emporio', 'mercearia', 'delicatessen', 'sorveteria', 'doceria',
    'churrascaria', 'cantina', 'bar ', 'boteco', 'espetinho',
    'acai', 'lanche', 'food', 'grill', 'bistro',
  ],
  'Transporte': [
    'uber', '99pop', '99 ', 'cabify', 'posto', 'combustivel', 'gasolina',
    'estacionamento', 'pedagio', 'metro', 'onibus', 'bilhete unico',
    'shell', 'ipiranga', 'br distribuidora', 'auto posto', 'lavagem',
    'lava jato', 'lava rapido', 'oficina', 'mecanico', 'pneu',
    'automovel', 'veiculo', 'recarga bilhete',
  ],
  'Moradia': [
    'aluguel', 'condominio', 'iptu', 'luz', 'energia', 'agua',
    'gas', 'internet', 'celular', 'telefone', 'enel', 'sabesp',
    'comgas', 'copel', 'cemig', 'cpfl', 'vivo', 'claro', 'tim',
    'oi ', 'net ', 'neoenergia', 'equatorial', 'light',
  ],
  'Saúde': [
    'farmacia', 'drogaria', 'hospital', 'clinica', 'medico',
    'dentista', 'plano de saude', 'unimed', 'amil', 'sulamerica',
    'drogasil', 'droga raia', 'pague menos', 'ultrafarma',
    'panvel', 'pacheco', 'sao paulo drog', 'laboratorio', 'exame',
    'consulta', 'fisioterapia', 'psicolog', 'nutri',
  ],
  'Educação': [
    'escola', 'faculdade', 'universidade', 'curso', 'livro',
    'udemy', 'alura', 'coursera', 'livraria', 'papelaria',
    'material escolar', 'mensalidade escol',
  ],
  'Lazer': [
    'cinema', 'teatro', 'show', 'netflix', 'spotify', 'disney',
    'hbo', 'prime video', 'amazon prime', 'steam', 'playstation',
    'xbox', 'ingresso', 'crunchyroll', 'youtube premium',
    'apple tv', 'globoplay', 'paramount', 'deezer', 'tidal',
    'twitch', 'videogame', 'game pass', 'jogos',
  ],
  'Assinaturas': [
    'assinatura', 'mensalidade', 'anuidade', 'plano mensal',
    'recorrente', 'subscription',
  ],
  'Contas': [
    'boleto', 'fatura', 'pagamento de conta',
  ],
  'Salário': [
    'salario', 'folha', 'prolabore', 'pro-labore', 'pagto salario',
  ],
  'Investimentos': [
    'investimento', 'rendimento', 'dividendo', 'juros', 'cdb',
    'tesouro', 'fii', 'aplicacao', 'resgate',
  ],
}

function stripBankPrefixes(desc: string): string {
  let cleaned = desc
    .replace(/^compra no (debito|credito)\s*-\s*/i, '')
    .replace(/^pix (enviado|recebido)\s*-?\s*/i, '')
    .replace(/^transferencia (enviada|recebida)( pelo pix)?\s*-?\s*/i, '')
    .replace(/^transferencia recebida\s*-?\s*/i, '')
    .replace(/^pagamento de boleto efetuado\s*-?\s*/i, '')
    .replace(/^pagamento de?\s*/i, '')
    .replace(/^debito automatico\s*-?\s*/i, '')
    .replace(/^plano nucel\s*-?\s*/i, '')
    .replace(/^aplicacao\s+/i, '')
    .replace(/^resgate\s+/i, '')
    .trim()

  const dashIdx = cleaned.indexOf(' - ')
  if (dashIdx > 0 && dashIdx < cleaned.length * 0.6) {
    cleaned = cleaned.substring(0, dashIdx)
  }

  return cleaned.trim()
}

function findCategoryMatch(
  categoryName: string,
  type: 'income' | 'expense',
  userCategories: Category[]
): Category | undefined {
  const normalizedName = removeAccents(categoryName.toLowerCase())

  const exact = userCategories.find(
    (c) =>
      removeAccents(c.name.toLowerCase()) === normalizedName &&
      c.type === type
  )
  if (exact) return exact

  return userCategories.find(
    (c) =>
      c.type === type &&
      (removeAccents(c.name.toLowerCase()).includes(normalizedName) ||
        normalizedName.includes(removeAccents(c.name.toLowerCase())))
  )
}

export function autoCategorize(
  transactions: ParsedTransaction[],
  userCategories: Category[]
): ParsedTransaction[] {
  if (userCategories.length === 0) return transactions

  return transactions.map((tx) => {
    const descLower = removeAccents(tx.description.toLowerCase())
    const strippedDesc = removeAccents(stripBankPrefixes(tx.description).toLowerCase())

    for (const [categoryName, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
      const matchesKeyword = keywords.some(
        (kw) => {
          const normalizedKw = removeAccents(kw)
          return descLower.includes(normalizedKw) || strippedDesc.includes(normalizedKw)
        }
      )

      if (matchesKeyword) {
        const category = findCategoryMatch(categoryName, tx.type, userCategories)
        if (category) {
          return { ...tx, categoryId: category.id }
        }
      }
    }

    const otherCategory = userCategories.find(
      (c) =>
        removeAccents(c.name.toLowerCase()) === 'outros' && c.type === tx.type
    )
    return { ...tx, categoryId: otherCategory?.id ?? null }
  })
}

export function markDuplicates(
  parsed: ParsedTransaction[],
  existing: TransactionWithCategory[]
): ParsedTransaction[] {
  const existingFingerprints = new Set(
    existing.map(
      (t) => `${t.date}|${t.amount}|${t.description.toLowerCase().trim()}`
    )
  )

  return parsed.map((tx) => {
    const fingerprint = `${tx.date}|${tx.amount}|${tx.description.toLowerCase().trim()}`
    const isDuplicate = existingFingerprints.has(fingerprint)
    return {
      ...tx,
      isDuplicate,
      selected: isDuplicate ? false : tx.selected,
    }
  })
}

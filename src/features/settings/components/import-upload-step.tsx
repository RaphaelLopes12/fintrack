import { useRef, useState, useCallback } from 'react'
import { FileSpreadsheet, Upload, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ImportUploadStepProps {
  onFileParsed: (file: File) => Promise<void>
  isParsing: boolean
}

export function ImportUploadStep({
  onFileParsed,
  isParsing,
}: ImportUploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = useCallback(
    (file: File) => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext !== 'csv' && ext !== 'ofx') {
        return
      }
      onFileParsed(file)
    },
    [onFileParsed]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  return (
    <div className="py-4">
      <div
        role="button"
        tabIndex={0}
        className={cn(
          'relative flex flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-12 text-center transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50',
          isParsing && 'pointer-events-none opacity-60'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.ofx"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFile(file)
            e.target.value = ''
          }}
        />

        {isParsing ? (
          <>
            <Loader2 className="size-12 animate-spin text-primary" />
            <div>
              <p className="text-sm font-medium">Processando arquivo...</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Analisando transações
              </p>
            </div>
          </>
        ) : (
          <>
            <div className="flex size-16 items-center justify-center rounded-full bg-muted">
              {isDragging ? (
                <Upload className="size-8 text-primary" />
              ) : (
                <FileSpreadsheet className="size-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {isDragging
                  ? 'Solte o arquivo aqui'
                  : 'Arraste um arquivo ou clique para selecionar'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Formatos aceitos: CSV e OFX
              </p>
            </div>
            <Button type="button" variant="outline" size="sm">
              <Upload className="size-4" />
              Selecionar Arquivo
            </Button>
          </>
        )}
      </div>

      <div className="mt-4 rounded-lg bg-muted/50 p-4">
        <p className="text-xs font-medium text-muted-foreground mb-2">
          Bancos suportados:
        </p>
        <p className="text-xs text-muted-foreground">
          Nubank, Itaú, Bradesco, Santander, Banco do Brasil, Inter, C6, Caixa
          e outros que exportem em CSV ou OFX.
        </p>
      </div>
    </div>
  )
}

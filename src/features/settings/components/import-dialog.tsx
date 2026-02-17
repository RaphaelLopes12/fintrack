import { Loader2 } from 'lucide-react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { useImportTransactions } from '@/features/transactions/hooks/use-import-transactions'
import { ImportUploadStep } from './import-upload-step'
import { ImportPreviewStep } from './import-preview-step'
import { ImportResultStep } from './import-result-step'

interface ImportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STEP_TITLES: Record<string, string> = {
  upload: 'Importar Transações',
  preview: 'Revisar Transações',
  importing: 'Importando...',
  result: 'Importação Concluída',
}

const STEP_DESCRIPTIONS: Record<string, string> = {
  upload: 'Selecione um arquivo CSV ou OFX para importar transações.',
  preview: 'Revise as transações antes de importar.',
  importing: 'Aguarde enquanto as transações são importadas...',
  result: 'Veja o resumo da importação abaixo.',
}

export function ImportDialog({ open, onOpenChange }: ImportDialogProps) {
  const importState = useImportTransactions()

  function handleOpenChange(isOpen: boolean) {
    if (!isOpen && importState.step !== 'importing') {
      importState.reset()
    }
    if (importState.step !== 'importing') {
      onOpenChange(isOpen)
    }
  }

  const description =
    importState.step === 'preview' && importState.parseResult
      ? `${importState.parseResult.fileName} — ${STEP_DESCRIPTIONS[importState.step]}`
      : STEP_DESCRIPTIONS[importState.step]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{STEP_TITLES[importState.step]}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {importState.step === 'upload' && (
            <ImportUploadStep
              onFileParsed={importState.handleFileParsed}
              isParsing={importState.isParsing}
            />
          )}

          {importState.step === 'preview' && (
            <ImportPreviewStep
              transactions={importState.transactions}
              selectedCount={importState.selectedCount}
              toggleTransaction={importState.toggleTransaction}
              toggleAll={importState.toggleAll}
              updateCategory={importState.updateCategory}
              setDefaultCategory={importState.setDefaultCategory}
              startImport={importState.startImport}
              isImporting={importState.isImporting}
              replaceImport={importState.replaceImport}
              isReplacing={importState.isReplacing}
              goBack={importState.goBack}
            />
          )}

          {importState.step === 'importing' && (
            <div className="flex flex-col items-center gap-4 py-12">
              <Loader2 className="size-8 animate-spin text-primary" />
              <Progress value={50} className="w-64" />
              <p className="text-sm text-muted-foreground">
                Importando transações...
              </p>
            </div>
          )}

          {importState.step === 'result' && importState.summary && (
            <ImportResultStep
              summary={importState.summary}
              onClose={() => handleOpenChange(false)}
              onImportMore={importState.reset}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

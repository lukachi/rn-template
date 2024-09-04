import {
  ScanContextProvider,
  Steps,
  useDocumentScanContext,
} from '@/pages/app/pages/document-scan/context'

import {
  DocumentPreviewStep,
  GenerateProofStep,
  RevocationStep,
  ScanMrzStep,
  ScanNfcStep,
  SelectDocTypeStep,
  SuccessStep,
} from './components'

export default function DocumentScanScreen() {
  return (
    <ScanContextProvider>
      <DocumentScanContent />
    </ScanContextProvider>
  )
}

function DocumentScanContent() {
  const { currentStep } = useDocumentScanContext()

  return (
    <>
      {{
        [Steps.SelectDocTypeStep]: () => <SelectDocTypeStep />,
        [Steps.ScanMrzStep]: () => <ScanMrzStep />,
        [Steps.ScanNfcStep]: () => <ScanNfcStep />,
        [Steps.DocumentPreviewStep]: () => <DocumentPreviewStep />,
        [Steps.GenerateProofStep]: () => <GenerateProofStep />,
        [Steps.RevocationStep]: () => <RevocationStep />,
        [Steps.FinishStep]: () => <SuccessStep />,
      }[currentStep]()}
    </>
  )
}

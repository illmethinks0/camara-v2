import { FC } from 'react';

interface PDFFormProps {
  onSubmit: (formData: Record<string, string>) => void;
  isLoading?: boolean;
  generatedPDFs?: Array<{
    filename: string;
    displayName?: string;
    description?: string;
    downloadUrl: string;
  }>;
}

declare const PDFForm: FC<PDFFormProps>;
export default PDFForm;

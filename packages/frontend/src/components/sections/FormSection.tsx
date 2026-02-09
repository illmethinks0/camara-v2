/**
 * Form section component for PDF generation
 */

import React from 'react';
import PDFForm from '../PDFForm.jsx';
import type { PDFFormData, GeneratedPDF } from '../../types';

interface FormSectionProps {
  onSubmit: (formData: PDFFormData) => Promise<void>;
  isLoading: boolean;
  generatedPDFs: GeneratedPDF[];
}

export const FormSection: React.FC<FormSectionProps> = ({
  onSubmit,
  isLoading,
  generatedPDFs,
}) => {
  // Wrapper function to handle the async call properly
  const handleSubmit = async (formData: any) => {
    await onSubmit(formData);
  };

  return (
    <section id="form-section" className="section-band">
      <div className="container">
        <h2 className="text-center">Generar Documentos del Programa</h2>
        <div style={{ 
          maxWidth: '800px', 
          margin: '0 auto', 
          marginTop: 'var(--spacing-xl)' 
        }}>
          <PDFForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            generatedPDFs={generatedPDFs}
          />
        </div>
      </div>
    </section>
  );
};
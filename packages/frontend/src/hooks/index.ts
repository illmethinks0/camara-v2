/**
 * Custom hooks for the Talento 45+ application
 */

import { useState, useCallback } from 'react';
import type { NotificationState, PDFFormData, GeneratedPDF } from '../types';
import { generatePDFs } from '../services/api';

/**
 * Hook for managing notification state
 */
export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState | null>(null);

  const showNotification = useCallback((message: string, type: NotificationState['type'] = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
};

/**
 * Hook for managing PDF generation
 */
export const usePDFGeneration = () => {
  const [generatedPDFs, setGeneratedPDFs] = useState<GeneratedPDF[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePDFGeneration = useCallback(async (formData: PDFFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generatePDFs(formData);
      setGeneratedPDFs(result.files || []);
      return { success: true, files: result.files || [] };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetPDFs = useCallback(() => {
    setGeneratedPDFs([]);
    setError(null);
  }, []);

  return {
    generatedPDFs,
    isLoading,
    error,
    handlePDFGeneration,
    resetPDFs,
  };
};
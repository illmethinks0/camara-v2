/**
 * API service layer for handling HTTP requests
 */

import type { PDFFormData, APIResponse } from '../types';

class APIError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * Generates PDFs from form data
 * @param formData - The form data to process
 * @returns Promise with the API response
 * @throws APIError if the request fails
 */
export const generatePDFs = async (formData: PDFFormData): Promise<APIResponse> => {
  try {
    const response = await fetch('/api/generate-pdfs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new APIError(
        `Error al generar los PDFs: ${response.statusText}`,
        response.status
      );
    }

    const result: APIResponse = await response.json();
    
    if (!result.success) {
      throw new APIError(result.message || 'Error desconocido al generar PDFs');
    }

    return result;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // Network or other errors
    throw new APIError('Error de conexión. Por favor, inténtelo de nuevo.');
  }
};

/**
 * Generic API request helper
 * @param endpoint - The API endpoint
 * @param options - Fetch options
 * @returns Promise with the response data
 */
export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  try {
    const response = await fetch(endpoint, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new APIError(
        `API Error: ${response.statusText}`,
        response.status
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError('Error de conexión');
  }
};
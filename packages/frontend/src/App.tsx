/**
 * Main App component for the Talento 45+ application
 * Refactored with TypeScript, custom hooks, and modular components
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Design System Components
import { Header } from './components';

// Legacy Components (maintain for PDF functionality)
import Footer from './components/Footer';

// Section Components
import { HeroSection, FeaturesSection, FormSection, CTASection } from './components/sections';

// KPI Dashboard
import KPIDashboard from './components/KPIDashboard';

// Custom Hooks
import { useNotification, usePDFGeneration } from './hooks';

// Configuration
import {
  NAVIGATION_ITEMS,
  UTILITY_LINKS,
  HERO_CONTENT,
  FEATURE_CARDS,
  CTA_SECTION_CONTENT,
  LOGO_CONFIG,
} from './constants/content';

// Types
import type { PDFFormData } from './types';

/**
 * Main application component with routing
 */
const App: React.FC = () => {
  const { notification, showNotification } = useNotification();
  const { generatedPDFs, isLoading, handlePDFGeneration } = usePDFGeneration();

  /**
   * Handles PDF generation with proper error handling and notifications
   */
  const onPDFGeneration = async (formData: PDFFormData): Promise<void> => {
    const result = await handlePDFGeneration(formData);
    
    if (result.success) {
      showNotification('PDFs generados correctamente', 'success');
    } else {
      showNotification(result.error || 'Error al generar los PDFs', 'error');
    }
  };

  const MainPage = () => (
    <>
      <HeroSection content={HERO_CONTENT} />

      <FeaturesSection 
        title="Características del Programa"
        cards={FEATURE_CARDS}
      />

      <FormSection
        onSubmit={onPDFGeneration}
        isLoading={isLoading}
        generatedPDFs={generatedPDFs}
      />

      <CTASection
        title={CTA_SECTION_CONTENT.title}
        description={CTA_SECTION_CONTENT.description}
        ctaText={CTA_SECTION_CONTENT.ctaText}
        ctaHref={CTA_SECTION_CONTENT.ctaHref}
      />
    </>
  );

  return (
    <Router>
      <div className="app">
        <Header
          logo={
            <img 
              src={LOGO_CONFIG.src}
              alt={LOGO_CONFIG.alt}
              style={{ height: LOGO_CONFIG.height, width: 'auto' }}
            />
          }
          navItems={NAVIGATION_ITEMS}
          utilityLinks={UTILITY_LINKS}
        />
        
        <main>
          {notification && (
            <div className={`alert alert-${notification.type} container`} style={{ marginTop: '16px' }}>
              {notification.message}
            </div>
          )}
          
          <Routes>
            <Route path="/" element={<MainPage />} />
            <Route path="/kpis" element={<KPIDashboard />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;
import { useState } from 'react'
import './App.css'

// Design System Components
import { Header, Hero, Card, Button } from './components'

// Legacy Components (keep for PDF functionality)
import PDFForm from './components/PDFForm'
import Footer from './components/Footer'

function App() {
  const [generatedPDFs, setGeneratedPDFs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [notification, setNotification] = useState(null)

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 5000)
  }

  const handlePDFGeneration = async (formData) => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-pdfs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Error al generar los PDFs')
      }

      const result = await response.json()
      
      // Ensure we have valid data structure
      const pdfs = result.downloadLinks || result.files || []
      setGeneratedPDFs(Array.isArray(pdfs) ? pdfs : [])
      
      showNotification('PDFs generados correctamente', 'success')
    } catch (error) {
      console.error('Error:', error)
      showNotification('Error al generar los PDFs', 'error')
      setGeneratedPDFs([]) // Reset to empty array on error
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="app">
      <Header
        logo={
          <img 
            src="/Screenshot 2025-10-05 at 16.27.51.png" 
            alt="Cámara de Comercio de Menorca" 
            style={{ height: '48px', width: 'auto' }}
          />
        }
        navItems={[
          { label: 'Inicio', href: '/' },
          { label: 'Programas', href: '/programas' },
          { label: 'Servicios', href: '/servicios' },
          { label: 'Contacto', href: '/contacto' },
        ]}
        utilityLinks={[
          { label: 'Portal Empleo', href: '/empleo' },
          { label: 'Área Cliente', href: '/area-cliente' },
        ]}
      />
      
      <main>
        {notification && (
          <div className={`alert alert-${notification.type} container`} style={{ marginTop: '16px' }}>
            {notification.message}
          </div>
        )}
        
        <Hero
          eyebrow="Programa Oficial"
          title="Talento 45+ - Generador de Documentos"
          bullets={[
            'Formación especializada en competencias digitales',
            'Dirigido a personas mayores de 45 años en desempleo',
            'Certificación oficial de la Cámara de Comercio',
            'Seguimiento personalizado y apoyo continuo'
          ]}
          primaryCTA={{ 
            text: 'Generar Documentos', 
            onClick: () => document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' })
          }}
          secondaryCTA={{ text: 'Más información', href: '/programas/talento-45' }}
          image={{ src: '/hero-formacion-digital.jpg', alt: 'Persona en formación digital trabajando con laptop' }}
          backgroundColor="sand"
        />

        <section className="section-band" style={{ background: 'var(--color-surface-sky)' }}>
          <div className="container">
            <h2 className="text-center">Características del Programa</h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: 'var(--spacing-lg)',
              marginTop: 'var(--spacing-xl)'
            }}>
              <Card
                title="Formación Digital"
                summary="Competencias tecnológicas esenciales para el mercado laboral actual"
                ctaText="Más detalles"
                ctaHref="/formacion-digital"
                meta={{ category: 'Competencias' }}
              />
              <Card
                title="Orientación Laboral"
                summary="Asesoramiento personalizado para mejorar la empleabilidad"
                ctaText="Consultar"
                ctaHref="/orientacion"
                meta={{ category: 'Apoyo' }}
              />
              <Card
                title="Seguimiento Continuo"
                summary="Acompañamiento durante todo el proceso formativo"
                ctaText="Conocer más"
                ctaHref="/seguimiento"
                meta={{ category: 'Soporte' }}
              />
            </div>
          </div>
        </section>

        <section id="form-section" className="section-band">
          <div className="container">
            <h2 className="text-center">Generar Documentos del Programa</h2>
            <div style={{ maxWidth: '800px', margin: '0 auto', marginTop: 'var(--spacing-xl)' }}>
              <PDFForm 
                onSubmit={handlePDFGeneration}
                isLoading={isLoading}
                generatedPDFs={generatedPDFs}
              />
            </div>
          </div>
        </section>

        <section className="section-band" style={{ background: 'var(--color-accent-yellow)' }}>
          <div className="container text-center">
            <h2>¿Necesita más información?</h2>
            <p style={{ 
              fontSize: 'var(--font-size-body)', 
              marginBottom: 'var(--spacing-lg)',
              maxWidth: '600px',
              margin: '0 auto var(--spacing-lg)'
            }}>
              Contacte con nuestro equipo especializado para resolver dudas sobre el programa 
              Talento 45+ y conocer todas las oportunidades disponibles.
            </p>
            <a href="/contacto">
              <Button variant="primary" size="large">Contactar ahora</Button>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default App

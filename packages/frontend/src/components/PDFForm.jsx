import React, { useState } from 'react'

const PDFForm = ({ onSubmit, isLoading, generatedPDFs }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellidos: '',
    dni: '',
    telefono: '',
    email: '',
    direccion: '',
    fecha_nacimiento: '',
    nacionalidad: 'Española',
    genero: '',
    nivel_estudios: '',
    situacion_laboral: '',
    observaciones: ''
  })

  const [errors, setErrors] = useState({})
  const [isDownloadingAll, setIsDownloadingAll] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.nombre.trim()) {
      newErrors.nombre = 'El nombre es obligatorio'
    }
    
    if (!formData.apellidos.trim()) {
      newErrors.apellidos = 'Los apellidos son obligatorios'
    }
    
    if (!formData.dni.trim()) {
      newErrors.dni = 'El DNI/NIE es obligatorio'
    }
    
    if (!formData.telefono.trim()) {
      newErrors.telefono = 'El teléfono es obligatorio'
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'El email es obligatorio'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'El email no es válido'
    }
    
    if (!formData.direccion.trim()) {
      newErrors.direccion = 'La dirección es obligatoria'
    }
    
    if (!formData.fecha_nacimiento) {
      newErrors.fecha_nacimiento = 'La fecha de nacimiento es obligatoria'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  const templateDescriptions = {
    // Core Registration & Assessment
    'Anexo_02': 'Registro AGI - Documento principal de registro',
    'Anexo_03': 'Informe de Orientación - Evaluación y orientación',
    'Anexo_03a': 'Prueba de Nivel - Evaluación de competencias',
    'Anexo_04': 'Acta de Seguimiento - Control de progreso',
    'Anexo_05': 'Inscripción Formación - Formulario de inscripción',
    
    // Survey & Feedback
    'Anexo_08a': 'Encuesta Satisfacción Alumno - Evaluación del programa',
    'Anexo_08b': 'Encuesta Satisfacción Formador - Evaluación docente',
    
    // Results & Evaluation
    'Anexo_09': 'Resultados Actuación - Informe de resultados',
    'Anexo_17': 'Prueba Evaluación Final - Examen final',
    
    // Certificates & Diplomas
    'Anexo_10': 'Diploma Aprovechamiento - Certificado de finalización',
    'Anexo_10A': 'Certificado Asistencia - Certificado de participación',
    
    // Financial Support
    'Anexo_12': 'Solicitud Beca Transporte - Ayuda económica',
    'Anexo_13': 'Certificado No Acumulación - Declaración de ayudas',
    
    // Diagnosis & Tools
    'Anexo_14': 'Diagnóstico Reconversión - Evaluación profesional',
    'Anexo_14a': 'Herramientas Intermediación - Recursos laborales',
    'anexo_14a': 'Herramientas Intermediación - Recursos laborales',
    
    // Administrative
    'Anexo_15': 'Declaración Código Conducta - Normativa de comportamiento',
    'Anexo_18a': 'Instrucciones Redistribución - Procedimientos administrativos',
    
    // Budget & Planning
    'Anexo_18c': 'Redistribución Presupuesto - Planificación financiera',
    'Anexo_19': 'Inscripción Segunda Formación - Formación adicional'
  }

  const handleDownloadAll = async () => {
    if (!generatedPDFs || generatedPDFs.length === 0) return

    setIsDownloadingAll(true)

    try {
      // Call the backend endpoint to create and download a ZIP file
      const response = await fetch('/api/download-all', {
        method: 'GET'
      })

      if (response.ok) {
        // Get the ZIP file as a blob
        const blob = await response.blob()

        // Create a download link and trigger the download
        const url = window.URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `PDFs_Talento45_${new Date().toISOString().slice(0, 10)}.zip`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
      } else {
        console.error('Error downloading all PDFs')
        alert('Error al descargar todos los PDFs. Por favor, intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error downloading all PDFs:', error)
      alert('Error al descargar todos los PDFs. Por favor, intenta de nuevo.')
    } finally {
      setIsDownloadingAll(false)
    }
  }

  return (
    <div className="pdf-form">
      <h2 className="form-section-title">
        Datos del Participante
      </h2>
      
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">
              Nombre <span className="required">*</span>
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              className={`form-input ${errors.nombre ? 'error' : ''}`}
              placeholder="Ej: Ana María"
            />
            {errors.nombre && <span className="error-text">{errors.nombre}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Apellidos <span className="required">*</span>
            </label>
            <input
              type="text"
              name="apellidos"
              value={formData.apellidos}
              onChange={handleChange}
              className={`form-input ${errors.apellidos ? 'error' : ''}`}
              placeholder="Ej: García López"
            />
            {errors.apellidos && <span className="error-text">{errors.apellidos}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              DNI/NIE <span className="required">*</span>
            </label>
            <input
              type="text"
              name="dni"
              value={formData.dni}
              onChange={handleChange}
              className={`form-input ${errors.dni ? 'error' : ''}`}
              placeholder="Ej: 12345678A"
            />
            {errors.dni && <span className="error-text">{errors.dni}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Teléfono <span className="required">*</span>
            </label>
            <input
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className={`form-input ${errors.telefono ? 'error' : ''}`}
              placeholder="Ej: 666123456"
            />
            {errors.telefono && <span className="error-text">{errors.telefono}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="Ej: ana.garcia@email.com"
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Dirección <span className="required">*</span>
            </label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className={`form-input ${errors.direccion ? 'error' : ''}`}
              placeholder="Ej: Calle Mayor 123, 4º B"
            />
            {errors.direccion && <span className="error-text">{errors.direccion}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">
              Fecha de nacimiento <span className="required">*</span>
            </label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              className={`form-input ${errors.fecha_nacimiento ? 'error' : ''}`}
            />
            {errors.fecha_nacimiento && <span className="error-text">{errors.fecha_nacimiento}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Nacionalidad</label>
            <select
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleChange}
              className="form-select"
            >
              <option value="Española">Española</option>
              <option value="Extranjera UE">Extranjera UE</option>
              <option value="Extranjera no UE">Extranjera no UE</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Género</label>
            <select
              name="genero"
              value={formData.genero}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Seleccionar...</option>
              <option value="Femenino">Femenino</option>
              <option value="Masculino">Masculino</option>
              <option value="No binario">No binario</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Nivel de estudios</label>
            <select
              name="nivel_estudios"
              value={formData.nivel_estudios}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Seleccionar...</option>
              <option value="Sin estudios">Sin estudios</option>
              <option value="Educación Primaria">Educación Primaria</option>
              <option value="ESO">ESO</option>
              <option value="Bachillerato">Bachillerato</option>
              <option value="FP Grado Medio">FP Grado Medio</option>
              <option value="FP Grado Superior">FP Grado Superior</option>
              <option value="Universidad">Universidad</option>
              <option value="Postgrado">Postgrado</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Situación laboral</label>
            <select
              name="situacion_laboral"
              value={formData.situacion_laboral}
              onChange={handleChange}
              className="form-select"
            >
              <option value="">Seleccionar...</option>
              <option value="Desempleado">Desempleado</option>
              <option value="Empleado">Empleado</option>
              <option value="Autónomo">Autónomo</option>
              <option value="Jubilado">Jubilado</option>
              <option value="Estudiante">Estudiante</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Observaciones</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="form-textarea"
            placeholder="Información adicional sobre el participante..."
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className={`btn btn-primary ${isLoading ? 'btn-loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Generando PDFs...
              </>
            ) : (
              '📄 Generar todos los PDFs'
            )}
          </button>
        </div>
      </form>

      {generatedPDFs && generatedPDFs.length > 0 && (
        <div className="pdf-downloads">
          <h3>✅ PDFs Generados Correctamente</h3>
          <p>Haz clic en cualquier documento para descargarlo:</p>
          
          <div className="download-all-section">
            <button
              onClick={handleDownloadAll}
              className="download-all-btn"
              disabled={isDownloadingAll}
            >
              {isDownloadingAll ? '📦 Preparando descarga...' : '📦 Descargar Todos los PDFs'}
            </button>
          </div>
          
          <div className="pdf-list">
            {generatedPDFs.map((file, index) => {
              // Ensure file and filename exist before processing
              if (!file || !file.filename) {
                return null
              }
              
              // Use the displayName from the API response, fallback to old logic if not available
              const templateName = file.displayName || Object.keys(templateDescriptions)
                .sort((a, b) => b.length - a.length)
                .find(key => file.filename && file.filename.includes(key)) || 'Documento'
              
              const templateDescription = file.description || templateDescriptions[templateName] || 'Documento generado'
              
              return (
                <div key={index} className="pdf-item">
                  <div className="pdf-info">
                    <div className="pdf-name">{templateName}</div>
                    <div className="pdf-description">
                      {templateDescription}
                    </div>
                  </div>
                  <a
                    href={file.downloadUrl}
                    className="download-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    � Descargar PDF
                  </a>
                </div>
              )
            }).filter(Boolean)}
          </div>
        </div>
      )}
    </div>
  )
}

export default PDFForm
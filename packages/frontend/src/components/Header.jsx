import React from 'react'

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="logo">
            <div className="logo-icon">🏢</div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: '500' }}>
                Cámara de Comercio de Menorca
              </div>
              <div style={{ fontSize: '12px', fontWeight: '300', opacity: '0.9' }}>
                Corporación de Derecho Público • Fundada en 1906
              </div>
            </div>
          </div>
          <nav className="nav">
            <a href="https://www.camaramenorca.com" target="_blank" rel="noopener noreferrer">
              Sitio Web
            </a>
            <a href="https://www.camaramenorca.com/formacion-para-mayores-de-45-anos" target="_blank" rel="noopener noreferrer">
              Talento 45+
            </a>
            <a href="https://www.camaramenorca.com/club-camara" target="_blank" rel="noopener noreferrer">
              Club Cámara
            </a>
          </nav>
        </div>
      </div>
    </header>
  )
}

export default Header
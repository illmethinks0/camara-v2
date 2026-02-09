import React from 'react'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>Cámara de Comercio de Menorca</h3>
            <p>
              Corporación de Derecho Público fundada en 1906, dedicada a promover 
              el desarrollo económico y empresarial de Menorca.
            </p>
          </div>
          
          <div className="footer-section">
            <h4>Contacto</h4>
            <p>📍 Calle de Miguel de Veri, 3A</p>
            <p>📮 07703 Mahón, Islas Baleares</p>
            <p>📞 971 36 31 94</p>
            <p>✉️ camaramenorca@camaramenorca.com</p>
          </div>
          
          <div className="footer-section">
            <h4>Horarios</h4>
            <p>Lunes a Viernes</p>
            <p>7:00 - 15:00 horas</p>
          </div>
          
          <div className="footer-section">
            <h4>Programa Talento 45+</h4>
            <p>
              Formación especializada para personas mayores de 45 años 
              en situación de desempleo.
            </p>
            <a 
              href="https://www.camaramenorca.com/formacion-para-mayores-de-45-anos"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-link"
            >
              Más información →
            </a>
          </div>
        </div>
        
        <div className="footer-bottom">
          <div className="footer-links">
            <a href="https://www.camaramenorca.com/aviso-legal" target="_blank" rel="noopener noreferrer">
              Aviso Legal
            </a>
            <a href="https://www.camaramenorca.com/politica-de-privacidad" target="_blank" rel="noopener noreferrer">
              Política de Privacidad
            </a>
            <a href="https://www.camaramenorca.com/cookie-policy" target="_blank" rel="noopener noreferrer">
              Política de Cookies
            </a>
          </div>
          
          <div className="footer-copyright">
            <p>© 2025 Cámara de Comercio de Menorca. Todos los derechos reservados.</p>
          </div>
          
          <div className="footer-social">
            <a href="https://www.facebook.com/profile.php?id=61560573659573" target="_blank" rel="noopener noreferrer">
              Facebook
            </a>
            <a href="https://www.camaramenorca.com/website/social/linkedin" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="https://www.camaramenorca.com/website/social/instagram" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
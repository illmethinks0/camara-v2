import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Header.module.css';

interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

interface HeaderProps {
  logo: React.ReactNode;
  navItems: NavItem[];
  utilityLinks?: { label: string; href: string }[];
}

export const Header: React.FC<HeaderProps> = ({ logo, navItems, utilityLinks }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isExternalLink = (href: string) => href.startsWith('http') || href.startsWith('/empleo') || href.startsWith('/area-cliente');

  return (
    <header className={styles.header}>
      <a href="#main" className="skip-link">
        Ir al contenido principal
      </a>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link to="/">{logo}</Link>
        </div>

        <nav className={styles.nav} aria-label="Principal">
          <ul className={styles.navList}>
            {navItems.map((item, index) => (
              <li key={index} className={styles.navItem}>
                {isExternalLink(item.href) ? (
                  <a href={item.href}>{item.label}</a>
                ) : (
                  <Link 
                    to={item.href}
                    className={location.pathname === item.href ? styles.active : ''}
                  >
                    {item.label}
                  </Link>
                )}
                {item.children && (
                  <ul className={styles.dropdown}>
                    {item.children.map((child, childIndex) => (
                      <li key={childIndex}>
                        {isExternalLink(child.href) ? (
                          <a href={child.href}>{child.label}</a>
                        ) : (
                          <Link to={child.href}>{child.label}</Link>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {utilityLinks && (
          <div className={styles.utilityLinks}>
            {utilityLinks.map((link, index) => (
              <a key={index} href={link.href} className={styles.utilityLink}>
                {link.label}
              </a>
            ))}
          </div>
        )}

        <button
          className={styles.mobileMenuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Abrir menú de navegación"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <ul>
            {navItems.map((item, index) => (
              <li key={index}>
                {isExternalLink(item.href) ? (
                  <a href={item.href} onClick={() => setMobileMenuOpen(false)}>
                    {item.label}
                  </a>
                ) : (
                  <Link 
                    to={item.href} 
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </header>
  );
};
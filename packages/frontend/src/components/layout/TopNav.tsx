import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../Button/Button';
import styles from './TopNav.module.css';

const navItems = [
  { label: 'Inicio', path: '/' },
  { label: 'Login', path: '/login' },
  { label: 'Admin', path: '/admin' },
  { label: 'Instructor', path: '/instructor' },
  { label: 'Participante', path: '/participante' },
  { label: 'Registro', path: '/registro' },
];

export const TopNav: React.FC = () => {
  const location = useLocation();

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <span className={styles.logo}>Camara v2</span>
        <span className={styles.tagline}>Gestion de Formacion</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link key={item.path} to={item.path} className={styles.navLink}>
            <Button
              variant={location.pathname === item.path ? 'primary' : 'outline'}
              size="small"
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </nav>
    </header>
  );
};

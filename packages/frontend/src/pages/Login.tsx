import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import styles from './Auth.module.css';

const DEMO_PASSWORD = 'CamaraMenorca2025';

const roleRouteByEmail: Record<string, string> = {
  'admin@camara-menorca.es': '/admin',
  'instructor1@camara-menorca.es': '/instructor',
  'participant1@camara-menorca.es': '/participante',
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const route = roleRouteByEmail[email.trim().toLowerCase()];

    if (!route || password !== DEMO_PASSWORD) {
      setError('Credenciales invalidas');
      return;
    }

    navigate(route);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Iniciar Sesion</h1>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error} role="alert">
              {error}
            </div>
          )}
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>
              Correo electronico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Contrasena
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
            />
          </div>
          <Button type="submit" className={styles.submitButton}>
            Entrar
          </Button>
        </form>
        <p className={styles.switchAuth}>Demo: usa las credenciales del guion de Madrid.</p>
      </div>
    </div>
  );
};

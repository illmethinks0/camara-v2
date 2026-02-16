import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { useAuth } from '../contexts/AuthContext';
import styles from './Auth.module.css';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    const result = await login(email.trim(), password);

    if (!result.success || !result.data?.user.role) {
      setError(result.error?.message || 'Credenciales invalidas');
      setIsSubmitting(false);
      return;
    }

    if (result.data.user.role === 'administrator') {
      navigate('/admin');
      setIsSubmitting(false);
      return;
    }

    if (result.data.user.role === 'instructor') {
      navigate('/instructor');
      setIsSubmitting(false);
      return;
    }

    navigate('/participante');
    setIsSubmitting(false);
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
          <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
            {isSubmitting ? 'Validando...' : 'Entrar'}
          </Button>
        </form>
        <p className={styles.switchAuth}>Usa las credenciales demo del guion de Madrid.</p>
      </div>
    </div>
  );
};

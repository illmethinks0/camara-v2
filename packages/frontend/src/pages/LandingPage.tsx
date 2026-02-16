import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import styles from './LandingPage.module.css';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>CAMARA v2</h1>
        <p className={styles.subtitle}>Task Management Application</p>
        <div className={styles.buttons}>
          <Button onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button variant="secondary" onClick={() => navigate('/register')}>
            Register
          </Button>
        </div>
      </div>
    </div>
  );
};

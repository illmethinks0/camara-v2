import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import styles from './Home.module.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <section className={styles.hero}>
      <div className={styles.content}>
        <p className={styles.kicker}>Demo Madrid</p>
        <h1 className={styles.title}>Plataforma de Gestion de Programas</h1>
        <p className={styles.subtitle}>
          Flujo completo de participantes, fases, anexos y firma digital para Camara de Comercio
          Menorca.
        </p>
        <div className={styles.actions}>
          <Button onClick={() => navigate('/admin')}>Panel Administrador</Button>
          <Button variant="secondary" onClick={() => navigate('/instructor')}>
            Panel Instructor
          </Button>
          <Button variant="outline" onClick={() => navigate('/participante')}>
            Panel Participante
          </Button>
        </div>
      </div>
      <div className={styles.summary}>
        <div className={styles.card}>
          <h3>Objetivo del Demo</h3>
          <ul>
            <li>Registro de participantes</li>
            <li>Progreso por fases</li>
            <li>Generacion de anexos</li>
            <li>Firma digital simulada</li>
          </ul>
        </div>
        <div className={styles.card}>
          <h3>Roles</h3>
          <ul>
            <li>Administrador: controla todo el programa</li>
            <li>Instructor: gestiona sus participantes</li>
            <li>Participante: firma y consulta sus anexos</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

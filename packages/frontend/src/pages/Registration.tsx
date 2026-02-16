import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button/Button';
import { useDemoData } from '../contexts/DemoDataContext';
import styles from './Registration.module.css';

export const Registration: React.FC = () => {
  const navigate = useNavigate();
  const { courses, registerParticipant, error: contextError } = useDemoData();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    email: '',
    phone: '',
    courseId: courses[0]?.id || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!form.courseId && courses[0]) {
      setForm((prev) => ({ ...prev, courseId: courses[0].id }));
    }
  }, [courses, form.courseId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    setIsSubmitting(true);
    try {
      await registerParticipant(form);
      navigate('/admin');
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : 'No se pudo registrar el participante');
    } finally {
      setIsSubmitting(false);
    }
  };

  const activeError = localError || contextError;

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Registro de Participante</h1>
        <p className={styles.subtitle}>
          Completa los datos para iniciar el flujo del programa y generar el primer anexo.
        </p>
        {activeError ? (
          <p role="alert" className={styles.subtitle}>
            {activeError}
          </p>
        ) : null}
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="firstName">Nombre</label>
              <input
                id="firstName"
                value={form.firstName}
                onChange={(e) => handleChange('firstName', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="lastName">Apellidos</label>
              <input
                id="lastName"
                value={form.lastName}
                onChange={(e) => handleChange('lastName', e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="idNumber">DNI / NIE</label>
              <input
                id="idNumber"
                value={form.idNumber}
                onChange={(e) => handleChange('idNumber', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="phone">Telefono</label>
              <input
                id="phone"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="course">Curso asignado</label>
              <select
                id="course"
                value={form.courseId}
                onChange={(e) => handleChange('courseId', e.target.value)}
              >
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className={styles.actions}>
            <Button type="button" variant="outline" onClick={() => navigate('/admin')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Registrando...' : 'Registrar participante'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

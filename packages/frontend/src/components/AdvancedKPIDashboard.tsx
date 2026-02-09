import React, { useState, useEffect } from 'react';
import SalesMetrics from './dashboard/SalesMetrics';
import TopPerformingFiles from './dashboard/TopPerformingFiles';
import ProcessingSpeed from './dashboard/ProcessingSpeed';
import LocationStats from './dashboard/LocationStats';
import SatisfactionGauge from './dashboard/SatisfactionGauge';
import RecentActivity from './dashboard/RecentActivity';
import GeographicMap from './dashboard/GeographicMap';
import styles from './AdvancedKPIDashboard.module.css';
import './dashboard-tokens.css';

interface DashboardData {
  salesMetrics: {
    totalFiles: number;
    monthlyGrowth: number;
    todayCount: number;
    yesterdayCount: number;
  };
  topFiles: Array<{
    id: number;
    formName: string;
    count: number;
  }>;
  processingSpeed: {
    averageTime: string;
    fastestTime: string;
    weeklyChange: number;
  };
  locations: Array<{
    city: string;
    state: string;
    count: number;
    trend?: number;
  }>;
  satisfaction: {
    score: number;
    maxScore: number;
  };
  recentActivity: Array<{
    id: number;
    formType: string;
    status: 'success' | 'error' | 'warning' | 'info';
    timestamp: string;
    userInfo?: string;
  }>;
  locationCoordinates: Array<{
    city: string;
    state: string;
    lat: number;
    lng: number;
    count: number;
  }>;
}

const AdvancedKPIDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch KPI data from the API
      const response = await fetch('/api/kpis');
      const kpiData = await response.json();
      
      // Transform API data to dashboard format
      const transformedData: DashboardData = {
        salesMetrics: {
          totalFiles: kpiData.totalFiles || 0,
          monthlyGrowth: 16, // Calculate based on historical data
          todayCount: kpiData.dailyStats?.today || 0,
          yesterdayCount: kpiData.dailyStats?.yesterday || 0,
        },
        topFiles: kpiData.fileTypeStats?.map((file: any, index: number) => ({
          id: index + 1,
          formName: getFormDisplayName(file.templateName),
          count: file.totalGenerated || 0,
        })) || getMockTopFiles(),
        processingSpeed: {
          averageTime: `${(kpiData.averageProcessingTime / 1000).toFixed(1)}s` || '2.3s',
          fastestTime: `${(kpiData.fastestProcessingTime / 1000).toFixed(1)}s` || '0.8s',
          weeklyChange: -5, // Negative is better (faster)
        },
        locations: getMockLocations(),
        satisfaction: {
          score: 85,
          maxScore: 100,
        },
        recentActivity: kpiData.recentSessions?.slice(0, 4).map((session: any, index: number) => ({
          id: index + 1,
          formType: getFormDisplayName(session.files?.[0]?.templateName || 'Unknown'),
          status: 'success' as const,
          timestamp: session.timestamp,
          userInfo: `${session.userInfo?.nombre || 'Usuario'} ${session.userInfo?.apellidos || ''}`.trim(),
        })) || getMockRecentActivity(),
        locationCoordinates: getMockLocationCoordinates(),
      };
      
      setDashboardData(transformedData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use mock data as fallback
      setDashboardData(getMockDashboardData());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Helper functions for mock data and transformations
  const getFormDisplayName = (templateName: string): string => {
    const displayNames: { [key: string]: string } = {
      'anexo_02': 'Anexo 02 - Registro AGI',
      'anexo_03': 'Anexo 03 - Informe Orientación',
      'anexo_04': 'Anexo 04 - Acta Seguimiento',
      'anexo_05': 'Anexo 05 - Inscripción Formación',
      'anexo_14a': 'Anexo 14a - Evaluación',
      'anexo_16': 'Anexo 16 - Certificado',
      'anexo_17': 'Anexo 17 - Informe Final',
    };
    return displayNames[templateName] || templateName;
  };

  const getMockTopFiles = () => [
    { id: 1, formName: 'Anexo 05 - Inscripción Formación', count: 45 },
    { id: 2, formName: 'Anexo 02 - Registro AGI', count: 38 },
    { id: 3, formName: 'Anexo 03 - Informe Orientación', count: 32 },
    { id: 4, formName: 'Anexo 04 - Acta Seguimiento', count: 28 },
    { id: 5, formName: 'Anexo 16 - Certificado', count: 24 },
  ];

  const getMockLocations = () => [
    { city: 'Mahón', state: 'Menorca', count: 45, trend: 12 },
    { city: 'Ciutadella', state: 'Menorca', count: 38, trend: 8 },
    { city: 'Palma', state: 'Mallorca', count: 32, trend: -3 },
    { city: 'Ibiza', state: 'Ibiza', count: 28, trend: 15 },
    { city: 'Barcelona', state: 'Cataluña', count: 24, trend: 5 },
    { city: 'Madrid', state: 'Madrid', count: 20, trend: -2 },
  ];

  const getMockRecentActivity = () => [
    { id: 1, formType: 'Anexo 05 - Inscripción', status: 'success' as const, timestamp: new Date(Date.now() - 300000).toISOString(), userInfo: 'María García' },
    { id: 2, formType: 'Anexo 02 - Registro AGI', status: 'success' as const, timestamp: new Date(Date.now() - 900000).toISOString(), userInfo: 'Juan Martínez' },
    { id: 3, formType: 'Anexo 03 - Orientación', status: 'success' as const, timestamp: new Date(Date.now() - 1800000).toISOString(), userInfo: 'Ana Fernández' },
    { id: 4, formType: 'Anexo 04 - Seguimiento', status: 'success' as const, timestamp: new Date(Date.now() - 3600000).toISOString(), userInfo: 'Pedro López' },
  ];

  const getMockLocationCoordinates = () => [
    { city: 'Mahón', state: 'Menorca', lat: 39.8885, lng: 4.2777, count: 45 },
    { city: 'Ciutadella', state: 'Menorca', lat: 40.0006, lng: 3.8367, count: 38 },
    { city: 'Palma', state: 'Mallorca', lat: 39.5696, lng: 2.6502, count: 32 },
    { city: 'Barcelona', state: 'Cataluña', lat: 41.3851, lng: 2.1734, count: 28 },
    { city: 'Madrid', state: 'Madrid', lat: 40.4168, lng: -3.7038, count: 24 },
  ];

  const getMockDashboardData = (): DashboardData => ({
    salesMetrics: {
      totalFiles: 297000,
      monthlyGrowth: 16,
      todayCount: 9600,
      yesterdayCount: 8400,
    },
    topFiles: getMockTopFiles(),
    processingSpeed: {
      averageTime: '2.3s',
      fastestTime: '0.8s',
      weeklyChange: -5,
    },
    locations: getMockLocations(),
    satisfaction: {
      score: 85,
      maxScore: 100,
    },
    recentActivity: getMockRecentActivity(),
    locationCoordinates: getMockLocationCoordinates(),
  });

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className="loading-spinner"></div>
        <p>Cargando dashboard...</p>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className={styles.errorContainer}>
        <p>Error al cargar los datos del dashboard</p>
        <button onClick={fetchDashboardData} className="button">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.dashboardHeader}>
        <div className={styles.headerContent}>
          <h1 className={styles.dashboardTitle}>Panel de Control - Talento 45+</h1>
          <div className={styles.headerActions}>
            <div className={styles.lastUpdated}>
              Última actualización: {lastUpdated.toLocaleTimeString('es-ES')}
            </div>
            <button 
              onClick={fetchDashboardData} 
              className={styles.refreshButton}
              disabled={isLoading}
            >
              ⟳ Actualizar
            </button>
          </div>
        </div>
      </header>

      <main className={styles.dashboardGrid}>
        <div className={styles.salesMetricsContainer}>
          <SalesMetrics {...dashboardData.salesMetrics} />
        </div>
        
        <div className={styles.topFilesContainer}>
          <TopPerformingFiles filesData={dashboardData.topFiles} />
        </div>
        
        <div className={styles.processingSpeedContainer}>
          <ProcessingSpeed {...dashboardData.processingSpeed} />
        </div>
        
        <div className={styles.locationStatsContainer}>
          <LocationStats locationData={dashboardData.locations} />
        </div>
        
        <div className={styles.satisfactionContainer}>
          <SatisfactionGauge {...dashboardData.satisfaction} />
        </div>
        
        <div className={styles.recentActivityContainer}>
          <RecentActivity activities={dashboardData.recentActivity} />
        </div>
        
        <div className={styles.geographicMapContainer}>
          <GeographicMap locationCoordinates={dashboardData.locationCoordinates} />
        </div>
      </main>

      <footer className={styles.dashboardFooter}>
        <div className={styles.footerContent}>
          <p>© 2025 Cámara de Comercio de Menorca - Sistema de Gestión Documental</p>
          <div className={styles.footerStats}>
            <span>Tiempo de respuesta: {dashboardData.processingSpeed.averageTime}</span>
            <span>•</span>
            <span>Total procesados: {dashboardData.salesMetrics.totalFiles.toLocaleString()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AdvancedKPIDashboard;
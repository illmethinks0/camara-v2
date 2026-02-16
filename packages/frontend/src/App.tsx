import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DemoDataProvider } from './contexts/DemoDataContext';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TopNav } from './components/layout/TopNav';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Registration } from './pages/Registration';
import { AdminDashboard } from './pages/AdminDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { ParticipantDashboard } from './pages/ParticipantDashboard';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <DemoDataProvider>
        <Router>
          <TopNav />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/registro"
              element={(
                <ProtectedRoute allowedRoles={['administrator']}>
                  <Registration />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/admin"
              element={(
                <ProtectedRoute allowedRoles={['administrator']}>
                  <AdminDashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/instructor"
              element={(
                <ProtectedRoute allowedRoles={['instructor', 'administrator']}>
                  <InstructorDashboard />
                </ProtectedRoute>
              )}
            />
            <Route
              path="/participante"
              element={(
                <ProtectedRoute allowedRoles={['participant', 'administrator']}>
                  <ParticipantDashboard />
                </ProtectedRoute>
              )}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </DemoDataProvider>
    </AuthProvider>
  );
};

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DemoDataProvider } from './contexts/DemoDataContext';
import { TopNav } from './components/layout/TopNav';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Registration } from './pages/Registration';
import { AdminDashboard } from './pages/AdminDashboard';
import { InstructorDashboard } from './pages/InstructorDashboard';
import { ParticipantDashboard } from './pages/ParticipantDashboard';

const App: React.FC = () => {
  return (
    <DemoDataProvider>
      <Router>
        <TopNav />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registration />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/instructor" element={<InstructorDashboard />} />
          <Route path="/participante" element={<ParticipantDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </DemoDataProvider>
  );
};

export default App;

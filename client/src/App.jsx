import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Header from './components/layout/Header';
import ProtectedRoute from './components/layout/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ProjectPage from './pages/ProjectPage';
import InvitationsPage from './pages/InvitationsPage'; // <-- NEW

function App() {
  return (
    <div className="bg-body" style={{ minHeight: '100vh' }}>
      <Header />
      <main>
        <Container className="py-4">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/project/:id" element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
            <Route path="/invitations" element={<ProtectedRoute><InvitationsPage /></ProtectedRoute>} /> {/* <-- NEW */}
          </Routes>
        </Container>
      </main>
    </div>
  );
}

export default App;
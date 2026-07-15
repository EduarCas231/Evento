import React, { useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { SesionesProvider } from './context/SesionesContext';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import Home from './views/sesion/Home';
import Eventos from './views/sesion/Eventos';
import DatosSesion from './views/sesion/DatosSesion';
import SesionForm from './views/sesion/SesionForm';
import EscanearQR from './views/sesion/EscanearQR';
import ResumenEvento from './views/sesion/ResumenEvento';
import NotFound from './views/nofoud404';

function App() {
  return (
    <AuthProvider>
      <SesionesProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </SesionesProvider>
    </AuthProvider>
  );
}

function AppContent() {
  const { pathname } = useLocation();
  const showNavbar = pathname !== '/login' && pathname !== '/register';

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    if (showNavbar) return;

    root.classList.remove('dark');
    body.classList.remove('dark');
  }, [showNavbar]);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas Protegidas */}
        <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
        <Route path="/datos-sesion" element={<ProtectedRoute><DatosSesion /></ProtectedRoute>} />
        <Route path="/sesiones/nueva" element={<ProtectedRoute><SesionForm /></ProtectedRoute>} />
        <Route path="/sesiones/editar/:id" element={<ProtectedRoute><SesionForm /></ProtectedRoute>} />
        <Route path="/sesiones/escanear/:id" element={<ProtectedRoute><EscanearQR /></ProtectedRoute>} />
        <Route path="/sesiones/resumen/:id" element={<ProtectedRoute><ResumenEvento /></ProtectedRoute>} />
        <Route path="/404" element={<NotFound />} />

        {/* Redirección automática */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/404" />} />
      </Routes>
    </>
  );
}

export default App;
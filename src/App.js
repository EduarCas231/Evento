import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import Home from './views/sesion/Home';
import DatosSesion from './views/sesion/DatosSesion';
import Eventos from './views/sesion/Eventos';
import SesionForm from './views/sesion/SesionForm';
import Navbar from './components/Navbar'; // e. Importamos la Navbar nueva

// Componente Guardián modificado para inyectar la Navbar de forma automática
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}>Cargando sesión...</div>;
  if (!user) return <Navigate to="/login" />;

  // Si está autenticado, inyecta la Navbar en la parte superior del contenido protegido
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Ruta Pública */}
          <Route path="/login" element={<Login />} />
          
          {/* Rutas Protegidas */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
          <Route path="/sesiones" element={<ProtectedRoute><DatosSesion /></ProtectedRoute>} />
          <Route path="/sesiones/nueva" element={<ProtectedRoute><SesionForm /></ProtectedRoute>} />
          <Route path="/sesiones/editar/:id" element={<ProtectedRoute><SesionForm /></ProtectedRoute>} />
          <Route path="/register" element={<Register />} />

          {/* Redirección automática */}
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
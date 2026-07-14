import { AuthProvider } from './context/AuthContext';
import { SesionesProvider } from './context/SesionesContext';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Login from './views/auth/Login';
import Register from './views/auth/Register';
import Home from './views/sesion/Home';
import Eventos from './views/sesion/Eventos';
import SesionList from './views/sesion/SesionList';
import DatosSesion from './views/sesion/DatosSesion';
import SesionForm from './views/sesion/SesionForm';

function App() {
  return (
    <AuthProvider>
      <SesionesProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
          {/* Rutas Públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rutas Protegidas */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/eventos" element={<ProtectedRoute><Eventos /></ProtectedRoute>} />
          <Route path="/sesiones" element={<ProtectedRoute><SesionList /></ProtectedRoute>} />
          <Route path="/datos-sesion" element={<ProtectedRoute><DatosSesion /></ProtectedRoute>} />
          <Route path="/sesiones/nueva" element={<ProtectedRoute><SesionForm /></ProtectedRoute>} />
          <Route path="/sesiones/editar/:id" element={<ProtectedRoute><SesionForm /></ProtectedRoute>} />

          {/* Redirección automática */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
      </SesionesProvider>
    </AuthProvider>
  );
}

export default App;
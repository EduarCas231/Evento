import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const linkStyle = (path) => ({
    padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', border: 'none',
    backgroundColor: pathname === path ? '#0056b3' : 'transparent',
    color: 'white',
    fontWeight: pathname === path ? 'bold' : 'normal',
    fontSize: '14px',
  });

  return (
    <nav style={{ backgroundColor: '#007bff', padding: '12px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button style={linkStyle('/home')} onClick={() => navigate('/home')}>Inicio</button>
        <button style={linkStyle('/eventos')} onClick={() => navigate('/eventos')}>Eventos</button>
        {user?.role === 'admin' && (
          <button style={linkStyle('/sesiones')} onClick={() => navigate('/sesiones')}>Datos de Sesiones</button>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        
        <button
          onClick={logout}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}
        >
          Cerrar Sesión
        </button>
      </div>
    </nav>
  );
}

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = Boolean(user);

  const isActive = (path) => pathname === path;
  const linkClass = (path) => `navLink${isActive(path) ? ' navLinkActive' : ''}`;

  return (
    <nav className="navbar">
      <div className="navbarContainer">
        {/* Logo y marca */}
        <div className="brand" onClick={() => navigate(isAuthenticated ? '/home' : '/login')}>
          <div className="logoContainer">
            <svg className="logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <span className="brandText">Control Congresos</span>
        </div>

        {/* Botón de menú móvil */}
        <button
          className="mobileMenuButton"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="menuIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isMobileMenuOpen ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </>
            )}
          </svg>
        </button>

        {/* Menú de navegación */}
        <div className={`navLinks${isMobileMenuOpen ? ' navLinksOpen' : ''}`}>
          {isAuthenticated ? (
            <>
              <button
                className={linkClass('/home')}
                onClick={() => {
                  navigate('/home');
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="linkIcon">🏠</span>
                Inicio
                {isActive('/home') && <span className="activeDot"></span>}
              </button>

              <button
                className={linkClass('/eventos')}
                onClick={() => {
                  navigate('/eventos');
                  setIsMobileMenuOpen(false);
                }}
              >
                <span className="linkIcon">📅</span>
                Eventos
                {isActive('/eventos') && <span className="activeDot"></span>}
              </button>

              {user?.role === 'admin' && (
                <button
                  className={linkClass('/datos-sesion')}
                  onClick={() => {
                    navigate('/datos-sesion');
                    setIsMobileMenuOpen(false);
                  }}
                >
                  <span className="linkIcon">📈</span>
                  Mis Sesiones
                  {isActive('/datos-sesion') && <span className="activeDot"></span>}
                </button>
              )}
            </>
          ) : null}
        </div>

        {/* Sección de usuario */}
        {isAuthenticated && (
          <div className="userSection">
            <div className="userInfo">
              <div className="userAvatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="userDetails">
                <span className="userName">{user?.username || 'Usuario'}</span>
                <span className="userRole">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
            </div>

            <button className="logoutButton" onClick={logout}>
              <svg className="logoutIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
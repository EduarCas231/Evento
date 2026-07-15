import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiHome, FiCalendar, FiBarChart2, FiLogOut, 
  FiUser, FiChevronDown, FiMenu, FiX,
  FiLayers, FiUserCheck
} from 'react-icons/fi';
import { MdDashboard, MdEvent, MdAnalytics } from 'react-icons/md';
import ThemeToggle from './ThemeToggle';
import '../styles/navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const isAuthenticated = Boolean(user);

  // Detectar scroll para efecto de sombra
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cerrar menús al cambiar de ruta
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const isActive = (path) => pathname === path;
  const linkClass = (path) => `navLink${isActive(path) ? ' navLinkActive' : ''}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/home', label: 'Inicio', icon: FiHome, activeIcon: MdDashboard },
    { path: '/eventos', label: 'Eventos', icon: FiCalendar, activeIcon: MdEvent },
  ];

  // Items solo para admin
  if (user?.role === 'admin') {
    navItems.push({ 
      path: '/datos-sesion', 
      label: 'Mis Sesiones', 
      icon: FiBarChart2, 
      activeIcon: MdAnalytics 
    });
  }

  return (
    <nav className={`navbar ${scrolled ? 'navbarScrolled' : ''}`}>
      <div className="navbarContainer">
        {/* Logo y marca */}
        <div 
          className="brand" 
          onClick={() => navigate(isAuthenticated ? '/home' : '/login')}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && navigate(isAuthenticated ? '/home' : '/login')}
        >
          <div className="logoContainer">
            <svg className="logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
              <path d="M12 7v10" />
              <circle cx="12" cy="12" r="2" fill="currentColor" />
            </svg>
          </div>
          <div className="brandTextContainer">
            <span className="brandText">Control</span>
            <span className="brandTextHighlight">Congresos</span>
          </div>
        </div>

        {/* Botón de menú móvil */}
        <button
          className={`mobileMenuButton ${isMobileMenuOpen ? 'mobileMenuButtonActive' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
        >
          {isMobileMenuOpen ? (
            <FiX className="menuIcon" />
          ) : (
            <FiMenu className="menuIcon" />
          )}
        </button>

        {/* Menú de navegación */}
        <div className={`navLinks${isMobileMenuOpen ? ' navLinksOpen' : ''}`}>
          {isAuthenticated && (
            <div className="navLinksList">
              {navItems.map((item) => {
                const Icon = isActive(item.path) ? item.activeIcon : item.icon;
                return (
                  <button
                    key={item.path}
                    className={linkClass(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="linkIcon" />
                    <span className="linkLabel">{item.label}</span>
                    {isActive(item.path) && (
                      <span className="activeIndicator">
                        <span className="activeDot"></span>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="themeToggleWrapper">
          <ThemeToggle />
        </div>

        {/* Sección de usuario */}
        {isAuthenticated && (
          <div className="userSection">
            <div 
              className="userInfo"
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => e.key === 'Enter' && setIsUserMenuOpen(!isUserMenuOpen)}
            >
              <div className="userAvatar">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
                <span className="userStatus"></span>
              </div>
              <div className="userDetails">
                <span className="userName">{user?.username || 'Usuario'}</span>
                <span className="userRole">
                  {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              <FiChevronDown className={`userChevron ${isUserMenuOpen ? 'userChevronOpen' : ''}`} />
            </div>

            {/* Menú desplegable de usuario */}
            {isUserMenuOpen && (
              <div className="userDropdown">
                <div className="userDropdownHeader">
                  <div className="userDropdownAvatar">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="userDropdownInfo">
                    <span className="userDropdownName">{user?.username}</span>
                    <span className="userDropdownRole">
                      {user?.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </span>
                  </div>
                </div>
                <div className="userDropdownDivider"></div>
                <button 
                  className="userDropdownItem logoutItem"
                  onClick={handleLogout}
                >
                  <FiLogOut className="dropdownIcon" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Overlay para móvil */}
      {isMobileMenuOpen && (
        <div 
          className="mobileOverlay"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </nav>
  );
}
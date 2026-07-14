import React, { useState } from 'react';
import { api } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import '../../styles/Register.css';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const role = 'speaker';
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!username || !email || !password || !confirmPassword) {
      setError('Todos los campos son obligatorios.');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      setLoading(false);
      return;
    }

    try {
      const data = await api.auth.register(username, email, password, role);
      setSuccess(data.message || '¡Usuario registrado con éxito!');
      
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="registerContainer">
      <div className="registerCard">
        <div className="registerHeader">
          <div className="registerLogoContainer">
            <svg className="registerLogo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <path d="M20 8v6" />
              <path d="M23 11h-6" />
            </svg>
          </div>
          <h1 className="registerTitle">Control de Congresos</h1>
          <p className="registerSubtitle">Crea tu cuenta para comenzar</p>
        </div>

        {error && (
          <div className="registerError">
            <svg className="registerErrorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="registerErrorText">{error}</span>
          </div>
        )}

        {success && (
          <div className="registerSuccess">
            <svg className="registerSuccessIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="registerSuccessText">{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="registerForm">
          <div className="registerInputGroup">
            <label className="registerLabel">Nombre de Usuario</label>
            <div className="registerInputWrapper">
              <svg className="registerInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="registerInput"
                placeholder="ej. carlos_admin"
                disabled={loading}
              />
            </div>
          </div>

          <div className="registerInputGroup">
            <label className="registerLabel">Correo Electrónico</label>
            <div className="registerInputWrapper">
              <svg className="registerInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="registerInput"
                placeholder="usuario@evento.com"
                disabled={loading}
              />
            </div>
          </div>

          <div className="registerInputGroup">
            <label className="registerLabel">Contraseña</label>
            <div className="registerInputWrapper">
              <svg className="registerInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="registerInput"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <div className="registerInputGroup">
            <label className="registerLabel">Confirmar Contraseña</label>
            <div className="registerInputWrapper">
              <svg className="registerInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
                <path d="M12 16v.01" strokeWidth="2" />
              </svg>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="registerInput"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`registerButton ${loading ? 'registerButtonDisabled' : ''}`}
          >
            {loading ? (
              <span className="registerLoadingSpinner">
                <span className="registerSpinner"></span>
                Registrando...
              </span>
            ) : (
              'Crear Cuenta'
            )}
          </button>

          <div className="registerFooter">
            <span className="registerFooterText">¿Ya tienes cuenta?</span>
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="registerLinkButton"
              disabled={loading}
            >
              Inicia Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
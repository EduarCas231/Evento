import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import '../../styles/Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loadingForm, setLoadingForm] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoadingForm(true);

    if (!email || !password) {
      setError('Por favor, ingresa todos los campos.');
      setLoadingForm(false);
      return;
    }

    try {
      const data = await api.auth.login(email, password);
      login(data.user, data.token);
      navigate('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingForm(false);
    }
  };

  return (
    <div className="loginContainer">
      <div className="loginCard">
        <div className="loginHeader">
          <div className="loginLogoContainer">
            <svg className="loginLogo" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <h1 className="loginTitle">Control de Congresos</h1>
          <p className="loginSubtitle">Inicia sesión para continuar</p>
        </div>

        {error && (
          <div className="loginError">
            <svg className="loginErrorIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="loginErrorText">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="loginForm">
          <div className="loginInputGroup">
            <label className="loginLabel">Correo Electrónico</label>
            <div className="loginInputWrapper">
              <svg className="loginInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="loginInput"
                placeholder="admin@evento.com"
                disabled={loadingForm}
              />
            </div>
          </div>

          <div className="loginInputGroup">
            <label className="loginLabel">Contraseña</label>
            <div className="loginInputWrapper">
              <svg className="loginInputIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="loginInput"
                placeholder="••••••••"
                disabled={loadingForm}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loadingForm}
            className={`loginButton ${loadingForm ? 'loginButtonDisabled' : ''}`}
          >
            {loadingForm ? (
              <span className="loginLoadingSpinner">
                <span className="loginSpinner"></span>
                Validando...
              </span>
            ) : (
              'Ingresar al Panel'
            )}
          </button>

          <div className="loginFooter">
            <span className="loginFooterText">¿No tienes cuenta?</span>
            <button
              type="button"
              onClick={() => navigate('/register')}
              className="loginLinkButton"
              disabled={loadingForm}
            >
              Crear una cuenta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
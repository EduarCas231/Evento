import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { api } from '../services/api';
import { suscribirPush } from '../hooks/usePush';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const pushSubscribed = useRef(false);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  const verificarSesion = useCallback(async () => {
    if (!localStorage.getItem('token')) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.auth.verify();
      setUser(data.user);
    } catch (error) {
      logout();
    } finally {
      setLoading(false);
    }
  }, [logout]);

  // Verificar al cargar la app
  useEffect(() => {
    verificarSesion();
  }, [verificarSesion]);

  // Reverificar cada 10 minutos para detectar expiración del JWT
  useEffect(() => {
    if (!token) return;
    const intervalo = setInterval(verificarSesion, 10 * 60 * 1000);
    return () => clearInterval(intervalo);
  }, [token, verificarSesion]);

  const login = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    setToken(userToken);
    setUser(userData);
  };

  useEffect(() => {
    if (!token || !user || pushSubscribed.current) return;

    suscribirPush(token)
      .catch((e) => console.error('Error de suscripción push en AuthContext:', e))
      .finally(() => {
        pushSubscribed.current = true;
      });
  }, [token, user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
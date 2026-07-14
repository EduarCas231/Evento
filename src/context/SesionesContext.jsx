import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://comapi.duckdns.org/api';

const SesionesContext = createContext(null);

export function SesionesProvider({ children }) {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conectado, setConectado] = useState(false);
  const esRef = useRef(null);
  const { user, token } = useAuth();

  const cargarSesiones = useCallback(() => {
    setLoading(true);
    api.sesiones.listar()
      .then((data) => {
        setSesiones(data);
        data.forEach((s) => {
          api.sesiones.asistentes(s.id)
            .then((d) => {
              setSesiones((prev) =>
                prev.map((x) =>
                  x.id === s.id
                    ? { ...x, ocupados: d.ocupados ?? 0, asistentes: d.asistentes ?? [] }
                    : x
                )
              );
            })
            .catch(() => {});
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (user) cargarSesiones();
  }, [user, cargarSesiones]);

  useEffect(() => {
    if (!token) return;

    const url = `${BASE_URL}/sse/stream?token=${token}`;
    const es = new EventSource(url);
    esRef.current = es;

    let esPrimeraConexion = true;
    es.onopen = () => {
      setConectado(true);
      if (!esPrimeraConexion) {
        cargarSesiones();
      }
      esPrimeraConexion = false;
    };

    es.addEventListener('sesion_actualizada', (e) => {
      const datos = JSON.parse(e.data);
      setSesiones(prev => {
        const existe = prev.some(s => s.id === datos.id);
        return existe
          ? prev.map(s => s.id === datos.id ? { ...s, ...datos } : s)
          : [...prev, datos];
      });
    });

    es.addEventListener('sesion_eliminada', (e) => {
      const { id } = JSON.parse(e.data);
      setSesiones(prev => prev.filter(s => s.id !== id));
    });

    es.addEventListener('asistentes_actualizado', (e) => {
      const { id_sesion, ocupados, capacidad } = JSON.parse(e.data);
      setSesiones(prev =>
        prev.map(s => s.id === id_sesion ? { ...s, ocupados, capacidad } : s)
      );

      api.sesiones.asistentes(id_sesion)
        .then((d) => {
          setSesiones(prev =>
            prev.map(s => s.id === id_sesion ? { ...s, asistentes: d.asistentes ?? [] } : s)
          );
        })
        .catch(() => {});
    });

    es.onerror = (event) => {
      setConectado(false);
      console.error('SSE connection error', event);
    };

    return () => {
      es.close();
      setConectado(false);
    };
  }, [token, cargarSesiones]);

  const value = {
    sesiones,
    setSesiones,
    loading,
    error,
    conectado,
    recargar: cargarSesiones,
  };

  return (
    <SesionesContext.Provider value={value}>
      {children}
    </SesionesContext.Provider>
  );
}

export function useSesiones() {
  const ctx = useContext(SesionesContext);
  if (!ctx) {
    throw new Error('useSesiones debe usarse dentro de un SesionesProvider');
  }
  return ctx;
}
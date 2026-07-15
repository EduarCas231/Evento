import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';

const BASE_URL = process.env.REACT_APP_API_URL || 'https://comapi.duckdns.org/api';

const SesionesContext = createContext(null);

export function SesionesProvider({ children }) {
  const [sesiones, setSesiones] = useState([]);
  const [misUnionesIds, setMisUnionesIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [conectado, setConectado] = useState(false);
  const esRef = useRef(null);
  const { user, token } = useAuth();

  // 👇 antes esto hacía 1 petición por CADA sesión que existiera
  // (api.sesiones.asistentes(s.id) por cada una) solo para sacar "ocupados" y
  // saber si el usuario ya estaba unido — con muchos eventos esto se vuelve
  // muy lento. Ahora son solo 2 peticiones totales, sin importar cuántos
  // eventos haya: la lista (que ya trae "ocupados" incluido desde el backend)
  // y los IDs de a qué eventos está unido el usuario actual.
  const cargarSesiones = useCallback(() => {
    setLoading(true);
    Promise.all([
      api.sesiones.listar(),
      api.sesiones.misUniones().catch(() => ({ ids_sesiones: [] })),
    ])
      .then(([listaSesiones, uniones]) => {
        setSesiones(listaSesiones);
        setMisUnionesIds(new Set(uniones.ids_sesiones || []));
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

    // 👇 ya no hace falta un fetch de seguimiento: "ocupados" y "capacidad"
    // ya vienen directo en el propio evento SSE
    es.addEventListener('asistentes_actualizado', (e) => {
      const { id_sesion, ocupados, capacidad } = JSON.parse(e.data);
      setSesiones(prev =>
        prev.map(s => s.id === id_sesion ? { ...s, ocupados, capacidad } : s)
      );
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
    misUnionesIds,
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
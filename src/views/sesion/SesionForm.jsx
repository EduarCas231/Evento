import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';

const EMPTY = { titulo: '', sala: '', code: '', capacidad: '', detalles: '', fecha: '', hora_inicio: '', hora_fin: '', zona: '', tipo: 'publico', password: '' };

export default function SesionForm() {
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { id } = useParams();
  const navigate = useNavigate();
  const esEdicion = Boolean(id);

  useEffect(() => {
    if (!esEdicion) return;
    api.sesiones.obtener(id)
      .then((data) => setForm({
        titulo: data.titulo || '',
        sala: data.sala || '',
        code: data.code || '',
        capacidad: data.capacidad || '',
        detalles: data.detalles || '',
        fecha: data.fecha || '',
        hora_inicio: data.hora_inicio || '',
        hora_fin: data.hora_fin || '',
        zona: data.zona || '',
        tipo: data.tipo || 'publico',
        password: data.password || '',
      }))
      .catch((err) => setError(err.message));
  }, [id, esEdicion]);

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (esEdicion) {
        await api.sesiones.editar(id, form);
      } else {
        await api.sesiones.crear(form);
      }
      navigate('/sesiones');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const campo = (label, name, type = 'text', placeholder = '') => (
    <div style={{ marginBottom: '15px' }}>
      <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>{label}</label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
      />
    </div>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', fontFamily: 'Arial, sans-serif' }}>
      <h2 style={{ marginBottom: '24px' }}>{esEdicion ? 'Editar Sesión' : 'Nueva Sesión'}</h2>

      {error && <div style={{ padding: '12px', backgroundColor: '#ffe6e6', color: 'red', borderRadius: '4px', marginBottom: '16px' }}>{error}</div>}

      <form onSubmit={handleSubmit}>
        {campo('Título *', 'titulo', 'text', 'Ej. Conferencia inaugural')}
        {campo('Código', 'code', 'text', 'Ej. CONF-01')}
        {campo('Sala', 'sala', 'text', 'Ej. Auditorio A')}
        {campo('Zona Wearable', 'zona', 'text', 'Ej. Zona Norte')}
        {campo('Capacidad', 'capacidad', 'number', 'Ej. 200')}
        {campo('Fecha', 'fecha', 'date')}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {campo('Hora inicio', 'hora_inicio', 'time')}
          {campo('Hora fin', 'hora_fin', 'time')}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Visibilidad</label>
          <select
            name="tipo"
            value={form.tipo}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
          >
            <option value="publico">🌐 Público</option>
            <option value="privado">🔒 Privado</option>
          </select>
        </div>

        {form.tipo === 'privado' && (
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Contraseña del evento</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Contraseña para acceder al evento privado"
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box' }}
            />
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Detalles</label>
          <textarea
            name="detalles"
            value={form.detalles}
            onChange={handleChange}
            rows={3}
            placeholder="Descripción de la sesión..."
            style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc', boxSizing: 'border-box', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{ flex: 1, padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loading ? 'Guardando...' : esEdicion ? 'Actualizar' : 'Crear Sesión'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/sesiones')}
            style={{ flex: 1, padding: '12px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

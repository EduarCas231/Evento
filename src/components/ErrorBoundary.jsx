import React from 'react';

// Los Error Boundaries en React SOLO pueden ser componentes de clase — no hay
// equivalente con hooks. Este es el que evita que un error sin capturar en
// CUALQUIER parte del árbol (por ejemplo, dentro del escáner QR) tumbe TODA
// la app dejando la pantalla en blanco. En vez de eso, muestra el mensaje de
// error real directo en pantalla — así ya no hace falta consola remota ni
// eruda para saber qué pasó.
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary atrapó:', error, info);
  }

  handleReiniciar = () => {
    this.setState({ error: null, info: null });
  };

  render() {
    if (this.state.error) {
      return (
        <div style={{
          maxWidth: 600,
          margin: '40px auto',
          padding: 24,
          fontFamily: 'sans-serif',
          background: '#fef2f2',
          border: '1px solid #fca5a5',
          borderRadius: 12,
          color: '#991b1b',
        }}>
          <h2 style={{ marginTop: 0 }}>Ocurrió un error inesperado</h2>
          <p style={{ fontSize: 14 }}>
            Esto es lo que se rompió — copia este texto completo para reportarlo:
          </p>
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'white',
            padding: 12,
            borderRadius: 8,
            fontSize: 12,
            maxHeight: 300,
            overflow: 'auto',
          }}>
            {String(this.state.error?.stack || this.state.error?.message || this.state.error)}
            {this.state.info?.componentStack && '\n\nComponent stack:' + this.state.info.componentStack}
          </pre>
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              onClick={this.handleReiniciar}
              style={{
                padding: '8px 16px',
                background: '#991b1b',
                color: 'white',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Reintentar
            </button>
            <button
              onClick={() => window.location.href = '/datos-sesion'}
              style={{
                padding: '8px 16px',
                background: '#f3f4f6',
                color: '#374151',
                border: 'none',
                borderRadius: 8,
                cursor: 'pointer',
              }}
            >
              Volver a Mis Eventos
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
// pages/NotFound.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import { MdErrorOutline } from 'react-icons/md';
import '../styles/404.css';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/home');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="notfoundContainer">
      <div className="notfoundBackground">
        <div className="notfoundGlow notfoundGlow1" />
        <div className="notfoundGlow notfoundGlow2" />
        <div className="notfoundGlow notfoundGlow3" />
      </div>

      <div className="notfoundCard">
        {/* Código de error flotante */}
        <div className="notfoundCodeWrapper">
          <div className="notfoundCode">404</div>
          <div className="notfoundCodeOverlay">
            <MdErrorOutline className="notfoundCodeIcon" />
          </div>
        </div>

        {/* Contenido principal */}
        <div className="notfoundContent">
          <div className="notfoundBadge">
            <FiAlertTriangle className="notfoundBadgeIcon" />
            <span>Página no encontrada</span>
          </div>

          <h1 className="notfoundTitle">¡Ups! Parece que te has perdido</h1>
          
          <p className="notfoundDescription">
            La página que estás buscando no existe, fue eliminada o cambió de dirección.
            No te preocupes, podemos ayudarte a encontrar el camino de vuelta.
          </p>

          <div className="notfoundActions">
            <button
              onClick={handleGoHome}
              className="notfoundButton notfoundButtonPrimary"
            >
              <FiHome className="notfoundButtonIcon" />
              Ir al Inicio
            </button>
            
            <button
              onClick={handleGoBack}
              className="notfoundButton notfoundButtonSecondary"
            >
              <FiArrowLeft className="notfoundButtonIcon" />
              Volver Atrás
            </button>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="notfoundDecorations">
          <div className="notfoundDot notfoundDot1" />
          <div className="notfoundDot notfoundDot2" />
          <div className="notfoundDot notfoundDot3" />
          <div className="notfoundDot notfoundDot4" />
        </div>
      </div>
    </div>
  );
}
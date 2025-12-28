import { useEffect, useRef } from 'react';

/**
 * Hook para monitorear inactividad y cerrar sesión automáticamente
 * @param {number} timeoutMinutos - Minutos de inactividad antes de logout (default: 30)
 * @param {function} onLogout - Callback cuando se cumple el timeout
 * @param {function} onWarning - Callback 2 minutos antes de logout
 */
export const useSessionTimeout = (timeoutMinutos = 60, onLogout, onWarning) => {
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const timeoutMillis = timeoutMinutos * 60 * 1000;
  const warningMillis = (timeoutMinutos - 2) * 60 * 1000; // Advertencia 2 min antes

  const resetTimeout = () => {
    // Limpiar timeouts anteriores
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    // Mostrar advertencia 2 minutos antes de logout
    if (onWarning) {
      warningTimeoutRef.current = setTimeout(() => {
        onWarning();
      }, warningMillis);
    }

    // Logout después del tiempo especificado
    timeoutRef.current = setTimeout(() => {
      if (onLogout) {
        onLogout();
      }
    }, timeoutMillis);
  };

  useEffect(() => {
    // Eventos que resetean el timeout (usuario activo)
    const eventos = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];

    const manejarActividad = () => {
      resetTimeout();
    };

    // Agregar listeners
    eventos.forEach((evento) => {
      document.addEventListener(evento, manejarActividad);
    });

    // Inicializar timeout
    resetTimeout();

    // Cleanup
    return () => {
      eventos.forEach((evento) => {
        document.removeEventListener(evento, manejarActividad);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [timeoutMinutos, onLogout, onWarning]);

  return {
    resetTimeout,
  };
};

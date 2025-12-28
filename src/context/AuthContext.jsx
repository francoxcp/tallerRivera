import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { obtenerSesion, cerrarSesion } from '../services/authService';
import { useSessionTimeout } from '../hooks/useSessionTimeout';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [mostrarAdvertencia, setMostrarAdvertencia] = useState(false);
  const [minutosRestantes, setMinutosRestantes] = useState(2);

  // Configurar timeout de sesión (30 minutos)
  const TIMEOUT_MINUTOS = 30;
  const ADVERTENCIA_MINUTOS = 2;

  const handleLogoutAutomatico = async () => {
    console.warn('⏰ Sesión expirada por inactividad');
    await logout();
  };

  const handleAdvertencia = () => {
    console.warn(`⚠️ Sesión expirará en ${ADVERTENCIA_MINUTOS} minutos por inactividad`);
    setMostrarAdvertencia(true);
    
    // Actualizar contador cada segundo
    const interval = setInterval(() => {
      setMinutosRestantes((prev) => {
        if (prev <= 0) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  };

  // Hook para monitorear inactividad
  useSessionTimeout(TIMEOUT_MINUTOS, handleLogoutAutomatico, handleAdvertencia);

  useEffect(() => {
    // Verificar sesión actual
    verificarSesion();

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCargando(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const verificarSesion = async () => {
    const { session } = await obtenerSesion();
    setUser(session?.user ?? null);
    setCargando(false);
  };

  const logout = async () => {
    setMostrarAdvertencia(false);
    setMinutosRestantes(2);
    await cerrarSesion();
    setUser(null);
  };

  const extenderSesion = () => {
    console.log('✅ Sesión extendida');
    setMostrarAdvertencia(false);
    setMinutosRestantes(2);
    // El hook useSessionTimeout automáticamente resetea el timer con cualquier actividad
  };

  const value = {
    user,
    cargando,
    logout,
    mostrarAdvertencia,
    minutosRestantes,
    extenderSesion,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

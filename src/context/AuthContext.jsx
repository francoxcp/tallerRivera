import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { obtenerSesion, cerrarSesion } from '../services/authService';

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
    await cerrarSesion();
    setUser(null);
  };

  const value = {
    user,
    cargando,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

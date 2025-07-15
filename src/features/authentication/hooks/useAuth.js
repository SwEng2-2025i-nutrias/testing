import { useState } from 'react';
import { useAuthStore } from '../store/AuthStore';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { token, user, login: storeLogin, logout: storeLogout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (credentials) => {
    try {
      setIsLoading(true);
      setError(null);
      const success = await storeLogin(credentials);
       
      if (success) {
        // Determinar la ruta según el rol del usuario
        // console.log(user.role);
        const route = user.role === 'agricultor' ? '/farmer/products' : '/home';
        navigate(route);
        return { success: true };
      }
      
      setError('Credenciales inválidas');
      return { success: false, error: 'Credenciales inválidas' };
    } catch (error) {
      setError(error.message || 'Error al iniciar sesión');
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isAuthenticated: !!token,
    user,
    login: handleLogin,
    logout: storeLogout,
    error,
    isLoading,
    clearError: () => setError(null)
  };
};

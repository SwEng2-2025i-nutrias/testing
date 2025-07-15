import axios from 'axios';
import { useAuthStore } from '../features/authentication/store/AuthStore';

export const setupAxiosInterceptors = () => {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Si el token expiró o es inválido, cerrar sesión
        const logout = useAuthStore.getState().logout;
        logout();
        // Redirigir a login
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
};

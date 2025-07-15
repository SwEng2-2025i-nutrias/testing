import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { loginUser } from '../services/AuthService';
export const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,

      login: async (credentials) => {
        const { email, password } = credentials;
        
        // if (!email || !password) {
        //   throw new Error('Email y contraseña son requeridos');
        // }

        const response = await loginUser({ email, password });
        
        if (!response.success) {
          throw new Error(response.message);
        }

        const {res } = response;

        set({ 
          token:res.token, // Asegúrate de que el token esté en la respuesta
          user: res.user
        });
        console.log('Usuario autenticado:', res.user);
        // Mostrar el token en consola para depuración
        console.log('Token JWT:', res.token);
        return true;
      },

      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user 
      })
    }
  )
);
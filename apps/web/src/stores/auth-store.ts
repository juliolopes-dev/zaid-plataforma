import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Usuario {
  id: string;
  email: string;
  nome: string;
  cargo: string;
  avatarUrl?: string;
}

interface AuthState {
  usuario: Usuario | null;
  token: string | null;
  setUsuario: (usuario: Usuario | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      usuario: null,
      token: null,
      setUsuario: (usuario) => set({ usuario }),
      setToken: (token) => {
        if (token) {
          localStorage.setItem('zaid-token', token);
        } else {
          localStorage.removeItem('zaid-token');
        }
        set({ token });
      },
      logout: () => {
        localStorage.removeItem('zaid-token');
        set({ usuario: null, token: null });
      },
    }),
    {
      name: 'zaid-auth',
      partialize: (state) => ({ usuario: state.usuario, token: state.token }),
    }
  )
);

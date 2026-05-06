import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserInfo } from '../api/types';

interface AuthState {
  user: UserInfo | null;
  setUser: (user: UserInfo | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => set({ user: null }),
    }),
    { name: 'savage-auth' },
  ),
);

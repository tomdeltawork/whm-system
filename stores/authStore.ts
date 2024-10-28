// store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  accessToken: string | null;
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  loginType: string | null;
  setAccessToken: (token: string) => void;
  getAccessToken: () => string | null;
  setUserId: (id: string) => void;
  getUserId: () => string | null;
  setUserName: (name: string) => void;
  getUserName: () => string | null;
  setUserEmail: (email: string) => void;
  getUserEmail: () => string | null;
  setLoginType: (loginType: string) => void;
  getLoginType: () => string | null;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      userId: null,
      userName: null,
      userEmail: null,
      loginType: null,
      //
      setAccessToken: (token) => set({ accessToken: token }),
      getAccessToken: () => get().accessToken,
      //
      setUserId: (id) => set({ userId: id }),
      getUserId: () => get().userId,
      //
      setUserName: (name) => set({ userName: name }),
      getUserName: () => get().userName,
      //
      setUserEmail: (email) => set({ userEmail: email }),
      getUserEmail: () => get().userEmail,
      //
      setLoginType: (loginType) => set({ loginType: loginType }),
      getLoginType: () => get().loginType,
      //
      clearAuth: () => set({ accessToken: null, userId: null, userName: null, userEmail: null, loginType: null}),
    }),
    {
      name: 'auth-storage', // 存儲鍵名
    }
  )
);

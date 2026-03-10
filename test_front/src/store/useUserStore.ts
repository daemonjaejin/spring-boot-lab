// src/store/useUserStore.ts
import { create } from 'zustand';

interface UserState {
  user: any | null;
  setUser: (user: any | null) => void;
  clearUser: () => void; // 로그아웃용 함수 추가
}

export const useUserStore = create<UserState>((set) => ({
  user: null, // 초기값
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }), // null로 초기화
}));
'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const UserContext = createContext<any>(null);

export function UserProvider({ children, initialUser }: { children: React.ReactNode, initialUser: any }) {
  const [user, setUser] = useState(initialUser);

  // 로그인 성공 시 호출할 함수
  const updateUser = (userData: any) => setUser(userData);

  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
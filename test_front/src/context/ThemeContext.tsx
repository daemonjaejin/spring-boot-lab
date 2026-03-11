'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

// 1. 설계도(Interface) 정의
interface ThemeContextType {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

// 2. 기지국 생성 (자바의 Interface 선언과 비슷함)
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. 공급자(Provider) 컴포넌트 - 실제 데이터를 담고 있는 통신소
export function ThemeProvider({ children }: { children: ReactNode }) {
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  // 🚩 [추가] 테마가 바뀔 때마다 HTML 태그(최상단)에 'dark' 클래스를 직접 주입/제거
  useEffect(() => {
    const root = window.document.documentElement; // <html> 태그를 가져옴
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  // 🚩 로그 3: 테마 변경 시점 확인
  console.log("=== [Context] Current Theme Mode ===", isDarkMode);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {/* 이 아래에 들어오는 모든 자식(children)은 이 데이터를 쓸 수 있음 */}
      <div className={isDarkMode ? 'dark' : ''}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

// 4. 전용 Hook - 자식들이 기지국에 접속할 때 쓰는 도구
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('ThemeProvider 안에서만 사용하세요!');
  return context;
};
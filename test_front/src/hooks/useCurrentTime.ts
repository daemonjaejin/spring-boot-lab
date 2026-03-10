// src/hooks/useCurrentTime.ts
import { useState, useEffect, useMemo } from 'react';

export const useCurrentTime = () => {
  // 1. 상태 저장
  const [now, setNow] = useState(new Date());

  // 2. 타이머 설정 (1초마다 갱신)
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer); // 정리(Cleanup)
  }, []);

  // 3. 복잡한 계산 (예: 오전/오후 판별) - useMemo 활용
  const amPm = useMemo(() => {
    return now.getHours() < 12 ? '오전' : '오후';
  }, [now]);

  // 4. 필요한 데이터만 밖으로 던져줍니다.
  return { 
    now, 
    amPm, 
    timeString: now.toLocaleTimeString('ko-KR') 
  };
};
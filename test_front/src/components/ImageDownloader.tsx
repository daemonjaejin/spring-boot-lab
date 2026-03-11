// src/components/ImageDownloader.tsx
'use client';

import { useEffect, useRef } from 'react';

export default function ImageDownloader({ onComplete }: { onComplete: () => void }) {
  // 자바의 AtomicBoolean처럼 중복 방지를 위한 플래그
  const hasDownloaded = useRef(false);
  useEffect(() => {

    if (hasDownloaded.current) return;

    const link = document.createElement('a');
    link.href = '/장원영.png'; // 반드시 public/장원영.png 파일이 있어야 함
    link.download = '장원영.png';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log("✅ 장원영 사진 다운로드 완료");

    // 2. 실행 완료 플래그 세우기
    hasDownloaded.current = true;
    
    // 3. 부모 컴포넌트에게 "나 다 했어!"라고 알려서 컴포넌트를 즉시 제거하게 함
    // (이게 호출되면 부모의 isDownloadStart가 false가 되어 이 컴포넌트가 Unmount 됩니다)
    onComplete();

  }, [onComplete]);

  return null;
}
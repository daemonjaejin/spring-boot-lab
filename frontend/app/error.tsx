'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Error Boundary caught:', error);
  }, [error]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>출발점(Root)에서 오류가 발생했습니다.</h2>
      <p style={{ color: 'red' }}>{error.message || '알 수 없는 런타임 오류'}</p>
      {error.stack && (
        <pre style={{ textAlign: 'left', backgroundColor: '#f4f4f4', padding: '1rem', overflow: 'auto' }}>
          {error.stack}
        </pre>
      )}
      <button
        onClick={() => reset()}
        style={{ padding: '10px 20px', backgroundColor: '#0070f3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
      >
        다시 시도
      </button>
    </div>
  );
}

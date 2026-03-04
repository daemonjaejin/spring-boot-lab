'use client';

import { useState } from 'react';

export default function AopTestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const callAsyncTest = async () => {
    setLoading(true);
    setResult('Calling Async API... Check Backend Logs for [AOP] output.');
    try {
      // Intentionally calling the async test endpoint which we annotated
      const response = await fetch('http://localhost:8081/api/async/test');
      if (response.ok) {
        setResult('Async API Call Successful! Check backend console for execution time log.');
      } else {
        setResult('Async API Call Failed.');
      }
    } catch (error) {
      setResult('Error calling API.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>AOP Execution Time Logging Test</h1>
      <p>
        아래 버튼을 클릭하여 백엔드 API를 호출하세요.<br/>
        백엔드 콘솔 로그에 <code>[AOP] Method: ... | Execution Time: ...ms</code> 형식이 출력되는지 확인해야 합니다.
      </p>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={callAsyncTest} 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '호출 중...' : 'Async Test API 호출 (with @LogExecutionTime)'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
          <strong>Status:</strong> {result}
        </div>
      )}
    </div>
  );
}

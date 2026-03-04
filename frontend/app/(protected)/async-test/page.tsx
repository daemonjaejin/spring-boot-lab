'use client';

import { useState } from 'react';

interface AsyncResponse {
  threadName: string;
  timestamp: number;
  message: string;
}

interface RequestResult {
  id: number;
  data: AsyncResponse | null;
  error: string | null;
}

export default function AsyncTestPage() {
  const [results, setResults] = useState<RequestResult[]>([]);
  const [loading, setLoading] = useState(false);

  const startTest = async () => {
    setLoading(true);
    setResults([]);

    try {
      // User requested explicit Promise.all for parallel fetch
      console.log("Starting parallel requests...");
      
      const fetchTask = (id: number) => 
        fetch(`http://localhost:8081/api/async/test?req=${id}`)
          .then(res => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          })
          .then((data) => ({ id, data: data as AsyncResponse, error: null }))
          .catch((err) => ({ id, data: null, error: err.message || 'Error occurred' }));

      // Create 5 promises immediately
      const promises = [
        fetchTask(1),
        fetchTask(2),
        fetchTask(3),
        fetchTask(4),
        fetchTask(5)
      ];

      // Wait for all to complete
      const responses = await Promise.all(promises);
      
      console.log("All requests completed", responses);
      setResults(responses);
    } catch (error) {
      console.error("Overall error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>멀티스레드 테스트 (Parallel Fetch)</h1>
      <button 
        onClick={startTest} 
        disabled={loading}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? '테스트 진행 중...' : '멀티스레드 테스트 시작'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h2>결과 리스트</h2>
        {results.length === 0 && !loading && <p>버튼을 눌러 테스트를 시작하세요.</p>}
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {results.map((result) => (
            <li key={result.id} style={{ 
              border: '1px solid #ddd', 
              marginBottom: '10px', 
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: '#f9f9f9'
            }}>
              <strong>요청 {result.id}:</strong> 
              {result.error ? (
                <span style={{ color: 'red' }}> 에러: {result.error}</span>
              ) : (
                <span style={{ color: 'green' }}> 
                   [{result.data?.threadName}] (시간: {new Date(result.data!.timestamp).toLocaleTimeString()}) - {result.data?.message}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

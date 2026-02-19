import { useState } from 'react';
import axios from 'axios';

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

    const requests = Array.from({ length: 5 }, (_, i) => i + 1);

    try {
      const promises = requests.map(async (id) => {
        try {
          const response = await axios.get<AsyncResponse>('/api/async/test');
          return { id, data: response.data, error: null };
        } catch (err: any) {
          return { id, data: null, error: err.message || 'Error occurred' };
        }
      });

      const responses = await Promise.all(promises);
      setResults(responses);
    } catch (error) {
      console.error("Overall error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>멀티스레드 테스트</h1>
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
                   [{result.data?.threadName}] 에서 처리됨 (시간: {new Date(result.data!.timestamp).toLocaleTimeString()}) - {result.data?.message}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

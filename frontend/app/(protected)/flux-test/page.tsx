'use client';

import { useState, useEffect } from 'react';

export default function FluxTestPage() {
  const [messages, setMessages] = useState<string[]>([]);
  const [listening, setListening] = useState(false);

  const startStream = () => {
    if (listening) return;

    setListening(true);
    setMessages([]);

    // Direct connection to backend to bypass Next.js proxy for SSE if strictly needed,
    // but usually /api/flux/test via proxy should work if configured correctly.
    // However, to be safe and consistent with previous direct fetch fix, using direct URL.
    const eventSource = new EventSource('http://localhost:8081/api/flux/test');

    eventSource.onmessage = (event) => {
      const newData = event.data;
      setMessages((prev) => [...prev, newData]);
    };

    eventSource.onerror = (err) => {
      console.error('EventSource failed:', err);
      eventSource.close();
      setListening(false);
    };

    // Auto-close after some time or specific condition if needed,
    // but here we let the server close or handle error.
    // Since server sends 5 items and completes, EventSource might try to reconnect.
    // For this test, we can close it if we detect completion or just let it reconnect (loop).
    // Let's close it if we receive 5 items for better UX.
    
    // Actually, EventSource doesn't natively support "complete" event from server closing connection easily 
    // without specific event type.
    // We will leave it simple.
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Spring WebFlux Streaming Test</h1>
      <button 
        onClick={startStream} 
        disabled={listening}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: listening ? '#ccc' : '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: listening ? 'not-allowed' : 'pointer'
        }}
      >
        {listening ? '스트리밍 중...' : 'Flux 스트림 시작'}
      </button>

      <div style={{ marginTop: '20px' }}>
        <h2>수신 데이터 (실시간)</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {messages.map((msg, index) => (
            <li key={index} style={{ 
              border: '1px solid #ddd', 
              marginBottom: '10px', 
              padding: '10px',
              borderRadius: '4px',
              backgroundColor: '#e6f7ff',
              transition: 'all 0.3s ease'
            }}>
              {msg}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

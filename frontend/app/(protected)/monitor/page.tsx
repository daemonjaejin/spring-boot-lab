'use client';

import { useState, useEffect } from 'react';

interface HealthData {
  status: string;
  details?: any;
}

interface MetricData {
  name: string;
  measurements: { statistic: string; value: number }[];
  baseUnit: string;
}

interface BeanData {
  contexts: {
    [key: string]: {
      beans: {
        [key: string]: {
          aliases: string[];
          scope: string;
          type: string;
          resource: string;
          dependencies: string[];
        };
      };
    };
  };
}

export default function MonitorPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [memory, setMemory] = useState<MetricData | null>(null);
  const [beans, setBeans] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Health Content
      const healthRes = await fetch('http://localhost:8081/actuator/health');
      if (!healthRes.ok) throw new Error('Health check failed');
      const healthData = await healthRes.json();
      setHealth(healthData);

      // 2. Metrics (Memory)
      const memRes = await fetch('http://localhost:8081/actuator/metrics/jvm.memory.used');
      if (!memRes.ok) throw new Error('Metrics check failed');
      const memData = await memRes.json();
      setMemory(memData);

      // 3. Beans (Just getting names for brevity)
      const beanRes = await fetch('http://localhost:8081/actuator/beans');
      if (!beanRes.ok) throw new Error('Beans check failed');
      const beanData = await beanRes.json();
      
      // Extracting bean names from complex structure
      const contextNames = Object.keys(beanData.contexts);
      if (contextNames.length > 0) {
        const firstContext = beanData.contexts[contextNames[0]];
        setBeans(Object.keys(firstContext.beans));
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to fetch monitoring data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Optional: Auto-refresh every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>시스템 모니터링 (System Monitor)</h1>
      <button 
        onClick={fetchData} 
        style={{
          padding: '8px 16px',
          marginBottom: '20px',
          backgroundColor: '#0070f3',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        새로고침
      </button>

      {loading && <p>데이터 로딩 중...</p>}
      {error && <p style={{ color: 'red' }}>에러: {error}</p>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Health Card */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>상태 (Health)</h2>
          {health ? (
            <div>
              <p style={{ fontSize: '24px', fontWeight: 'bold', color: health.status === 'UP' ? 'green' : 'red' }}>
                {health.status}
              </p>
              <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', fontSize: '12px', overflow: 'auto' }}>
                {JSON.stringify(health.details || {}, null, 2)}
              </pre>
            </div>
          ) : <p>No data</p>}
        </div>

        {/* Memory Card */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h2>메모리 (JVM Memory Used)</h2>
          {memory ? (
            <div>
               <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0070f3' }}>
                {formatBytes(memory.measurements[0].value)}
              </p>
              <p>Base Unit: {memory.baseUnit}</p>
            </div>
          ) : <p>No data</p>}
        </div>

        {/* Beans Card */}
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', gridColumn: '1 / -1' }}>
          <h2>등록된 빈 (Beans) - 총 {beans.length}개</h2>
          <div style={{ maxHeight: '200px', overflowY: 'auto', backgroundColor: '#f9f9f9', padding: '10px', border: '1px solid #eee' }}>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {beans.map(bean => (
                <li key={bean}>{bean}</li>
              ))}
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

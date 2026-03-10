"use client";

import { useState } from "react";
import axios from "axios";

export default function LoadTestPage() {
  const [count, setCount] = useState(10);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    setLoading(true);
    setResult(null);
    try {
      const res = await axios.post("/api/ticketing/test/simulate", { count });
      setResult(res.data);
    } catch (e) {
      alert("테스트 중 오류가 발생했습니다. 좌석 ID 1번이 DB에 존재하는지 확인해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Ticketing Load Test</h1>
        <p className="text-slate-500 mb-8">동시 접속 시뮬레이션 및 부하 테스트 리포트</p>

        <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 shadow-2xl">
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">테스트 인원 (명)</label>
            <input 
              type="number" 
              value={count} 
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          <button 
            onClick={runTest}
            disabled={loading}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading ? 'bg-slate-800 text-slate-600' : 'bg-purple-600 hover:bg-purple-500'
            }`}
          >
            {loading ? '테스트 진행 중...' : '시뮬레이션 시작'}
          </button>
        </div>

        {result && (
          <div className="mt-8 grid grid-cols-2 gap-4">
             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-sm">성공 횟수</p>
                <p className="text-4xl font-bold text-emerald-500">{result.success}</p>
             </div>
             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-sm">실패 횟수</p>
                <p className="text-4xl font-bold text-red-500">{result.failure}</p>
             </div>
             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-sm">총 소요 시간</p>
                <p className="text-2xl font-bold">{result.durationMs}ms</p>
             </div>
             <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-sm">평균 응답 속도</p>
                <p className="text-2xl font-bold">{result.avgMs}ms</p>
             </div>
             <div className="col-span-2 bg-slate-900 p-6 rounded-2xl border border-slate-800">
                <p className="text-slate-500 text-sm mb-4">성공률</p>
                <div className="w-full h-4 bg-slate-800 rounded-full overflow-hidden">
                   <div 
                    className="h-full bg-emerald-500 transition-all duration-1000" 
                    style={{ width: `${(result.success / result.total) * 100}%` }}
                   ></div>
                </div>
                <p className="text-right mt-2 text-sm font-bold text-emerald-500">{((result.success / result.total) * 100).toFixed(1)}%</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

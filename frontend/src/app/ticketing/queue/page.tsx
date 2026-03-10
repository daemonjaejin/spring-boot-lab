"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function QueuePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const userId = searchParams.get("userId");
  const [status, setStatus] = useState<any>({ rank: -1, totalWaiting: 0 });

  useEffect(() => {
    if (!userId) return;

    const eventSource = new EventSource(`/api/ticketing/subscribe/${userId}`);

    eventSource.addEventListener("queueStatus", (event) => {
      const data = JSON.parse(event.data);
      setStatus(data);

      if (data.isProcessing) {
        eventSource.close();
        router.push(`/ticketing/seats?userId=${userId}`);
      }
    });

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [userId, router]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-md w-full relative overflow-hidden">
        {/* Progress Background */}
        <div className="absolute top-0 left-0 h-1 bg-purple-500 transition-all duration-1000" style={{ width: '100%' }}></div>
        
        <h1 className="text-2xl font-bold mb-6">입장 대기 중입니다</h1>
        
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-slate-700 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-purple-500 rounded-full animate-spin"></div>
            <span className="text-3xl font-bold">{status.rank >= 0 ? status.rank + 1 : "?"}</span>
          </div>
          <p className="text-slate-400">나의 대기 순번</p>
        </div>

        <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/50">
          <p className="text-sm text-slate-400">현재 대기 인원: <span className="text-white font-bold">{status.totalWaiting}명</span></p>
        </div>

        <p className="mt-6 text-sm text-slate-500">
          새로고침을 하거나 창을 닫으면 대기 순번이 초기화될 수 있습니다.
        </p>
      </div>
    </div>
  );
}

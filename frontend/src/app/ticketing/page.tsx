"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function TicketingPage() {
  const [serverTime, setServerTime] = useState<Date | null>(null);
  const [targetTime] = useState(new Date(Date.now() + 10000)); // 10 seconds from now
  const [timeLeft, setTimeLeft] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = targetTime.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft(0);
        setIsStarted(true);
        clearInterval(timer);
      } else {
        setTimeLeft(Math.floor(diff / 1000));
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  const handleEnterQueue = async () => {
    const userId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("ticketing_user_id", userId);
    await axios.post("/api/ticketing/enter", { userId });
    router.push(`/ticketing/queue?userId=${userId}`);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700 text-center max-w-md w-full">
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
          Antigravity Ticketing
        </h1>
        <p className="text-slate-400 mb-8">대규모 동시 접속 부하 분산 시스템 적용됨</p>
        
        <div className="mb-8">
          <p className="text-sm text-slate-500 uppercase tracking-widest mb-2">예매 개시까지</p>
          <div className="text-6xl font-mono font-bold text-pink-500">
            {timeLeft > 0 ? `${timeLeft}s` : "STARTED!"}
          </div>
        </div>

        <button
          onClick={handleEnterQueue}
          disabled={!isStarted}
          className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
            isStarted 
              ? "bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 shadow-purple-500/20 shadow-lg" 
              : "bg-slate-700 text-slate-500 cursor-not-allowed"
          }`}
        >
          {isStarted ? "예매하기" : "대기 중..."}
        </button>
      </div>
    </div>
  );
}

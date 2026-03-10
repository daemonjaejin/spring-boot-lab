"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import axios from "axios";

export default function SeatsPage() {
  const searchParams = useSearchParams();
  const userId = searchParams.get("userId");
  const [seats, setSeats] = useState<any[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<any>(null);
  const [isPaid, setIsPaid] = useState(false);

  const fetchSeats = async () => {
    const res = await axios.get("/api/ticketing/seats");
    setSeats(res.data);
  };

  useEffect(() => {
    fetchSeats();
    const interval = setInterval(fetchSeats, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleReserve = async (seat: any) => {
    if (seat.status !== 'AVAILABLE') return;
    try {
      await axios.post(`/api/ticketing/seats/${seat.id}/reserve`, { userId });
      setSelectedSeat(seat);
      alert("좌석이 임시 예약되었습니다. 5분 내로 결제를 진행해주세요.");
      fetchSeats();
    } catch (e) {
      alert("이미 선택된 좌석이거나 예약에 실패했습니다.");
      fetchSeats();
    }
  };

  const handlePayment = async () => {
    if (!selectedSeat) return;
    try {
      await axios.post(`/api/ticketing/seats/${selectedSeat.id}/payment`, { userId });
      setIsPaid(true);
    } catch (e) {
      alert("결제 처리 중 오류가 발생했습니다.");
    }
  };

  if (isPaid) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
        <div className="bg-emerald-500/10 p-8 rounded-2xl border border-emerald-500 text-center max-w-md w-full">
           <div className="text-6xl mb-4">🎉</div>
           <h1 className="text-2xl font-bold text-emerald-500 mb-2">예매 완료!</h1>
           <p className="text-slate-400">공연장에서 뵙겠습니다.</p>
           <button onClick={() => window.location.href = '/ticketing'} className="mt-8 px-6 py-2 bg-emerald-600 rounded-lg">처음으로</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-purple-400">좌석 선택</h1>
            <p className="text-slate-500">원하시는 좌석을 클릭하세요.</p>
          </div>
          {selectedSeat && (
            <div className="bg-purple-600 px-6 py-3 rounded-xl flex items-center gap-4 animate-bounce">
              <span>{selectedSeat.rowNum}{selectedSeat.colNum}석 선택됨</span>
              <button onClick={handlePayment} className="bg-white text-purple-600 px-4 py-1 rounded font-bold">결제하기</button>
            </div>
          )}
        </header>

        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl overflow-x-auto">
           <div className="w-[800px] flex flex-col items-center gap-8 mx-auto">
              <div className="w-full h-8 bg-slate-700 rounded-full flex items-center justify-center text-sm text-slate-400 font-bold uppercase tracking-[1em]">STAGE</div>
              
              <div className="grid grid-cols-10 gap-3">
                {seats.length > 0 ? seats.map((seat) => (
                   <button
                    key={seat.id}
                    onClick={() => handleReserve(seat)}
                    disabled={seat.status !== 'AVAILABLE'}
                    className={`w-12 h-12 rounded-lg text-xs font-bold transition-all ${
                      seat.status === 'AVAILABLE' ? 'bg-slate-700 hover:bg-purple-500 hover:scale-110' :
                      seat.status === 'RESERVED' ? 'bg-amber-500 cursor-not-allowed opacity-50' :
                      'bg-red-500 cursor-not-allowed opacity-50'
                    } ${selectedSeat?.id === seat.id ? 'ring-2 ring-white scale-110 bg-purple-600' : ''}`}
                   >
                     {seat.rowNum}{seat.colNum}
                   </button>
                )) : (
                  <div className="col-span-10 text-slate-500 py-20">좌석 데이터를 불러오는 중...</div>
                )}
              </div>
           </div>
        </div>

        <div className="mt-8 flex justify-center gap-8 text-sm">
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-slate-700 rounded"></div> 선택 가능</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-amber-500 rounded"></div> 예약 중</div>
           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded"></div> 판매 완료</div>
        </div>
      </div>
    </div>
  );
}

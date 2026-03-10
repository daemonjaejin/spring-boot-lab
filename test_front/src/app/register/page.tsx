'use client';

import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { useRouter } from 'next/navigation'; // 페이지 이동을 위한 훅

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    role: 'MEMBER' // 기본값 설정
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 백엔드 @PostMapping /api/members 호출
      await apiClient.post('/api/members', formData);
      alert('회원가입이 완료되었습니다. 로그인 해주세요.');
      router.push('/login'); // 가입 성공 시 로그인 페이지로 이동
    } catch (error: any) {
      alert('가입 실패: ' + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-slate-800">계정 생성</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">아이디 (Username)</label>
            <input
              type="text"
              className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">비밀번호</label>
            <input
              type="password"
              className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">성함</label>
            <input
              type="text"
              className="w-full p-2 border rounded outline-none focus:ring-2 focus:ring-blue-500"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">권한 설정</label>
            <select 
              className="w-full p-2 border rounded outline-none"
              value={formData.role}
              onChange={(e) => setFormData({...formData, role: e.target.value})}
            >
              <option value="MEMBER">일반 사용자 (MEMBER)</option>
              <option value="ADMIN">관리자 (ADMIN)</option>
              <option value="TESTER">테스터 (TESTER)</option>
            </select>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-md font-bold hover:bg-blue-700 transition">
            회원가입 완료
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <button onClick={() => router.push('/login')} className="text-sm text-slate-500 hover:underline">
            이미 계정이 있으신가요? 로그인
          </button>
        </div>
      </div>
    </div>
  );
}
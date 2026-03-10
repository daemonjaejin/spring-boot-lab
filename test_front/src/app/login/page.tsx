'use client'; // 1. 브라우저 이벤트를 처리하기 위한 선언

import { useState } from 'react';
import { apiClient } from '@/lib/apiClient';
import { setCookie } from 'cookies-next'; // 1. 쿠키 라이브러리 추가
import { useRouter, useSearchParams } from 'next/navigation'; // 2. 라우터 추가
import { useUserStore } from '@/store/useUserStore';

// 3. 백엔드 LoginResponse 스펙 정의 (AuthService에서 주는 JSON 규격)
interface LoginResponse {
  accessToken: string; // token -> accessToken
  username: string;
  role: string;
}

export default function LoginPage() {

  const { setUser } = useUserStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/member';

  // 2. 입력 폼 상태 관리 (Vue의 v-model 역할)
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 3. 백엔드 로그인 API 호출 (Spring Security의 /login 또는 커스텀 엔드포인트)
      // 실제로는 여기서 받은 토큰을 Cookie나 LocalStorage에 저장해야 합니다.
      const res = await apiClient.post<LoginResponse>('/api/auth/login', formData);

      console.log("백엔드에서 온 데이터 전체 : ", res);

      if (res.accessToken) {
        // 1. 토큰 저장
        setCookie('accessToken', res.accessToken, { maxAge: 60 * 60 * 24, path: '/' });

        // [핵심] 여기서 전역 상태를 업데이트하면 헤더가 바로 바뀝니다!
        setUser({ name: res.username, role: res.role });
        
        // 2. [핵심] 서버 컴포넌트(Layout 포함) 데이터 즉시 갱신 명령
        // 이 한 줄이 실행되는 순간, layout.tsx의 getUserData가 다시 실행되어 헤더가 바뀝니다.
        router.refresh();

        // 3. 페이지 이동
        router.push(callbackUrl);
      }
      
    } catch (error: any) {
      // 시니어님 아까 GlobalExceptionHandler에서 본 에러 메시지가 일로 들어옵니다.
      alert('로그인 실패: ' + (error.message || '아이디 또는 비밀번호를 확인하세요.'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h1 className="text-2xl font-bold text-center mb-8 text-slate-800">ADMIN LOGIN</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">아이디</label>
            <input
              type="text"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">비밀번호</label>
            <input
              type="password"
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none text-slate-900"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition"
          >
            접속하기
          </button>
        </form>
      </div>
    </div>
  );
}
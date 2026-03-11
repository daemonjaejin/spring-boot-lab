import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import * as Utils from '@/lib/utils';

interface Member {
  id: number;
  username: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export default async function MemberListPage() {
  const currentUserRole = 'ADMIN'; 

  try {
    const members = await apiClient.get<Member[]>('/api/members');

    return (
      // 1. 메인 카드 박스: dark:bg-slate-800 와 dark:border-slate-700 추가
      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-slate-700 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">회원 정보 관리</h2>
          {currentUserRole === 'ADMIN' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">
              신규 계정 생성
            </button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            {/* 2. 헤더: dark:bg-slate-700/50 적용 */}
            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-600 dark:text-slate-400 text-sm border-b dark:border-slate-700">
              <tr>
                <th className="p-3 text-left font-semibold">번호</th>
                <th className="p-3 text-left font-semibold">아이디(Username)</th>
                <th className="p-3 text-left font-semibold">이름</th>
                <th className="p-3 text-left font-semibold">권한</th>
                <th className="p-3 text-left font-semibold">가입일</th>
                <th className="p-3 text-left font-semibold">수정일</th>
                <th className="p-3 text-center font-semibold">관리</th>
              </tr>
            </thead>
            {/* 3. 바디: 구분선 색상 dark:divide-slate-700 */}
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors group">
                  <td className="p-3 text-gray-500 dark:text-slate-500 text-sm">{member.id}</td>
                  <td className="p-3">
                    <Link href={`/member/${member.id}`} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
                      {member.username}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-700 dark:text-slate-300">{member.name}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      member.role === 'ADMIN' 
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' 
                        : 'bg-gray-100 text-gray-600 dark:bg-slate-700 dark:text-slate-400'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="p-3 text-gray-400 dark:text-slate-500 text-xs">
                    {Utils.formatDate(member.created_at)}
                  </td>
                  <td className="p-3 text-gray-400 dark:text-slate-500 text-xs">
                    {Utils.formatDate(member.updated_at)}
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <Link href={`/member/${member.id}/edit`} className="text-xs text-gray-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400">
                        수정
                      </Link>
                      {currentUserRole === 'ADMIN' && (
                        <button className="text-xs text-red-400 dark:text-red-500/70 hover:text-red-600 dark:hover:text-red-400 font-bold">
                          삭제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-bold">API 호출 실패: {error.message}</p>
        <p className="text-sm text-gray-400 dark:text-slate-500 mt-2">Spring Boot 서버(8081)의 상태를 확인하세요.</p>
      </div>
    );
  }
}
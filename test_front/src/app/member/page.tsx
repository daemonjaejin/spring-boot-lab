import Link from 'next/link';
import { apiClient } from '@/lib/apiClient';
import { formatDate } from '@/lib/utils'; // 또는 정의한 위치

// 1. 백엔드 MemberDto 및 DB 구조와 동일하게 타입 정의
interface Member {
  id: number;
  username: string;
  name: string;
  role: string;
  created_at: string; // LocalDateTime 응답용
  updated_at: string; // LocalDateTime 응답용
}

export default async function MemberListPage() {
  // 실제 현업에선 세션(Auth) 정보를 가져오지만, 
  // 일단 'ADMIN' 권한이라고 가정하고 UI 로직을 짭니다.
  const currentUserRole = 'ADMIN'; 

  try {
    // 2. 백엔드 MemberController의 list() 메서드 호출 (@GetMapping)
    const members = await apiClient.get<Member[]>('/api/members');
    console.log(`members:`, members);

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800">회원 정보 관리</h2>
          {/* POST /api/members 대응 (ADMIN 전용) */}
          {currentUserRole === 'ADMIN' && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition">
              신규 계정 생성
            </button>
          )}
        </div>
        
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 text-gray-600 text-sm border-b">
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
          <tbody className="divide-y divide-gray-100">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition">
                <td className="p-3 text-gray-500 text-sm">{member.id}</td>
                <td className="p-3">
                  {/* 상세 보기(@GetMapping("/{id}"))로 이동 */}
                  <Link href={`/member/${member.id}`} className="text-blue-600 hover:underline font-medium">
                    {member.username}
                  </Link>
                </td>
                <td className="p-3 text-gray-700">{member.name}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    member.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {member.role}
                  </span>
                </td>
                <td className="p-3 text-gray-400 text-xs">
                  {formatDate(member.created_at)}
                </td>
                <td className="p-3 text-gray-400 text-xs">
                  {formatDate(member.updated_at)}
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center space-x-2">
                    {/* 수정 페이지 (@PutMapping("/{id}")) 이동 버튼 */}
                    <Link href={`/member/${member.id}/edit`} className="text-xs text-gray-500 hover:text-blue-600">
                      수정
                    </Link>
                    {/* 삭제 버튼 (@DeleteMapping("/{id}") - ADMIN 전용) */}
                    {currentUserRole === 'ADMIN' && (
                      <button className="text-xs text-red-400 hover:text-red-600 font-bold">
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
    );
  } catch (error: any) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-500 font-bold">API 호출 실패: {error.message}</p>
        <p className="text-sm text-gray-400 mt-2">Spring Boot 서버(8081)의 상태를 확인하세요.</p>
      </div>
    );
  }
}
/**
 * 날짜 포맷팅 공통 함수
 * @param dateString - ISO 8601 형식의 날짜 문자열
 * @returns 'YYYY-MM-DD' 형식의 문자열
 */
export const formatDate = (dateString: string | null | undefined) => {
  console.log(`dateString:`, dateString);

  if (!dateString) return '-';
  const date = new Date(dateString);
  
  // 유효하지 않은 날짜 포맷일 경우 방어 로직
  if (isNaN(date.getTime())) return '-';

  // 현업 트렌드: Intl.DateTimeFormat을 사용하면 로케일에 맞는 깔끔한 출력이 가능합니다.
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date).replace(/\. /g, '-').replace('.', '');
};
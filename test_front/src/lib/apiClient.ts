// import { getCookie } from 'cookies-next'; // 설치 필요: npm install cookies-next
import { getCookie } from 'cookies-next'; // 브라우저/서버 공용 쿠키 라이브러리

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
const DEFAULT_TIMEOUT = 5000; // 5초

const getAuthToken = async () => {
  if (typeof window === 'undefined') {
    // 서버 환경일 때만 동적으로 next/headers를 불러옵니다.
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('accessToken')?.value;
  }
  // 클라이언트 환경
  return getCookie('accessToken');
};

async function request<T>(endpoint: string, config: RequestInit = {}): Promise<T> {

  // 1. 클라이언트 환경이면 쿠키에서 토큰 추출
  const token = await getAuthToken(); // 환경에 맞춰 토큰 추출
  // const token = typeof window !== 'undefined' ? getCookie('accessToken') : null;

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // 토큰 자동 주입
    ...config.headers,
  };


  // 1. 타임아웃 컨트롤러 설정 (Java의 Future.get(timeout)과 유사)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
      ...config,
      headers,
    });

    // 401(Unauthorized) 발생 시 로그인 페이지로 강제 이동하는 로직도 여기서 처리
  if (response.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
    
    clearTimeout(timeoutId); // 정상 응답 시 타임아웃 해제
    return await handleResponse<T>(response);
  } catch (error: any) {
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다. (Timeout)');
    }
    throw error;
  }
}

// 이제 get, post는 내부적으로 request 함수를 호출하게 됩니다.
export const apiClient = {
  get: <T>(url: string) => request<T>(url, { method: 'GET' }),
  post: <T>(url: string, body: any) => request<T>(url, { 
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body) 
  }),
};

/**
 * [핵심] 공통 응답/에러 핸들러 (Java의 ErrorController/ControllerAdvice 역할)
 */
async function handleResponse<T>(response: Response): Promise<T> {
  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json().catch(() => ({})) : null;

  // 성공 케이스 (200~299)
  if (response.ok) {
    return data as T;
  }

  // 에러 케이스 처리 (시니어급 예외 설계)
  const errorStatus = response.status;
  let errorMessage = '알 수 없는 에러가 발생했습니다.';

  if (errorStatus === 400) {
    errorMessage = data?.message || '입력값이 올바르지 않습니다. (Bad Request)';
  } else if (errorStatus === 401) {
    console.log(`401 에러 발생`);
    errorMessage = '인증 정보가 유효하지 않습니다. (Unauthorized)';
    // [현업급 추가 로직]
    if (typeof window !== 'undefined') {
      console.log(`401 에러 발생 1`);
      // 1. 클라이언트 사이드: 즉시 로그인으로 이동
      alert(errorMessage); // 사용자에게 알림
      window.location.href = '/login'; 
    } else {
      console.log(`401 에러 발생 2`);
      // 2. 서버 사이드: 401임을 확실히 인지할 수 있도록 에러 객체에 status 주입
      const serverError = new Error(errorMessage);
      (serverError as any).status = 401; 
      throw serverError;
    }
  } else if (errorStatus === 403) {
    errorMessage = '권한이 없습니다. (Forbidden)';
  } else if (errorStatus === 404) {
    errorMessage = '요청하신 리소스를 찾을 수 없습니다. (Not Found)';
  } else if (errorStatus >= 500) {
    errorMessage = '백엔드 서버 내부 에러가 발생했습니다. (Spring Boot 확인 필요)';
  }

  console.error(`[API ERROR] ${errorStatus} | ${errorMessage}`);
  
  // 여기서 커스텀 Error 객체를 던지면, Next.js의 error.tsx에서 이를 낚아챕니다.
  throw new Error(errorMessage);
}
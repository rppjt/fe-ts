import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

// ✅ fetch 옵션 타입
interface AuthFetchOptions extends RequestInit {
  headers?: HeadersInit;
}

// ✅ 에러 응답 타입
interface ErrorResponse {
  code: string;
  message: string;
}

// ✅ refresh 응답 타입
interface RefreshResponse {
  accessToken?: string;
}

// ✅ 중복 navigate 방지 전역 변수
let hasNavigated = false;

export const useAuthFetch = () => {
  const { accessToken, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const maxRetry = 2;

  // ✅ 단 한 번만 navigate("/") 호출
  const navigateToLogin = (reason: string) => {
    if (!hasNavigated) {
      console.warn("🚪 로그아웃 처리:", reason);
      hasNavigated = true;
      setAccessToken(null);
      navigate("/");
    }
  };

  // ✅ 메인 fetch 함수
  const authFetch = async (url: string, options: AuthFetchOptions = {}, retryCount: number = 0): Promise<Response> => {
    console.log("✅ authFetch 실행됨. 현재 accessToken:", accessToken, "| retryCount:", retryCount);
    console.log("📡 요청 URL:", url);

    let token = accessToken;

    // ✅ 최초 토큰 없음 → refresh 시도
    if (!token && retryCount === 0) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        hasNavigated = false;
        token = refreshed;
        setAccessToken(refreshed);
      } else {
        navigateToLogin("accessToken 없음 + refresh 실패");
        throw new Error("accessToken 없음 + refresh 실패");
      }
    }

    const config: AuthFetchOptions = {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...(token && { Authorization: `Bearer ${token}` }),
        "Content-Type": "application/json",
      },
      credentials: "include",
    };

    console.log("📡 요청 정보:", url, config);

    const res = await fetch(url, config);

    // ✅ 401 처리: 재시도 또는 로그아웃
    if (res.status === 401) {
      let error: ErrorResponse = { code: "UNKNOWN", message: "알 수 없는 인증 오류" };
      try {
        error = await res.json();
      } catch (e) {
        console.warn("⚠️ 401 응답 JSON 파싱 실패:", e);
      }

      if (retryCount < maxRetry && error.code === "J001") {
        const newToken = await tryRefreshToken();
        if (!newToken) {
          navigateToLogin("accessToken 재발급 실패");
          return new Response(null, { status: 401 }); // ✅ 안전하게 종료
        }

        hasNavigated = false;
        setAccessToken(newToken);

        const retryConfig: AuthFetchOptions = {
          ...options,
          headers: {
            ...(options.headers || {}),
            Authorization: `Bearer ${newToken}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
        };

        return await authFetch(url, retryConfig, retryCount + 1);
      }

      if (error.code === "J002") {
        navigateToLogin("refreshToken 만료");
        return new Response(null, { status: 401 }); // ✅ 종료
      }

      navigateToLogin(error.message || "기타 인증 실패");
      return new Response(null, { status: 401 }); // ✅ 추가
    }

    return res;
  };

  // ✅ 토큰 재발급 로직
  const tryRefreshToken = async (): Promise<string | null> => {
    try {
      const res = await fetch("http://localhost:8080/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        const err: Partial<ErrorResponse> = (await res.json().catch(() => null)) || {};
        console.warn("❌ refresh 실패:", err?.message);
        return null;
      }

      const data: RefreshResponse = await res.json();
      return data.accessToken || null;
    } catch (err) {
      console.error("🔁 refresh 요청 중 예외 발생", err);
      return null;
    }
  };

  return authFetch;
};

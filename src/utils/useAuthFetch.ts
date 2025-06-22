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

export const useAuthFetch = () => {
  const { accessToken, setAccessToken } = useAuth();
  const navigate = useNavigate();
  const maxRetry = 2;

  const authFetch = async (url: string, options: AuthFetchOptions = {}, retryCount = 0): Promise<Response> => {
    console.log("✅ authFetch 실행됨. 현재 accessToken:", accessToken, "| retryCount:", retryCount);
    let token = accessToken;

    if (!token && retryCount === 0) {
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        token = refreshed;
        setAccessToken(refreshed);
      } else {
        console.warn("🚫 토큰 없음 + refresh 실패 → 로그아웃");
        setAccessToken(null);
        navigate("/");
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

    console.log("🧪 accessToken 상태:", token);
    console.log("📡 요청 정보:", url, config);
    let res = await fetch(url, config);

    // 🔐 401 Unauthorized 처리
    if (res.status === 401 && retryCount < maxRetry) {
      const error: ErrorResponse = await res.json();

      if (error.code === "J001") {
        const newToken = await tryRefreshToken();
        if (!newToken) {
          console.warn("❌ accessToken 재발급 실패");
          setAccessToken(null);
          navigate("/");
          throw new Error("accessToken 재발급 실패");
        }

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
      } else if (error.code === "J002") {
        console.warn("❌ refreshToken 만료, 재로그인 필요");
        setAccessToken(null);
        navigate("/");
        throw new Error("Refresh Token 만료");
      } else {
        console.warn("❌ 기타 인증 에러:", error.message);
        setAccessToken(null);
        navigate("/");
        throw new Error(error.message || "인증 실패");
      }
    }

    return res;
  };

  // 🔁 accessToken 재발급 요청
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

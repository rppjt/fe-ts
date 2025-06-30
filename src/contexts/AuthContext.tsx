import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import authAxios from "../utils/authAxios";

// ✅ 유저 타입 정의
interface User {
  userId: number;
  email: string;
  name: string;
}

// ✅ Context 값 타입
interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthReady: boolean;
}

// ✅ Context 생성
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [isAuthReady, setIsAuthReady] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const setAccessToken = (token: string | null) => {
    if (token) {
      localStorage.setItem("accessToken", token);
    } else {
      localStorage.removeItem("accessToken");
    }
    setAccessTokenState(token);
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    if (!token) {
      setUser(null);
      setIsAuthReady(true); // 이건 유지
      return;
    }

    setAccessToken(token);

    authAxios
      .get<User>("/user")
      .then((res) => {
        console.log("✅ 사용자 정보 불러오기 성공:", res.data);
        setUser(res.data);
      })
      .catch((err) => {
        console.error("❌ 사용자 정보 로딩 실패:", err);
        setUser(null);
      })
      .finally(() => {
        console.log("🟢 AuthContext 초기화 완료됨");
        setIsAuthReady(true);
      });
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, user, setUser, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서만 사용해야 합니다.");
  }
  return context;
};

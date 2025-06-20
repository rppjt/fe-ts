import { createContext, useContext, useState, useEffect, ReactNode } from "react";

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
      setIsAuthReady(true);
      return;
    }

    setAccessToken(token);

    fetch("http://localhost:8080/user", {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("유저 응답 실패");
        return res.json();
      })
      .then((data: User) => {
        console.log("✅ 사용자 정보 불러오기 성공:", data);
        setUser(data);
        setIsAuthReady(true);
      })
      .catch((err) => {
        console.error("❌ 사용자 정보 로딩 실패:", err);
        setUser(null);
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

import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import authAxios from "../../utils/authAxios";

const LoginKakkoCallback = () => {
  const [searchParams] = useSearchParams();
  const { setAccessToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");

    if (success === "true") {
      authAxios
        .get("/auth/token", { withCredentials: true })
        .then((res) => {
          const token = res.data.access_token;
          if (token) {
            setAccessToken(token); // 👉 localStorage 저장
            return authAxios.get("/user"); // 👉 여기서 user도 가져오기
          } else {
            throw new Error("No accessToken in response");
          }
        })
        .then((res) => {
          // 사용자 정보 저장
          const userData = res.data;
          // useAuth().setUser 또는 다른 상태 저장
          // 예: setUser(userData); (필요 시)
          navigate("/home");
        })
        .catch((err) => {
          console.error("❌ 로그인 처리 실패:", err);
          navigate("/");
        });
    } else {
      console.error("❌ 로그인 실패:", error);
      navigate("/");
    }
  }, [searchParams, setAccessToken, navigate]);

  return <p>🔐 로그인 처리 중입니다...</p>;
};

export default LoginKakkoCallback;

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
        .get("/auth/token", { withCredentials: true }) // 백엔드에 따라 withCredentials 유지 필요
        .then((res) => {
          const token = res.data.access_token;
          if (token) {
            setAccessToken(token);
            navigate("/home");
          } else {
            console.error("❌ accessToken 없음");
            navigate("/");
          }
        })
        .catch((err) => {
          console.error("❌ token 요청 실패:", err);
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

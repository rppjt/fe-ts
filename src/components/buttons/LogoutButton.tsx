import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; // ✅ 이거 추가
import { useAuthFetch } from "../../utils/useAuthFetch";

const LogoutButton = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();
  const { setAccessToken } = useAuth(); // ✅ 이거 추가

  const handleLogout = async (): Promise<void> => {
    try {
      await authFetch("http://localhost:8080/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("accessToken"); // ✅ localStorage 삭제
      setAccessToken(null); // ✅ 전역 상태도 삭제
      navigate("/"); // ✅ 홈 또는 로그인 페이지로 이동
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;

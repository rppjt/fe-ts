import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import authAxios from "../../utils/authAxios"; // ✅ axios 인스턴스 직접 사용

const LogoutButton = () => {
  const navigate = useNavigate();
  const { setAccessToken } = useAuth();

  const handleLogout = async (): Promise<void> => {
    try {
      await authAxios.post("/auth/logout"); // ✅ axios POST 방식

      localStorage.removeItem("accessToken");
      setAccessToken(null);
      navigate("/");
    } catch (err) {
      console.error("❌ 로그아웃 실패:", err);
    }
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;

import { useNavigate } from "react-router-dom";
import { useAuthFetch } from "../../utils/useAuthFetch";

const LogoutButton = () => {
  const navigate = useNavigate();
  const authFetch = useAuthFetch();

  const handleLogout = async (): Promise<void> => {
    try {
      await authFetch("http://localhost:8080/auth/logout", {
        method: "POST",
      });

      localStorage.removeItem("accessToken");
      navigate("/");
    } catch (err) {
      console.error("로그아웃 실패:", err);
    }
  };

  return <button onClick={handleLogout}>로그아웃</button>;
};

export default LogoutButton;

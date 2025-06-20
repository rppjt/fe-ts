import { useNavigate } from "react-router-dom";

export const useGoHome = (): (() => void) => {
  const navigate = useNavigate();
  return () => navigate("/home");
};

import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthReady, accessToken } = useAuth();

  if (!isAuthReady) return null;
  if (!accessToken) return <Navigate to='/login' replace />;

  return <>{children}</>;
};

export default ProtectedRoute;

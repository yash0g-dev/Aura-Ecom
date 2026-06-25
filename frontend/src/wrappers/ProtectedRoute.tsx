import { Navigate } from "react-router-dom";
import { useUserStore } from "../store/useUserStore";

export const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = useUserStore((state) => state.user);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

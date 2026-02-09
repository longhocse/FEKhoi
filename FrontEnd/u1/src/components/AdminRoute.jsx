import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) return null;

  if (!user || !isAdmin) {
    return <Navigate to="/dang-nhap" replace />;
  }

  return children;
}

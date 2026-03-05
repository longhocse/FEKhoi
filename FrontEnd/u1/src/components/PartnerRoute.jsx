import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PartnerRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user || user.role !== "partner") {
    return <Navigate to="/dang-nhap-nha-xe" />;
  }

  return children;
}

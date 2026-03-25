import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children, role }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh" }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/dang-nhap" />;
  }

  // Có yêu cầu role nhưng role không đúng
  if (role && user?.role !== role) {
    return <Navigate to="/" />;
  }

  return children;
}

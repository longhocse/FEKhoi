import { useAuth } from "../context/AuthContext";
import AppNavbar from "./AppNavbar";
import AppFooter from "./AppFooter";

export default function AppLayout({ children }) {
  const { user, loading } = useAuth();

  if (loading) return null;

  const isPartner = user?.role === "partner";

  return (
    <>
      {!isPartner && <AppNavbar />}
      {children}
      {!isPartner && <AppFooter />}
    </>
  );
}

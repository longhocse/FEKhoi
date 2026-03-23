import { Outlet } from "react-router-dom";
import AppNavbar from "../components/AppNavbar";
import AppFooter from "../components/AppFooter";

export default function MainLayout() {
  return (
    <>
      <AppNavbar />
      <Outlet />
      <AppFooter />
    </>
  );
}
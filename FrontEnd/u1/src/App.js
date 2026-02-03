import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppNavbar from "./components/AppNavbar";
import AppFooter from "./components/AppFooter";

import Home from "./pages/Home";
import RoutesPage from "./pages/Routes";
import RouteDetail from "./pages/RouteDetail";
import Partner from "./pages/Partner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <AppNavbar />
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/tuyen-xe" element={<RoutesPage />} />
  <Route path="/tuyen-xe/:id" element={<RouteDetail />} />   {/* ← sửa chỗ này nếu có lặp "element" hoặc thiếu <> */}
  <Route path="/doi-tac" element={<Partner />} />
  <Route path="/dang-nhap" element={<Login />} />
  <Route path="/dang-ky" element={<Register />} />
  <Route path="*" element={<NotFound />} />
</Routes>
      <AppFooter />
    </BrowserRouter>
  );
}

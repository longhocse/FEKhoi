import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import AppNavbar from "./components/AppNavbar";
import AppFooter from "./components/AppFooter";

import Home from "./pages/Home";
import RoutesPage from "./pages/Routes";
import RouteDetail from "./pages/RouteDetail";
import Partner from "./pages/Partner";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppNavbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tuyen-xe" element={<RoutesPage />} />
          <Route path="/tuyen-xe/:id" element={<RouteDetail />} />
          <Route path="/doi-tac" element={<Partner />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/chon-ghe" element={<SeatSelection />} />
          <Route path="/thanh-toan" element={<Payment />} />
          
          {/* Routes cần đăng nhập */}
          <Route path="/thong-tin-ca-nhan" element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          } />
          
          {/* Route admin */}
          <Route path="/quan-tri" element={<AdminDashboard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AppFooter />
      </BrowserRouter>
    </AuthProvider>
  );
}
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

import AppNavbar from "./components/AppNavbar";
import AppFooter from "./components/AppFooter";
import PrivateRoute from "./components/PrivateRoute";
import PartnerRoute from "./components/PartnerRoute";

// Pages khách
import Home from "./pages/Home";
import RoutesPage from "./pages/Routes";
import RouteDetail from "./pages/RouteDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";

// Pages nhà xe
import PartnerLogin from "./pages/PartnerLogin";
import PartnerDashboard from "./partner/PartnerDashboard";
import PartnerLayout from "./partner/PartnerLayout";
import CreateTrip from "./partner/CreateTrip";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppNavbar />

        <Routes>
          {/* ===== KHÁCH ===== */}
          <Route path="/" element={<Home />} />
          <Route path="/tuyen-xe" element={<RoutesPage />} />
          <Route path="/tuyen-xe/:id" element={<RouteDetail />} />
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />
          <Route path="/chon-ghe" element={<SeatSelection />} />
          <Route path="/thanh-toan" element={<Payment />} />
          <Route
  path="/doi-tac"
  element={
    <PartnerRoute>
      <PartnerLayout />
    </PartnerRoute>
  }
>
  <Route index element={<PartnerDashboard />} />
  <Route path="tao-chuyen-xe" element={<CreateTrip />} />
</Route>

          <Route
            path="/thong-tin-ca-nhan"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          {/* ===== NHÀ XE ===== */}
          <Route path="/dang-nhap-nha-xe" element={<PartnerLogin />} />

          <Route
            path="/nha-xe"
            element={
              <PartnerRoute>
                <PartnerDashboard />
              </PartnerRoute>
            }
          />
          <Route
  path="/nha-xe/tao-chuyen"
  element={
    <PartnerRoute>
      <CreateTrip />
    </PartnerRoute>
  }
/>

          {/* ===== 404 ===== */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        <AppFooter />
      </BrowserRouter>
    </AuthProvider>
  );
}

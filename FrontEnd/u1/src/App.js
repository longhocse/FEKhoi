import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { useState, useEffect } from "react";

import PrivateRoute from "./components/PrivateRoute";
import PartnerRoute from "./components/PartnerRoute";
import AdminRoute from "./components/AdminRoute";
import MainLayout from "./components/MainLayout";

// ===== Pages khách =====
import Home from "./pages/Home";
import RouteDetail from "./pages/RouteDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";
import TuyenXe from './pages/TuyenXe';
import { TripProvider } from "./context/TripContext";
import AdminCompanies from './pages/AdminCompanies';
import AdminTickets from "./pages/AdminTickets";

// ===== Pages nhà xe =====
import PartnerLogin from "./pages/PartnerLogin";
import PartnerDashboard from "./partner/PartnerDashboard";
import PartnerLayout from "./partner/PartnerLayout";
import CreateTrip from "./partner/CreateTrip";
import PartnerTrips from "./partner/PartnerTrips";
import PartnerVehicles from "./partner/PartnerVehicles";
import PartnerSettings from "./partner/PartnerSettings";

// ===== Pages admin =====
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminRoutes from "./admin/AdminRoutes";

import AdminSettings from "./admin/AdminSettings";

export default function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:5000/api/test")
      .then(res => {
        if (!res.ok) {
          throw new Error("API not found");
        }
        return res.json();
      })
      .then(data => console.log(data))
      .catch(err => console.error("Lỗi:", err.message));
  }, []);
  return (
    <AuthProvider>
      <TripProvider>
        <BrowserRouter>

          <Routes>

            {/* ================= KHÁCH (Có Navbar + Footer) ================= */}
            <Route element={<MainLayout />}>

              <Route path="/" element={<Home />} />
              {/* <Route path="/tuyen-xe" element={<RoutesPage />} /> */}
              <Route path="/tuyen-xe/:id" element={<RouteDetail />} />
              <Route path="/dang-nhap" element={<Login />} />
              <Route path="/dang-ky" element={<Register />} />
              <Route path="/chon-ghe" element={<SeatSelection />} />
              <Route path="/thanh-toan" element={<Payment />} />

              <Route
                path="/thong-tin-ca-nhan"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />

            </Route>


            {/* ================= ADMIN (Không có Navbar/Footer) ================= */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="routes" element={<AdminRoutes />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="ve" element={<AdminTickets />} />
              <Route path="quan-ly-ve" element={<AdminTickets />} />
              <Route path="nha-xe" element={<AdminCompanies />} />
              <Route path="companies" element={<AdminCompanies />} />
            </Route>


            {/* ================= PARTNER ================= */}
            <Route
              path="/doi-tac"
              element={
                <PartnerRoute>
                  <PartnerLayout />
                </PartnerRoute>
              }
            >
              <Route index element={<PartnerDashboard />} />
              <Route path="trips" element={<PartnerTrips />} />
              <Route path="vehicles" element={<PartnerVehicles />} />
              <Route path="settings" element={<PartnerSettings />} />
            </Route>

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
            <Route path="/tuyen-xe" element={<TuyenXe />} />
            {/* <Route path="/tuyen-xe/:id" element={<RouteDetail />} /> */}
            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />

          </Routes>



        </BrowserRouter>
      </TripProvider>
    </AuthProvider>
  );
}
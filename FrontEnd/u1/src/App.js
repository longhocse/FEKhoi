// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from './context/WalletProvider';

import { useState, useEffect } from "react";
import { Toaster } from 'react-hot-toast';

import PrivateRoute from "./components/PrivateRoute";
import PartnerRoute from "./components/PartnerRoute";
import AdminRoute from "./components/AdminRoute";
import MainLayout from "./components/MainLayout";
import Wallet from './pages/Wallet';

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
import MyTickets from './pages/MyTickets';
import { TripProvider } from "./context/TripContext";
import AdminCompanies from './pages/AdminCompanies';
import AdminTickets from "./pages/AdminTickets";
import AdminRefundManagement from './pages/admin/AdminRefundManagement';
import TrackingPage from "./pages/TrackingPage";
import TinTuc from "./pages/TinTuc";
import LienHe from "./pages/LienHe";
import AdminReports from './pages/admin/AdminReports';
import AdminReviews from './pages/admin/AdminReviews';
import TicketDetail from "./pages/TicketDetail";

// ===== Wallet Pages =====
import WalletPage from './pages/Wallet';
import WalletTopUp from './pages/WalletTopUp';

// ===== Pages nhà xe =====
import PartnerLogin from "./pages/PartnerLogin";
import PartnerDashboard from "./partner/PartnerDashboard";
import PartnerLayout from "./partner/PartnerLayout";
import CreateTrip from "./partner/CreateTrip";
import PartnerTrips from "./partner/PartnerTrips";
import PartnerVehicles from "./partner/PartnerVehicles";
import PartnerTicketsPage from "./partner/PartnerTicketPage";
import TripSeats from "./partner/TripSeats";
import QrTicketPage from "./pages/QrTicketPage";
import PartnerRefunds from "./partner/PartnerRefunds";

// ===== Pages admin =====
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminSettings from "./admin/AdminSettings";
import AdminRoutes from './admin/AdminRoutes';
import AdminTrips from './admin/AdminTrips';
import AdminSeats from './admin/AdminSeats';
import AdminPromotions from './admin/AdminPromotions';

// KHÔNG IMPORT CompanyReviews VÀO ĐÂY - Nó là component con, không phải trang

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
    <BrowserRouter>
      <AuthProvider>
        <TripProvider>
          <WalletProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />

            <Routes>
              {/* ================= KHÁCH (Có Navbar + Footer) ================= */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/tuyen-xe" element={<TuyenXe />} />
                <Route path="/tuyen-xe/:id" element={<RouteDetail />} />
                <Route path="/dang-nhap" element={<Login />} />
                <Route path="/dang-ky" element={<Register />} />
                <Route path="/chon-ghe" element={<SeatSelection />} />
                <Route path="/chon-ghe/:id" element={<SeatSelection />} />
                <Route path="/thanh-toan" element={<Payment />} />
                <Route path="/tin-tuc" element={<TinTuc />} />
                <Route path="/lien-he" element={<LienHe />} />
                <Route path="/tracking/:tripId" element={<TrackingPage />} />
                <Route path="/ticket-group/:groupId" element={<TicketDetail />} />
                <Route path="/ticket/qrTicketPage/:id" element={<QrTicketPage />} />

                {/* Routes yêu cầu đăng nhập */}
                <Route
                  path="/thong-tin-ca-nhan"
                  element={
                    <PrivateRoute>
                      <Profile />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/ve-cua-toi"
                  element={
                    <PrivateRoute>
                      <MyTickets />
                    </PrivateRoute>
                  }
                />

                {/* Wallet Routes */}
                <Route
                  path="/vi"
                  element={
                    <PrivateRoute>
                      <WalletPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/vi/nap-tien"
                  element={
                    <PrivateRoute>
                      <WalletTopUp />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/wallet"
                  element={
                    <PrivateRoute>
                      <WalletPage />
                    </PrivateRoute>
                  }
                />

                <Route
                  path="/wallet/topup"
                  element={
                    <PrivateRoute>
                      <WalletTopUp />
                    </PrivateRoute>
                  }
                />
              </Route >

              {/* ================= ADMIN ================= */}
              < Route
                path="/admin"
                element={
                  < AdminRoute >
                    <AdminLayout />
                  </AdminRoute >
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="routes" element={<AdminRoutes />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="quan-ly-ve" element={<AdminTickets />} />
                <Route path="nha-xe" element={<AdminCompanies />} />
                <Route path="refunds" element={<AdminRefundManagement />} />
                <Route path="reports" element={<AdminReports />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="routes" element={<AdminRoutes />} />
                <Route path="admin-trips" element={<AdminTrips />} />
                <Route path="seats" element={<AdminSeats />} />
                <Route path="promotions" element={<AdminPromotions />} />
              </Route >

              {/* ================= PARTNER ================= */}
              < Route
                path="/doi-tac"
                element={
                  < PartnerRoute >
                    <PartnerLayout />
                  </PartnerRoute >
                }
              >
                <Route index element={<PartnerDashboard />} />
                <Route path="trips" element={<PartnerTrips />} />
                <Route path="edit-trip/:id" element={<CreateTrip />} />
                <Route path="vehicles" element={<PartnerVehicles />} />
                <Route path="tickets" element={<PartnerTicketsPage />} />
                <Route path="create-trip" element={<CreateTrip />} />
                <Route path="trip-seats/:tripId" element={<TripSeats />} />
                <Route path="refunds" element={<PartnerRefunds />} />
              </Route >

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

              {/* ================= 404 ================= */}
              <Route path="*" element={<NotFound />} />
            </Routes >
          </WalletProvider >
        </TripProvider >
      </AuthProvider >
    </BrowserRouter >
  );
}
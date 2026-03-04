import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TripProvider } from "./context/TripContext";

// Route Guards
import PrivateRoute from "./components/PrivateRoute";
import PartnerRoute from "./components/PartnerRoute";
import AdminRoute from "./components/AdminRoute";

// Layouts
import MainLayout from "./components/MainLayout";
import PartnerLayout from "./partner/PartnerLayout";
import AdminLayout from "./admin/AdminLayout";

// ===== Pages khách =====
import Home from "./pages/Home";
import RoutesPage from "./pages/Routes";
import RouteDetail from "./pages/RouteDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import SeatSelection from "./pages/SeatSelection";
import Payment from "./pages/Payment";
import NotFound from "./pages/NotFound";

// ===== Pages nhà xe =====
import PartnerLogin from "./pages/PartnerLogin";
import PartnerDashboard from "./partner/PartnerDashboard";
import CreateTrip from "./partner/CreateTrip";

// ===== Pages admin =====
import AdminDashboard from "./admin/AdminDashboard";
import AdminUsers from "./admin/AdminUsers";
import AdminPartners from "./admin/AdminPartners";
import AdminRoutes from "./admin/AdminRoutes";

export default function App() {
  return (
    <AuthProvider>
      <TripProvider>
        <BrowserRouter>
          <Routes>

            {/* ================= KHÁCH ================= */}
            <Route element={<MainLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/tuyen-xe" element={<RoutesPage />} />
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

            {/* ================= ADMIN ================= */}
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
              <Route path="partners" element={<AdminPartners />} />
              <Route path="routes" element={<AdminRoutes />} />
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
              <Route path="tao-chuyen-xe" element={<CreateTrip />} />
            </Route>

            <Route path="/dang-nhap-nha-xe" element={<PartnerLogin />} />

            {/* ================= 404 ================= */}
            <Route path="*" element={<NotFound />} />

          </Routes>
        </BrowserRouter>
      </TripProvider>
    </AuthProvider>
  );
}
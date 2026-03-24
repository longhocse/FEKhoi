require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { poolPromise } = require("./config/db");

// Import routes
const authRoutes2 = require("./routes/authRoutes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");
const tripRoutes = require("./routes/trip.routes");
const searchRoutes = require("./routes/search.routes");
const partnerRoutes = require("./routes/partner.routes");
const partnerVehiclesRoutes = require("./routes/partnerVehicles");
const partnerTripsRoutes = require("./routes/partnerTrips");
const walletRoutes = require('./routes/wallet.routes');
const ticketRoutes = require('./routes/ticket.routes');
const refundRoutes = require('./routes/refund.routes');
const reviewRoutes = require('./routes/review.routes');
const reportRoutes = require('./routes/report.routes');
const companyReviewRoutes = require('./routes/companyReview.routes');
const adminRouteRoutes = require('./routes/adminRoute.routes');
const adminTripRoutes = require('./routes/adminTrip.routes');
const adminSeatRoutes = require('./routes/adminSeat.routes');
const adminPromotionRoutes = require('./routes/adminPromotion.routes');
const vehicleRoutes = require('./routes/vehicle.routes');



const app = express();
const PORT = process.env.PORT || 5000;

// ==================== MIDDLEWARE ====================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================
app.use("/api/trips", tripRoutes);
app.use("/api/auth", authRoutes2);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", searchRoutes);
app.use("/api/partner", partnerRoutes);
app.use("/api/partner", partnerVehiclesRoutes);
app.use("/api/partner", partnerTripsRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/company-reviews', companyReviewRoutes);
app.use('/api/admin', adminRouteRoutes);
app.use('/api/admin', adminTripRoutes);
app.use('/api/admin', adminSeatRoutes);
app.use('/api/admin', adminPromotionRoutes);
app.use('/api/vehicles', vehicleRoutes);



// ==================== TEST ROUTES ====================
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API OK 🚀",
    timestamp: new Date().toISOString()
  });
});

app.get("/api/test-db", async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT @@VERSION AS version");
    res.json({
      success: true,
      message: "Kết nối database thành công",
      version: result.recordset[0].version,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error("DB Test Error:", err);
    res.status(500).json({
      success: false,
      message: "Kết nối database thất bại",
      error: err.message
    });
  }
});

// ==================== ROOT ROUTE ====================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running 🚀",
    endpoints: {
      test: "/api/test",
      testDb: "/api/test-db",
      auth: "/api/auth",
      users: "/api/users",
      trips: "/api/trips",
      admin: "/api/admin",
      partner: "/api/partner",
      wallet: "/api/wallet"
    }
  });
});

// ==================== 404 HANDLER (ĐÃ SỬA) ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route không tồn tại",
    path: req.originalUrl,
    method: req.method
  });
});

// ==================== ERROR HANDLING MIDDLEWARE ====================
app.use((err, req, res, next) => {
  console.error("Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Lỗi server nội bộ",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ==================== START SERVER ====================
const startServer = async () => {
  try {
    await poolPromise;
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`📍 Test API: http://localhost:${PORT}/api/test`);
      console.log(`📍 Test DB: http://localhost:${PORT}/api/test-db`);
      console.log(`📍 Trips API: http://localhost:${PORT}/api/trips`);
      console.log(`📍 Wallet API: http://localhost:${PORT}/api/wallet`);
    });
  } catch (err) {
    console.error("❌ Database connection failed:", err.message);
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT} (without database)`);
      console.log("⚠️  Database connection failed - some features may not work");
    });
  }
};

startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('🛑 Server shutting down...');
  process.exit(0);
});

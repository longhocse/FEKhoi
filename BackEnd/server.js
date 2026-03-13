require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { poolPromise } = require("./config/db");

const authRoutes = require("./routes/authRoutes");



require("./config/db");

const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express(); // ✅ TẠO APP TRƯỚC
const tripRoutes = require("./routes/trip.routes");
const searchRoutes = require("./routes/search.routes");

const PORT = 5000;

app.use(cors());
app.use(express.json());


// gọi routes
app.use("/api/trips", tripRoutes);
app.use("/api/auth", authRoutes);


app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", searchRoutes);


// API test kết nối DB
app.get("/api/test-db", async (req, res) => {
  try {
    const { getPool } = require("./config/db");
    const pool = getPool();

    if (!pool) {
      return res.status(500).json({
        error: "Chưa kết nối được database",
        message: "Kiểm tra lại cấu hình SQL Server"
      });
    }

    const result = await pool.request().query("SELECT @@VERSION AS version");
    res.json({
      success: true,
      message: "Kết nối database thành công",
      version: result.recordset[0].version
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/api/test", (req, res) => {
  res.json({ message: "API OK 🚀" });
});


const partnerRoutes = require("./routes/partner.routes");
const partnerVehiclesRoutes = require("./routes/partnerVehicles");

app.use("/api/partner", partnerRoutes);
app.use("/api/partner", partnerVehiclesRoutes);

const partnerTripsRoutes = require("./routes/partnerTrips");
app.use("/api/partner", partnerTripsRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

poolPromise
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("❌ Cannot start server because DB connection failed:", err);
  });
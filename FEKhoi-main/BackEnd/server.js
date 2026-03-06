const express = require("express");
const cors = require("cors");

require("./config/db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express(); // ✅ TẠO APP TRƯỚC
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use("/api", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes); // ✅ đặt sau khi tạo app

app.get("/", (req, res) => {
    res.send("Backend is running 🚀");
});

app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}`);
});
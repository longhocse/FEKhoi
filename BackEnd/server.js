require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");

const authRoutes2 = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");



require("./config/db");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const adminRoutes = require("./routes/admin.routes");

const app = express(); // ✅ TẠO APP TRƯỚC
const PORT = 5000;

app.use(cors());
app.use(express.json());


// gọi routes
app.use("/api/trips", tripRoutes);
app.use("/api/auth", authRoutes2);

app.listen(5000, () => {
    console.log("Server running on port 5000");
    app.use("/api", authRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/admin", adminRoutes); // ✅ đặt sau khi tạo app

    app.get("/", (req, res) => {
        res.send("Backend is running 🚀");
    });


});
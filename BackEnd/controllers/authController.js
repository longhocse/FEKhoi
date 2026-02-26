const userModel = require("../models/userModel");

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Thiếu email hoặc mật khẩu" });
        }

        const user = await userModel.findByEmail(email);

        if (!user || user.password !== password) {
            return res.status(400).json({ message: "Sai tài khoản hoặc mật khẩu" });
        }

        res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);
        res.status(500).json({ message: "Lỗi server" });
    }
};


/* ================= REGISTER ================= */
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        const existingUser = await userModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: "Email đã tồn tại" });
        }

        // ✅ Default role
        let finalRole = "customer";

        // ✅ Cho phép partner nhưng không cho phép admin
        if (role === "partner") {
            finalRole = "partner";
        }

        await userModel.createUser({
            name,
            email,
            phoneNumber: phone,
            password,
            role: finalRole
        });

        res.status(201).json({ message: "Đăng ký thành công" });

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        res.status(500).json({ message: error.message });
    }
};


/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
    try {
        const { id, name, phone } = req.body;

        const updatedData = {};

        if (name && name.trim() !== "") {
            updatedData.name = name;
        }

        if (phone && phone.trim() !== "") {
            updatedData.phoneNumber = phone; // 🔥 map đúng sang DB
        }

        if (Object.keys(updatedData).length === 0) {
            return res.status(400).json({ message: "Không có dữ liệu để cập nhật" });
        }

        await userModel.updateUser(id, updatedData);

        res.json({ message: "Cập nhật thành công" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


/* ================= CHANGE PASSWORD ================= */
exports.changePassword = async (req, res) => {
    try {
        const { id, currentPassword, newPassword } = req.body;

        if (!id || !currentPassword || !newPassword) {
            return res.status(400).json({ message: "Thiếu dữ liệu" });
        }

        await userModel.changePassword(id, currentPassword, newPassword);

        res.json({ message: "Đổi mật khẩu thành công" });

    } catch (error) {
        console.error("CHANGE PASSWORD ERROR:", error);
        res.status(400).json({ message: error.message });
    }
};
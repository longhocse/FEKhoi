const { sql } = require("../config/db");

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const request = new sql.Request();
        request.input("email", sql.NVarChar, email);

        const result = await request.query(`
            SELECT id, name, email, password, role, isActive
            FROM Users
            WHERE email = @email
        `);

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: "Email không tồn tại" });
        }

        const user = result.recordset[0];

        if (user.password !== password) {
            return res.status(401).json({ message: "Sai mật khẩu" });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: "Tài khoản đã bị khóa" });
        }

        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
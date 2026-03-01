const { sql } = require("../config/db");

/* ================= GET ALL USERS ================= */
exports.getUsers = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT id, name, email, role, isActive, createdAt
            FROM Users
            ORDER BY id DESC
        `;
        res.json(result.recordset);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= GET USER BY ID ================= */
exports.getUserById = async (req, res) => {
    try {
        const result = await sql.query`
            SELECT * FROM Users WHERE id = ${req.params.id}
        `;

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json(result.recordset[0]);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= CREATE USER ================= */
exports.createUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        await sql.query`
            INSERT INTO Users (name, email, password, role, isActive)
            VALUES (${name}, ${email}, ${password}, ${role}, 1)
        `;

        res.status(201).json({ message: "User created successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= UPDATE USER ================= */
exports.updateUser = async (req, res) => {
    const { name, email, role } = req.body;

    try {
        await sql.query`
            UPDATE Users
            SET name = ${name},
                email = ${email},
                role = ${role},
                updatedAt = GETDATE()
            WHERE id = ${req.params.id}
        `;

        res.json({ message: "User updated successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= DELETE USER ================= */
exports.deleteUser = async (req, res) => {
    try {
        await sql.query`
            DELETE FROM Users WHERE id = ${req.params.id}
        `;
        res.json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/* ================= TOGGLE ACTIVE ================= */
exports.toggleUserStatus = async (req, res) => {
    try {
        await sql.query`
            UPDATE Users
            SET isActive = CASE WHEN isActive = 1 THEN 0 ELSE 1 END,
                updatedAt = GETDATE()
            WHERE id = ${req.params.id}
        `;

        res.json({ message: "User status updated" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
const express = require("express");
const router = express.Router();
const sql = require("mssql");
const { verifyToken } = require("../middleware/auth");


// Lấy thông tin partner
router.get("/", verifyToken, async (req, res) => {
  try {
    const result = await sql.query`
      SELECT id, name, email, phoneNumber, companyAddress
      FROM Users
      WHERE id = ${req.user.id}
    `;

    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Cập nhật thông tin
router.put("/", verifyToken, async (req, res) => {
  try {
    const { name, phoneNumber, companyAddress } = req.body;

    await sql.query`
      UPDATE Users
      SET name = ${name},
          phoneNumber = ${phoneNumber},
          companyAddress = ${companyAddress}
      WHERE id = ${req.user.id}
    `;

    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
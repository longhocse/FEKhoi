const express = require("express");
const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  toggleUserStatus
} = require("../controllers/user.controller");

/* ================= ROUTES ================= */

router.get("/", getUsers);                // GET ALL
router.get("/:id", getUserById);          // GET BY ID
router.post("/", createUser);             // CREATE
router.put("/:id", updateUser);           // UPDATE
router.delete("/:id", deleteUser);        // DELETE
router.patch("/:id/toggle", toggleUserStatus); // LOCK / UNLOCK
const sql = require("mssql");
const { poolPromise } = require("../config/db");

module.exports = router;
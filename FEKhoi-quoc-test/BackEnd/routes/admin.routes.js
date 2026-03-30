// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { sql, poolPromise } = require('../config/db');

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Users
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);
router.get("/recent-users", async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
      SELECT TOP 5 
        id,
        name,
        email,
        role,
        createdAt
      FROM Users
      ORDER BY createdAt DESC
    `);

        res.json({
            success: true,
            data: result.recordset
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});


// Companies
router.get("/companies", adminController.getCompanies);
router.get("/companies/:id", adminController.getCompanyDetail);

// Tickets
router.get("/tickets", adminController.getTickets);
router.get("/tickets/status", adminController.getTicketStats);
router.patch("/tickets/:id/status", adminController.updateTicketStatus);
router.delete("/tickets/:id", adminController.deleteTicket);
router.get("/tickets-raw", adminController.getTicketsRaw);
router.get("/upcoming-trips", adminController.getUpcomingTrips);

module.exports = router;
// routes/admin.routes.js
const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");

// Dashboard
router.get("/dashboard", adminController.getDashboard);

// Users
router.get("/users", adminController.getUsers);
router.post("/users", adminController.createUser);
router.put("/users/:id", adminController.updateUser);
router.delete("/users/:id", adminController.deleteUser);

// Companies
router.get("/companies", adminController.getCompanies);
router.get("/companies/:id", adminController.getCompanyDetail);

// Tickets
router.get("/tickets", adminController.getTickets);
router.get("/tickets/status", adminController.getTicketStats);
router.patch("/tickets/:id/status", adminController.updateTicketStatus);
router.delete("/tickets/:id", adminController.deleteTicket);
router.get("/tickets-raw", adminController.getTicketsRaw);

module.exports = router;
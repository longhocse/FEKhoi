const sql = require('mssql');
const { poolPromise } = require('../config/db');

const Ticket = {
    // Lấy vé theo userId
    getByUserId: async (userId) => {
        try {
            const pool = await poolPromise;

            const result = await pool.request()
                .input('userId', sql.Int, userId)
                .query(`
                    SELECT 
                        tk.id,
                        tk.totalAmount,
                        tk.status,
                        tk.paymentMethod,
                        tk.note,
                        tk.bookedAt,
                        t.id AS tripId,
                        t.startTime,
                        t.price AS tripPrice,
                        sFrom.name AS fromStation,
                        sTo.name AS toStation,
                        v.name AS vehicleName,
                        pc.name AS companyName,
                        s.name AS seatName,
                        s.floor AS seatFloor,
                        s.type AS seatType,
                        tp.fullName AS passengerName,
                        tp.phoneNumber AS passengerPhone,
                        tp.email AS passengerEmail
                    FROM Tickets tk
                    JOIN Trips t ON tk.tripId = t.id
                    JOIN Stations sFrom ON t.fromStationId = sFrom.id
                    JOIN Stations sTo ON t.toStationId = sTo.id
                    JOIN Vehicles v ON t.vehicleId = v.id
                    JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
                    JOIN Seats s ON tk.seatId = s.id
                    LEFT JOIN TicketPassengers tp ON tk.id = tp.ticketId
                    WHERE tk.userId = @userId
                    ORDER BY tk.bookedAt DESC
                `);

            return result.recordset;
        } catch (err) {
            console.error('Lỗi Ticket.getByUserId:', err);
            throw err;
        }
    },

    // Lấy vé theo ID
    getById: async (id) => {
        try {
            const pool = await poolPromise;

            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
                    SELECT 
                        tk.*,
                        t.startTime,
                        sFrom.name AS fromStation,
                        sTo.name AS toStation,
                        v.name AS vehicleName,
                        pc.name AS companyName,
                        s.name AS seatName
                    FROM Tickets tk
                    JOIN Trips t ON tk.tripId = t.id
                    JOIN Stations sFrom ON t.fromStationId = sFrom.id
                    JOIN Stations sTo ON t.toStationId = sTo.id
                    JOIN Vehicles v ON t.vehicleId = v.id
                    JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
                    JOIN Seats s ON tk.seatId = s.id
                    WHERE tk.id = @id
                `);

            return result.recordset[0];
        } catch (err) {
            console.error('Lỗi Ticket.getById:', err);
            throw err;
        }
    }
};

module.exports = Ticket;
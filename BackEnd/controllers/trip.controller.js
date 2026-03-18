const sql = require("mssql");
const { poolPromise } = require("../config/db");

// Lấy danh sách trips
exports.getTrips = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
        SELECT 
            t.id,
            sFrom.name AS fromStation,
            sTo.name AS toStation,
            t.startTime,
            t.price,
            t.estimatedDuration,
            v.name AS vehicleName,
            (SELECT TOP 1 imageUrl 
             FROM ImageVehicles 
             WHERE vehicleId = v.id AND isPrimary = 1) AS imageUrl
        FROM Trips t
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        LEFT JOIN Vehicles v ON t.vehicleId = v.id
        ORDER BY t.startTime DESC
        `);

        res.json({
            success: true,
            data: result.recordset
        });

    } catch (err) {
        console.error("Lỗi lấy trips:", err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};


// ================= GET ALL =================
exports.getAllTrips = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
        SELECT 
            t.id,
            sFrom.name as fromStation,
            sTo.name as toStation,
            t.startTime,
            t.price,
            t.estimatedDuration,
            v.name as vehicleName,
            pc.name as companyName,
            (SELECT TOP 1 imageUrl 
             FROM ImageVehicles 
             WHERE vehicleId = v.id AND isPrimary = 1) AS imageUrl
        FROM Trips t
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        JOIN Vehicles v ON t.vehicleId = v.id
        JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
        `);

        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ================= SIMPLE LIST =================
exports.getSimpleTrips = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
      SELECT 
        t.id,
        sFrom.name as fromStation,
        sTo.name as toStation,
        t.startTime,
        t.price,
        t.estimatedDuration,
        v.name as vehicleName,
        v.type as vehicleType,
        pc.name as companyName,
        pc.logo as companyLogo,
        (SELECT COUNT(*) FROM Seats WHERE vehicleId = v.id AND status = 'AVAILABLE') as availableSeats,
        (SELECT TOP 1 imageUrl FROM ImageVehicles WHERE vehicleId = v.id AND isPrimary = 1) as image
      FROM Trips t
      JOIN Stations sFrom ON t.fromStationId = sFrom.id
      JOIN Stations sTo ON t.toStationId = sTo.id
      JOIN Vehicles v ON t.vehicleId = v.id
      JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
      WHERE t.isActive = 1
    `);

        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ================= SEARCH =================
exports.searchTrips = async (req, res) => {
    try {
        const { from, to } = req.query;
        const pool = await poolPromise;

        const result = await pool.request().query(`
        SELECT 
            t.id,
            sFrom.name as fromStation,
            sTo.name as toStation,
            t.startTime,
            t.price,
            t.estimatedDuration,
            (SELECT TOP 1 imageUrl 
             FROM ImageVehicles iv
             JOIN Vehicles v ON iv.vehicleId = v.id
             WHERE v.id = t.vehicleId AND iv.isPrimary = 1) AS imageUrl
        FROM Trips t
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        WHERE t.isActive = 1
        `);

        let filtered = result.recordset;

        if (from) {
            filtered = filtered.filter(item =>
                item.fromStation.toLowerCase().includes(from.toLowerCase())
            );
        }

        if (to) {
            filtered = filtered.filter(item =>
                item.toStation.toLowerCase().includes(to.toLowerCase())
            );
        }

        res.json({
            success: true,
            count: filtered.length,
            data: filtered
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// ================= POPULAR =================
exports.getPopularTrips = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
SELECT TOP 8
    t.id,
    s1.name AS fromStation,
    s2.name AS toStation,
    t.startTime,
    t.price,
    t.estimatedDuration,
    t.imageUrl
FROM Trips t
JOIN Stations s1 ON t.fromStationId = s1.id
JOIN Stations s2 ON t.toStationId = s2.id
WHERE t.isActive = 1
ORDER BY t.startTime
`);

        res.json(result.recordset);

    } catch (error) {
        console.error("Error fetching popular trips:", error);
        res.status(500).json({ message: "Server error" });
    }
};


// ================= TRIP DETAIL =================
exports.getTripById = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({
                success: false,
                error: "ID không hợp lệ"
            });
        }

        const pool = await poolPromise;

        const tripResult = await pool.request()
            .input("id", sql.Int, id)
            .query(`
SELECT 
  t.id,
  sFrom.name as fromStation,
  sTo.name as toStation,
  t.startTime,
  t.price,
  t.estimatedDuration,
  v.id as vehicleId,
  v.name as vehicleName,
  v.type as vehicleType,
  pc.name as companyName,
  (SELECT TOP 1 imageUrl 
   FROM ImageVehicles 
   WHERE vehicleId = v.id AND isPrimary = 1) AS imageUrl
FROM Trips t
JOIN Stations sFrom ON t.fromStationId = sFrom.id
JOIN Stations sTo ON t.toStationId = sTo.id
JOIN Vehicles v ON t.vehicleId = v.id
JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
WHERE t.id = @id AND t.isActive = 1
`);

        if (tripResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chuyến xe"
            });
        }

        const trip = tripResult.recordset[0];

        const seatsResult = await pool.request()
            .input("vehicleId", sql.Int, trip.vehicleId)
            .input("tripId", sql.Int, id)
            .query(`
        SELECT 
          s.id,
          s.name as seatName,
          s.floor,
          s.type as seatType,
          CASE 
            WHEN tk.id IS NOT NULL AND tk.status IN ('BOOKED', 'PAID') 
            THEN 'BOOKED'
            ELSE s.status
          END as status
        FROM Seats s
        LEFT JOIN Tickets tk ON s.id = tk.seatId AND tk.tripId = @tripId
        WHERE s.vehicleId = @vehicleId
        ORDER BY s.floor, s.name
      `);

        res.json({
            success: true,
            data: {
                ...trip,
                seats: seatsResult.recordset
            }
        });

    } catch (err) {
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};


exports.getTripsByPartner = async (req, res) => {
    try {
        const { partnerId } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("partnerId", sql.Int, partnerId)
            .query(`
        SELECT 
          t.id,
          sFrom.name + N' → ' + sTo.name AS routeName,
          v.name AS vehicleName,
          t.startTime,
          t.price,
          CASE 
            WHEN t.isActive = 1 THEN 'ACTIVE'
            ELSE 'INACTIVE'
          END AS status
        FROM Trips t
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        JOIN Vehicles v ON t.vehicleId = v.id
        WHERE v.partnerId = @partnerId
        ORDER BY t.startTime DESC
      `);

        res.json(result.recordset);

    } catch (err) {
        console.error("GET trips error:", err);
        res.status(500).json({ message: "Server error" });
    }
};




// ================= BOOK TICKET =================
exports.bookTicket = async (req, res) => {
    try {

        const { tripId, seatId } = req.body;
        const userId = req.user.id;

        const pool = await poolPromise;

        // lấy giá vé
        const trip = await pool.request()
            .input("tripId", sql.Int, tripId)
            .query(`
                SELECT price FROM Trips WHERE id = @tripId
            `);

        const price = trip.recordset[0].price;

        // kiểm tra ghế
        const check = await pool.request()
            .input("tripId", sql.Int, tripId)
            .input("seatId", sql.Int, seatId)
            .query(`
                SELECT * FROM Tickets
                WHERE tripId = @tripId
                AND seatId = @seatId
                AND status IN ('BOOKED','PAID')
            `);

        if (check.recordset.length > 0) {
            return res.json({
                success: false,
                message: "Ghế đã được đặt"
            });
        }

        // tạo vé mới
        await pool.request()
            .input("userId", sql.Int, userId)
            .input("tripId", sql.Int, tripId)
            .input("seatId", sql.Int, seatId)
            .input("totalAmount", sql.Decimal(10, 2), price)
            .query(`
        INSERT INTO Tickets (userId, tripId, seatId, totalAmount, status)
        VALUES (@userId, @tripId, @seatId, @totalAmount, 'BOOKED')
    `);

        res.json({
            success: true,
            message: "Đặt vé thành công"
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: "Lỗi server"
        });
    }
};
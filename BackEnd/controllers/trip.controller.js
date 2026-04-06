const sql = require("mssql");
const { poolPromise } = require("../config/db");
const { createQR } = require("../controllers/qrCode.controller");
const ticketController = require("./ticket.controller");

exports.bookMultipleTickets = async (req, res) => {
    try {
        const { tripId, seatIds, paymentMethod } = req.body;
        const userId = req.user.id;

        const pool = await poolPromise;

        // ================= GET TRIP =================
        const tripResult = await pool.request()
            .input('tripId', sql.Int, tripId)
            .query('SELECT price FROM Trips WHERE id = @tripId');

        if (tripResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy chuyến xe"
            });
        }

        const price = tripResult.recordset[0].price;
        const totalAmount = price * seatIds.length;

        let transactionId = null;
        const groupId = `GROUP_${Date.now()}_${userId}_${tripId}`;

        // ================= CHECK SEAT =================
        for (const seatId of seatIds) {
            // Kiểm tra ghế đã được đặt chưa
            const checkSeat = await pool.request()
                .input('tripId', sql.Int, tripId)
                .input('seatId', sql.Int, seatId)
                .query(`
                    SELECT id FROM Tickets 
                    WHERE tripId = @tripId AND seatId = @seatId 
                    AND status IN ('BOOKED', 'PAID')
                `);

            if (checkSeat.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Ghế ${seatId} đã được đặt`
                });
            }

            // Kiểm tra ghế đang được người khác giữ không
            const holdCheck = await pool.request()
                .input('tripId', sql.Int, tripId)
                .input('seatId', sql.Int, seatId)
                .input('userId', sql.Int, userId)           // ← Quan trọng
                .query(`
                    SELECT id FROM SeatHolds
                    WHERE tripId = @tripId 
                    AND seatId = @seatId
                    AND expiredAt > GETDATE()
                    AND userId <> @userId
                `);

            if (holdCheck.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Ghế ${seatId} đang được người khác giữ`
                });
            }
        }

        // ================= WALLET =================
        if (paymentMethod === 'WALLET') {
            const walletResult = await pool.request()
                .input('userId', sql.Int, userId)
                .query('SELECT id, balance FROM Wallets WHERE userId = @userId');

            const wallet = walletResult.recordset[0];

            if (wallet.balance < totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: "Không đủ tiền"
                });
            }

            await pool.request()
                .input('walletId', sql.Int, wallet.id)
                .input('amount', sql.Decimal(12, 2), totalAmount)
                .query(`
                    UPDATE Wallets 
                    SET balance = balance - @amount
                    WHERE id = @walletId
                `);

            const transResult = await pool.request()
                .input('walletId', sql.Int, wallet.id)
                .input('amount', sql.Decimal(12, 2), totalAmount)
                .input('type', sql.VarChar(20), 'PAYMENT')
                .input('status', sql.VarChar(20), 'SUCCESS')
                .input('description', sql.NVarChar(255), `Thanh toán ${seatIds.length} vé`)
                .query(`
                    INSERT INTO Transactions (walletId, amount, type, status, description, createdAt)
                    OUTPUT INSERTED.id
                    VALUES (@walletId, @amount, @type, @status, @description, GETDATE())
                `);

            transactionId = transResult.recordset[0].id;
        }

        // ================= CREATE TICKETS =================
        const tickets = [];

        for (const seatId of seatIds) {

            const insertResult = await pool.request()
                .input('userId', sql.Int, userId)
                .input('tripId', sql.Int, tripId)
                .input('seatId', sql.Int, seatId)
                .input('totalAmount', sql.Decimal(10, 2), price)
                .input('paymentMethod', sql.VarChar(20), paymentMethod)
                .input('transactionId', sql.Int, transactionId)
                .input('groupId', sql.NVarChar(100), groupId)
                .input('status', sql.VarChar(20), paymentMethod === 'WALLET' ? 'PAID' : 'BOOKED')
                .query(`
                    INSERT INTO Tickets 
                    (userId, tripId, seatId, totalAmount, paymentMethod, transactionId, groupId, status, bookedAt)
                    OUTPUT INSERTED.id
                    VALUES (@userId, @tripId, @seatId, @totalAmount, @paymentMethod, @transactionId, @groupId, @status, GETDATE())
                `);

            const ticketId = insertResult.recordset[0].id;

            const BASE_URL = process.env.BASE_URL;

            const verifyUrl = `${BASE_URL}/ticket/qrTicketPage/${ticketId}`;

            const qr = await createQR({
                ticketId,
                verifyUrl
            });

            await pool.request()
                .input('qr', sql.NVarChar(sql.MAX), qr)
                .input('id', sql.Int, ticketId)
                .query(`
        UPDATE Tickets 
        SET qrCode = @qr 
        WHERE id = @id
    `);

            await ticketController.sendTicketConfirmation(ticketId);
            
            tickets.push({
                ticketId,
                seatId,
                qrCode: qr
            });
        }

        res.json({
            success: true,
            data: {
                tickets,
                totalAmount,
                groupId
            }
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};






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
        WHERE t.isActive = 1
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
        WHERE t.isActive = 1
        ORDER BY t.startTime DESC
        `);

        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });

    } catch (err) {
        console.error("Lỗi getAllTrips:", err);
        res.status(500).json({
            success: false,
            error: err.message
        });
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


// ================= POPULAR =================
exports.getPopularTrips = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
            WITH TopTrips AS (
                SELECT TOP 8 *
                FROM Trips
                WHERE isActive = 1
                  AND startTime > GETUTCDATE()
                ORDER BY startTime ASC
            )

            SELECT 
                t.id,
                s1.name AS fromStation,
                s2.name AS toStation,
                t.startTime,
                t.price,
                t.estimatedDuration,
                t.imageUrl,

                v.name AS vehicleName,         -- ✅ tên xe
                u.name AS createdBy,           -- ✅ user tạo (partner)

                sv.name AS serviceName

            FROM TopTrips t
            JOIN Stations s1 ON t.fromStationId = s1.id
            JOIN Stations s2 ON t.toStationId = s2.id

            LEFT JOIN Vehicles v ON t.vehicleId = v.id
            LEFT JOIN Users u ON v.partnerId = u.id   -- 🔥 quan trọng

            LEFT JOIN VehicleServices vs ON v.id = vs.vehicleId
            LEFT JOIN Services sv ON vs.serviceId = sv.id

            ORDER BY t.startTime ASC
        `);

        const tripsMap = {};

        result.recordset.forEach(row => {
            if (!tripsMap[row.id]) {
                tripsMap[row.id] = {
                    id: row.id,
                    fromStation: row.fromStation,
                    toStation: row.toStation,
                    startTime: row.startTime,
                    price: row.price,
                    estimatedDuration: row.estimatedDuration,
                    imageUrl: row.imageUrl,

                    vehicleName: row.vehicleName,   // ✅ thêm
                    createdBy: row.createdBy,       // ✅ thêm

                    services: []
                };
            }

            if (row.serviceName) {
                tripsMap[row.id].services.push({
                    name: row.serviceName
                });
            }
        });

        res.json(Object.values(tripsMap));

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

        // ✅ LẤY TRIP + SERVICES
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

    u.id as companyId,
    u.name as companyName,
    u.phoneNumber as companyPhone,
    u.companyAddress as companyAddress,
    u.avatar as companyLogo,

    u.id as userId,
    u.name as createdBy,
    u.phoneNumber as userPhone,
    u.avatar as userAvatar,

    (SELECT TOP 1 imageUrl 
     FROM ImageVehicles 
     WHERE vehicleId = v.id AND isPrimary = 1) AS imageUrl,

    STRING_AGG(sv.name, ',') as services

FROM Trips t
JOIN Stations sFrom ON t.fromStationId = sFrom.id
JOIN Stations sTo ON t.toStationId = sTo.id
JOIN Vehicles v ON t.vehicleId = v.id
JOIN Users u ON v.partnerId = u.id

LEFT JOIN VehicleServices vs ON v.id = vs.vehicleId
LEFT JOIN Services sv ON vs.serviceId = sv.id

WHERE t.id = @id AND t.isActive = 1

GROUP BY 
    t.id,
    sFrom.name,
    sTo.name,
    t.startTime,
    t.price,
    t.estimatedDuration,
    v.id,
    v.name,
    v.type,
    u.id,
    u.name,
    u.phoneNumber,
    u.companyAddress,
    u.avatar
            `);

        if (tripResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                error: "Không tìm thấy chuyến xe"
            });
        }

        const trip = tripResult.recordset[0];
        trip.services = trip.services ? trip.services.split(',') : [];

        trip.user = {
            id: trip.userId,
            name: trip.createdBy,
            phone: trip.userPhone,
            avatar: trip.userAvatar
        };
        // ================= SEATS =================
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
    WHEN tk.id IS NOT NULL AND tk.status IN ('BOOKED','PAID') 
        THEN 'BOOKED'

    WHEN sh.id IS NOT NULL AND sh.expiredAt > GETDATE()
        THEN 'HOLDING'

    ELSE s.status
  END as status
FROM Seats s
LEFT JOIN Tickets tk 
  ON s.id = tk.seatId AND tk.tripId = @tripId
LEFT JOIN SeatHolds sh
  ON s.id = sh.seatId 
  AND sh.tripId = @tripId
  AND sh.expiredAt > GETDATE()
WHERE s.vehicleId = @vehicleId
ORDER BY s.floor, s.name
        `);

        // ================= TIME POINTS =================
        const pointsResult = await pool.request()
            .input("tripId", sql.Int, id)
            .query(`
        SELECT 
            tp.id,
            p.address as stopPoint,
            tp.arrivalTime,
            tp.departureTime,
            tp.stopDuration
        FROM TimePoints tp
        JOIN Points p ON tp.pointId = p.id
        WHERE tp.tripId = @tripId
        ORDER BY tp.arrivalTime
        `);

        res.json({
            success: true,
            data: {
                ...trip,
                seats: seatsResult.recordset,
                timePoints: pointsResult.recordset
            }
        });

    } catch (err) {
        console.error("Lỗi getTripById:", err);
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

        const { tripId, seatId, paymentMethod } = req.body;
        const userId = req.user.id;

        const pool = await poolPromise;

        // Kiểm tra ghế đã được đặt chưa
        const checkSeat = await pool.request()
            .input('tripId', sql.Int, tripId)
            .input('seatId', sql.Int, seatId)
            .query(`
                SELECT id FROM Tickets 
                WHERE tripId = @tripId AND seatId = @seatId 
                AND status IN ('BOOKED', 'PAID')
            `);

        if (checkSeat.recordset.length > 0) {
            return res.status(400).json({
                success: false,
                message: "Ghế đã được đặt"
            });
        }

        // Lấy giá vé
        const tripResult = await pool.request()
            .input('tripId', sql.Int, tripId)
            .query('SELECT price FROM Trips WHERE id = @tripId');

        if (tripResult.recordset.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy chuyến xe"
            });
        }

        const price = tripResult.recordset[0].price;
        let transactionId = null;

        // Nếu thanh toán bằng ví, trừ tiền
        if (paymentMethod === 'WALLET') {
            // Lấy thông tin ví
            const walletResult = await pool.request()
                .input('userId', sql.Int, userId)
                .query('SELECT id, balance FROM Wallets WHERE userId = @userId');

            if (walletResult.recordset.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "Không tìm thấy ví"
                });
            }

            const wallet = walletResult.recordset[0];

            if (wallet.balance < price) {
                return res.status(400).json({
                    success: false,
                    message: "Số dư không đủ"
                });
            }

            // Trừ tiền trong ví
            await pool.request()
                .input('walletId', sql.Int, wallet.id)
                .input('amount', sql.Decimal(10, 2), price)
                .query(`
                    UPDATE Wallets 
                    SET balance = balance - @amount 
                    WHERE id = @walletId
                `);

            // Tạo giao dịch
            const transResult = await pool.request()
                .input('walletId', sql.Int, wallet.id)
                .input('amount', sql.Decimal(10, 2), price)
                .input('type', sql.VarChar(20), 'PAYMENT')
                .input('status', sql.VarChar(20), 'SUCCESS')
                .input('description', sql.NVarChar(255), `Thanh toán vé chuyến xe #${tripId}`)
                .query(`
                    INSERT INTO Transactions (walletId, amount, type, status, description, createdAt)
                    OUTPUT INSERTED.id
                    VALUES (@walletId, @amount, @type, @status, @description, GETDATE())
                `);

            transactionId = transResult.recordset[0].id;
        }

        // Tạo vé
        // Tạo vé + lấy ID luôn
        const ticketResult = await pool.request()
            .input('userId', sql.Int, userId)
            .input('tripId', sql.Int, tripId)
            .input('seatId', sql.Int, seatId)
            .input('totalAmount', sql.Decimal(10, 2), price)
            .input('paymentMethod', sql.VarChar(20), paymentMethod)
            .input('transactionId', sql.Int, transactionId)
            .input('status', sql.VarChar(20), paymentMethod === 'WALLET' ? 'PAID' : 'BOOKED')
            .query(`
        INSERT INTO Tickets (userId, tripId, seatId, totalAmount, paymentMethod, transactionId, status, bookedAt)
        OUTPUT INSERTED.id, INSERTED.tripId, INSERTED.seatId
        VALUES (@userId, @tripId, @seatId, @totalAmount, @paymentMethod, @transactionId, @status, GETDATE())
    `);

        const ticket = ticketResult.recordset[0];

        // Nếu đã thanh toán thì tạo QR
        if (paymentMethod === 'WALLET') {
            const qr = await createQR(ticket);

            await pool.request()
                .input('qr', sql.NVarChar(sql.MAX), qr)
                .input('id', sql.Int, ticket.id)
                .query(`
            UPDATE Tickets 
            SET qrCode = @qr 
            WHERE id = @id
        `);
        }

        res.json({
            success: true,
            message: paymentMethod === 'WALLET'
                ? 'Đặt vé và thanh toán thành công'
                : 'Đặt vé thành công',
            ticketId: ticket.id
        });

    } catch (err) {
        console.error('Lỗi đặt vé:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};


exports.checkIn = async (req, res) => {
    const { ticketId } = req.body;
    const pool = await poolPromise;

    const result = await pool.request()
        .input('id', sql.Int, ticketId)
        .query(`SELECT * FROM Tickets WHERE id = @id`);

    const ticket = result.recordset[0];

    if (!ticket) return res.json({ message: "Không tồn tại" });

    if (ticket.status !== "PAID")
        return res.json({ message: "Chưa thanh toán" });

    if (ticket.isCheckedIn)
        return res.json({ message: "Đã dùng" });

    await pool.request()
        .input('id', sql.Int, ticketId)
        .query(`
            UPDATE Tickets 
            SET isCheckedIn = 1, status = 'USED'
            WHERE id = @id
        `);

    res.json({ message: "Check-in thành công" });
};



exports.holdSeats = async (req, res) => {
    try {
        const { tripId, seatIds } = req.body;
        const userId = req.user.id;

        const pool = await poolPromise;
        const expireMinutes = 1;

        for (const seatId of seatIds) {

            // Check BOOKED
            const booked = await pool.request()
                .input("tripId", sql.Int, tripId)
                .input("seatId", sql.Int, seatId)
                .query(`
                    SELECT id FROM Tickets
                    WHERE tripId = @tripId 
                    AND seatId = @seatId
                    AND status IN ('BOOKED','PAID')
                `);

            if (booked.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Ghế ${seatId} đã được đặt`
                });
            }

            // Check HOLD
            const hold = await pool.request()
                .input("tripId", sql.Int, tripId)
                .input("seatId", sql.Int, seatId)
                .query(`
                    SELECT id FROM SeatHolds
                    WHERE tripId = @tripId 
                    AND seatId = @seatId
                    AND expiredAt > GETDATE()
                `);

            if (hold.recordset.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Ghế ${seatId} đang được giữ`
                });
            }

            // Insert HOLD
            await pool.request()
                .input("seatId", sql.Int, seatId)
                .input("tripId", sql.Int, tripId)
                .input("userId", sql.Int, userId)
                .query(`
                    INSERT INTO SeatHolds (seatId, tripId, userId, expiredAt)
                    VALUES (
                        @seatId,
                        @tripId,
                        @userId,
                        DATEADD(MINUTE, ${expireMinutes}, GETDATE())
                    )
                `);
        }

        res.json({
            success: true,
            message: "Giữ ghế thành công (1 phút)"
        });

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
const sql = require("mssql");
const { poolPromise } = require("../config/db");


exports.bookMultipleTickets = async (req, res) => {
    try {
        const { tripId, seatIds, paymentMethod } = req.body;
        const userId = req.user.id;

        console.log(`📌 bookMultipleTickets - tripId: ${tripId}, seatIds: ${seatIds}, userId: ${userId}`);

        if (!seatIds || seatIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Vui lòng chọn ít nhất 1 ghế"
            });
        }

        const pool = await poolPromise;

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
        const totalAmount = price * seatIds.length;
        let transactionId = null;
        let groupTransactionId = null;

        // Tạo ID nhóm duy nhất cho đợt mua này
        groupTransactionId = `GROUP_${Date.now()}_${userId}_${tripId}`;

        // Kiểm tra từng ghế có bị trùng không
        for (const seatId of seatIds) {
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
        }

        // Nếu thanh toán bằng ví, trừ tiền 1 lần cho tổng số vé
        if (paymentMethod === 'WALLET') {
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

            if (wallet.balance < totalAmount) {
                return res.status(400).json({
                    success: false,
                    message: `Số dư không đủ. Cần ${totalAmount.toLocaleString()}đ, hiện có ${wallet.balance.toLocaleString()}đ`
                });
            }

            // Trừ tiền trong ví 1 lần
            await pool.request()
                .input('walletId', sql.Int, wallet.id)
                .input('amount', sql.Decimal(12, 2), totalAmount)
                .query(`
                    UPDATE Wallets 
                    SET balance = balance - @amount, updatedAt = GETDATE()
                    WHERE id = @walletId
                `);

            // Tạo 1 giao dịch duy nhất cho cả đợt
            const transResult = await pool.request()
                .input('walletId', sql.Int, wallet.id)
                .input('amount', sql.Decimal(12, 2), totalAmount)
                .input('type', sql.VarChar(20), 'PAYMENT')
                .input('status', sql.VarChar(20), 'SUCCESS')
                .input('description', sql.NVarChar(255), `Thanh toán ${seatIds.length} vé chuyến xe #${tripId}`)
                .query(`
                    INSERT INTO Transactions (walletId, amount, type, status, description, createdAt)
                    OUTPUT INSERTED.id
                    VALUES (@walletId, @amount, @type, @status, @description, GETDATE())
                `);

            transactionId = transResult.recordset[0].id;
        }

        // Tạo vé cho từng ghế - TẤT CẢ DÙNG CHUNG transactionId
        const ticketIds = [];
        const bookedAt = new Date();

        for (const seatId of seatIds) {
            const ticketResult = await pool.request()
                .input('userId', sql.Int, userId)
                .input('tripId', sql.Int, tripId)
                .input('seatId', sql.Int, seatId)
                .input('totalAmount', sql.Decimal(10, 2), price)
                .input('paymentMethod', sql.VarChar(20), paymentMethod)
                .input('transactionId', sql.Int, transactionId)
                .input('groupId', sql.NVarChar(100), groupTransactionId)
                .input('status', sql.VarChar(20), paymentMethod === 'WALLET' ? 'PAID' : 'BOOKED')
                .input('bookedAt', sql.DateTime, bookedAt)
                .query(`
                    INSERT INTO Tickets (userId, tripId, seatId, totalAmount, paymentMethod, transactionId, groupId, status, bookedAt)
                    OUTPUT INSERTED.id
                    VALUES (@userId, @tripId, @seatId, @totalAmount, @paymentMethod, @transactionId, @groupId, @status, @bookedAt)
                `);

            ticketIds.push(ticketResult.recordset[0].id);


        }

        res.json({
            success: true,
            message: paymentMethod === 'WALLET'
                ? `Đặt thành công ${seatIds.length} vé và thanh toán ${totalAmount.toLocaleString()}đ từ ví`
                : `Đặt thành công ${seatIds.length} vé`,
            data: {
                ticketIds,
                quantity: seatIds.length,
                totalAmount,
                groupId: groupTransactionId,
                bookedAt: bookedAt
            }
        });

    } catch (err) {
        console.error('❌ Lỗi đặt nhiều vé:', err);
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

            pc.id as companyId,
            pc.name as companyName,
            pc.phone as companyPhone,
            pc.address as companyAddress,
            pc.logo as companyLogo,

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
            JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
            JOIN Users u ON v.partnerId = u.id   -- ✅ lấy user tạo chuyến

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
            pc.id,
            pc.name,
            pc.phone,
            pc.address,
            pc.logo,
            u.id,
            u.name,
            u.phoneNumber,
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
            WHEN tk.id IS NOT NULL AND tk.status IN ('BOOKED', 'PAID') 
            THEN 'BOOKED'
            ELSE s.status
          END as status
        FROM Seats s
        LEFT JOIN Tickets tk 
          ON s.id = tk.seatId AND tk.tripId = @tripId
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
        await pool.request()
            .input('userId', sql.Int, userId)
            .input('tripId', sql.Int, tripId)
            .input('seatId', sql.Int, seatId)
            .input('totalAmount', sql.Decimal(10, 2), price)
            .input('paymentMethod', sql.VarChar(20), paymentMethod)
            .input('transactionId', sql.Int, transactionId)
            .input('status', sql.VarChar(20), paymentMethod === 'WALLET' ? 'PAID' : 'BOOKED')
            .query(`
                INSERT INTO Tickets (userId, tripId, seatId, totalAmount, paymentMethod, transactionId, status, bookedAt)
                VALUES (@userId, @tripId, @seatId, @totalAmount, @paymentMethod, @transactionId, @status, GETDATE())
            `);

        res.json({
            success: true,
            message: paymentMethod === 'WALLET' ? 'Đặt vé và thanh toán thành công' : 'Đặt vé thành công'
        });

    } catch (err) {
        console.error('Lỗi đặt vé:', err);
        res.status(500).json({
            success: false,
            message: err.message
        });
    }
};
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
        ORDER BY t.startTime DESC
        `);

        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });

    } catch (err) {
        console.error("Lỗi getSimpleTrips:", err);
        res.status(500).json({
            success: false,
            error: err.message
        });
    }
};

// ================= SEARCH =================
exports.searchTrips = async (req, res) => {
    try {
        const { from, to, date } = req.query;
        const pool = await poolPromise;

        let query = `
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
            (SELECT TOP 1 imageUrl 
             FROM ImageVehicles iv
             WHERE iv.vehicleId = v.id AND iv.isPrimary = 1) AS imageUrl
        FROM Trips t
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        JOIN Vehicles v ON t.vehicleId = v.id
        JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
        WHERE t.isActive = 1
        `;

        const request = pool.request();

        if (from) {
            query += ` AND sFrom.name LIKE @from`;
            request.input('from', sql.NVarChar, `%${from}%`);
        }

        if (to) {
            query += ` AND sTo.name LIKE @to`;
            request.input('to', sql.NVarChar, `%${to}%`);
        }

        if (date) {
            query += ` AND CAST(t.startTime AS DATE) = @date`;
            request.input('date', sql.Date, date);
        }

        query += ` ORDER BY t.startTime`;

        const result = await request.query(query);

        res.json({
            success: true,
            count: result.recordset.length,
            data: result.recordset
        });

    } catch (err) {
        console.error("Lỗi searchTrips:", err);
        res.status(500).json({
            success: false,
            error: err.message
        });
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
            v.name as vehicleName,
            (SELECT TOP 1 imageUrl 
             FROM ImageVehicles 
             WHERE vehicleId = v.id AND isPrimary = 1) AS imageUrl
        FROM Trips t
        JOIN Stations s1 ON t.fromStationId = s1.id
        JOIN Stations s2 ON t.toStationId = s2.id
        JOIN Vehicles v ON t.vehicleId = v.id
        WHERE t.isActive = 1
        ORDER BY t.startTime
        `);

        res.json({
            success: true,
            data: result.recordset
        });

    } catch (error) {
        console.error("Error fetching popular trips:", error);
        res.status(500).json({
            success: false,
            message: "Server error"
        });
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
            sFrom.address as fromAddress,
            sTo.name as toStation,
            sTo.address as toAddress,
            t.startTime,
            t.price,
            t.estimatedDuration,
            v.id as vehicleId,
            v.name as vehicleName,
            v.type as vehicleType,
            v.description as vehicleDescription,
            v.numberOfFloors,
            pc.name as companyName,
            pc.phone as companyPhone,
            pc.address as companyAddress,
            pc.logo as companyLogo,
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

        // Lấy danh sách ghế
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

        // Lấy điểm dừng
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

// ================= BOOK TICKET - KHÔNG DÙNG TRANSACTION =================
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

        // Cập nhật trạng thái ghế
        await pool.request()
            .input('seatId', sql.Int, seatId)
            .query(`UPDATE Seats SET status = 'BOOKED' WHERE id = @seatId`);

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
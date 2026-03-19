const sql = require('mssql');
const { getPool } = require('../config/db');

const Trip = {
    // Lấy tất cả chuyến xe
    getAll: async (filters = {}) => {
        try {
            const pool = getPool();
            let query = `
        SELECT 
          t.id,
          t.startTime,
          t.price,
          t.estimatedDuration,
          t.imageUrl,
          t.isActive,
          t.createdAt,
          sFrom.name AS fromStation,
          sFrom.address AS fromAddress,
          sFrom.province AS fromProvince,
          sTo.name AS toStation,
          sTo.address AS toAddress,
          sTo.province AS toProvince,
          v.id AS vehicleId,
          v.name AS vehicleName,
          v.type AS vehicleType,
          v.numberOfFloors,
          v.licensePlate,
          pc.id AS companyId,
          pc.name AS companyName,
          pc.phone AS companyPhone,
          pc.logo AS companyLogo,
          (SELECT COUNT(*) FROM Seats WHERE vehicleId = v.id AND status = 'AVAILABLE') AS availableSeats
        FROM Trips t
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        JOIN Vehicles v ON t.vehicleId = v.id
        JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
        WHERE 1=1
      `;

            const request = pool.request();

            if (filters.fromStationId) {
                query += ' AND t.fromStationId = @fromStationId';
                request.input('fromStationId', sql.Int, filters.fromStationId);
            }

            if (filters.toStationId) {
                query += ' AND t.toStationId = @toStationId';
                request.input('toStationId', sql.Int, filters.toStationId);
            }

            if (filters.fromDate) {
                query += ' AND CAST(t.startTime AS DATE) >= @fromDate';
                request.input('fromDate', sql.Date, filters.fromDate);
            }

            if (filters.toDate) {
                query += ' AND CAST(t.startTime AS DATE) <= @toDate';
                request.input('toDate', sql.Date, filters.toDate);
            }

            if (filters.minPrice) {
                query += ' AND t.price >= @minPrice';
                request.input('minPrice', sql.Decimal(10, 2), filters.minPrice);
            }

            if (filters.maxPrice) {
                query += ' AND t.price <= @maxPrice';
                request.input('maxPrice', sql.Decimal(10, 2), filters.maxPrice);
            }

            if (filters.isActive !== undefined) {
                query += ' AND t.isActive = @isActive';
                request.input('isActive', sql.Bit, filters.isActive);
            }

            if (filters.companyId) {
                query += ' AND pc.id = @companyId';
                request.input('companyId', sql.Int, filters.companyId);
            }

            query += ' ORDER BY t.startTime';

            if (filters.limit) {
                query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
                request.input('offset', sql.Int, filters.offset || 0);
                request.input('limit', sql.Int, filters.limit);
            }

            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Lấy chuyến xe theo ID
    getById: async (id) => {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
          SELECT 
            t.id,
            t.startTime,
            t.price,
            t.estimatedDuration,
            t.imageUrl,
            t.isActive,
            t.createdAt,
            sFrom.id AS fromStationId,
            sFrom.name AS fromStation,
            sFrom.address AS fromAddress,
            sFrom.province AS fromProvince,
            sTo.id AS toStationId,
            sTo.name AS toStation,
            sTo.address AS toAddress,
            sTo.province AS toProvince,
            v.id AS vehicleId,
            v.name AS vehicleName,
            v.description AS vehicleDescription,
            v.type AS vehicleType,
            v.numberOfFloors,
            v.licensePlate,
            pc.id AS companyId,
            pc.name AS companyName,
            pc.phone AS companyPhone,
            pc.email AS companyEmail,
            pc.address AS companyAddress,
            pc.logo AS companyLogo,
            (SELECT COUNT(*) FROM Seats WHERE vehicleId = v.id) AS totalSeats,
            (SELECT COUNT(*) FROM Seats WHERE vehicleId = v.id AND status = 'AVAILABLE') AS availableSeats
          FROM Trips t
          JOIN Stations sFrom ON t.fromStationId = sFrom.id
          JOIN Stations sTo ON t.toStationId = sTo.id
          JOIN Vehicles v ON t.vehicleId = v.id
          JOIN PassengerCarCompanies pc ON v.partnerId = pc.id
          WHERE t.id = @id
        `);

            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Lấy chuyến xe của partner
    getByPartnerId: async (partnerId, filters = {}) => {
        try {
            const pool = getPool();
            let query = `
        SELECT 
          t.id,
          t.startTime,
          t.price,
          t.estimatedDuration,
          t.imageUrl,
          t.isActive,
          t.createdAt,
          sFrom.name AS fromStation,
          sTo.name AS toStation,
          v.name AS vehicleName,
          v.licensePlate,
          (SELECT COUNT(*) FROM Tickets WHERE tripId = t.id) AS totalBookings
        FROM Trips t
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        JOIN Vehicles v ON t.vehicleId = v.id
        WHERE v.partnerId = @partnerId
      `;

            const request = pool.request();
            request.input('partnerId', sql.Int, partnerId);

            if (filters.fromDate) {
                query += ' AND CAST(t.startTime AS DATE) >= @fromDate';
                request.input('fromDate', sql.Date, filters.fromDate);
            }

            if (filters.toDate) {
                query += ' AND CAST(t.startTime AS DATE) <= @toDate';
                request.input('toDate', sql.Date, filters.toDate);
            }

            query += ' ORDER BY t.startTime DESC';

            if (filters.limit) {
                query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
                request.input('offset', sql.Int, filters.offset || 0);
                request.input('limit', sql.Int, filters.limit);
            }

            const result = await request.query(query);
            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Tạo chuyến xe mới
    create: async (tripData) => {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('fromStationId', sql.Int, tripData.fromStationId)
                .input('toStationId', sql.Int, tripData.toStationId)
                .input('vehicleId', sql.Int, tripData.vehicleId)
                .input('startTime', sql.DateTime, tripData.startTime)
                .input('price', sql.Decimal(10, 2), tripData.price)
                .input('estimatedDuration', sql.Int, tripData.estimatedDuration)
                .input('imageUrl', sql.NVarChar, tripData.imageUrl || null)
                .input('isActive', sql.Bit, tripData.isActive !== undefined ? tripData.isActive : 1)
                .query(`
          INSERT INTO Trips (fromStationId, toStationId, vehicleId, startTime, price, estimatedDuration, imageUrl, isActive, createdAt)
          OUTPUT INSERTED.*
          VALUES (@fromStationId, @toStationId, @vehicleId, @startTime, @price, @estimatedDuration, @imageUrl, @isActive, GETDATE())
        `);

            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Cập nhật chuyến xe
    update: async (id, tripData) => {
        try {
            const pool = getPool();
            const request = pool.request();

            let setClause = [];
            request.input('id', sql.Int, id);

            if (tripData.fromStationId !== undefined) {
                setClause.push('fromStationId = @fromStationId');
                request.input('fromStationId', sql.Int, tripData.fromStationId);
            }
            if (tripData.toStationId !== undefined) {
                setClause.push('toStationId = @toStationId');
                request.input('toStationId', sql.Int, tripData.toStationId);
            }
            if (tripData.vehicleId !== undefined) {
                setClause.push('vehicleId = @vehicleId');
                request.input('vehicleId', sql.Int, tripData.vehicleId);
            }
            if (tripData.startTime !== undefined) {
                setClause.push('startTime = @startTime');
                request.input('startTime', sql.DateTime, tripData.startTime);
            }
            if (tripData.price !== undefined) {
                setClause.push('price = @price');
                request.input('price', sql.Decimal(10, 2), tripData.price);
            }
            if (tripData.estimatedDuration !== undefined) {
                setClause.push('estimatedDuration = @estimatedDuration');
                request.input('estimatedDuration', sql.Int, tripData.estimatedDuration);
            }
            if (tripData.imageUrl !== undefined) {
                setClause.push('imageUrl = @imageUrl');
                request.input('imageUrl', sql.NVarChar, tripData.imageUrl);
            }
            if (tripData.isActive !== undefined) {
                setClause.push('isActive = @isActive');
                request.input('isActive', sql.Bit, tripData.isActive);
            }

            setClause.push('updatedAt = GETDATE()');

            const query = `
        UPDATE Trips
        SET ${setClause.join(', ')}
        OUTPUT INSERTED.*
        WHERE id = @id
      `;

            const result = await request.query(query);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Xóa chuyến xe
    delete: async (id) => {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('id', sql.Int, id)
                .query(`
          DELETE FROM Trips
          OUTPUT DELETED.*
          WHERE id = @id
        `);

            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Lấy danh sách ghế của chuyến xe
    getSeats: async (tripId) => {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('tripId', sql.Int, tripId)
                .query(`
          SELECT 
            s.id,
            s.name,
            s.floor,
            s.type,
            CASE 
              WHEN tk.id IS NOT NULL AND tk.status IN ('BOOKED', 'PAID') THEN 'BOOKED'
              ELSE s.status
            END as status,
            tk.id as ticketId,
            tk.userId
          FROM Seats s
          LEFT JOIN Tickets tk ON s.id = tk.seatId AND tk.tripId = @tripId
          WHERE s.vehicleId = (SELECT vehicleId FROM Trips WHERE id = @tripId)
          ORDER BY s.floor, s.name
        `);

            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Lấy điểm dừng của chuyến xe
    getTimePoints: async (tripId) => {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('tripId', sql.Int, tripId)
                .query(`
          SELECT 
            tp.id,
            p.address,
            tp.arrivalTime,
            tp.departureTime,
            tp.stopDuration
          FROM TimePoints tp
          JOIN Points p ON tp.pointId = p.id
          WHERE tp.tripId = @tripId
          ORDER BY tp.arrivalTime
        `);

            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Thống kê chuyến xe
    getStatistics: async (partnerId = null) => {
        try {
            const pool = getPool();
            let query = `
        SELECT 
          COUNT(*) as totalTrips,
          SUM(CASE WHEN isActive = 1 THEN 1 ELSE 0 END) as activeTrips,
          SUM(CASE WHEN isActive = 0 THEN 1 ELSE 0 END) as inactiveTrips,
          AVG(price) as averagePrice,
          MIN(price) as minPrice,
          MAX(price) as maxPrice
        FROM Trips t
        WHERE 1=1
      `;

            if (partnerId) {
                query += ` AND t.vehicleId IN (SELECT id FROM Vehicles WHERE partnerId = ${partnerId})`;
            }

            const result = await pool.request().query(query);
            return result.recordset[0];
        } catch (err) {
            throw err;
        }
    },

    // Tìm kiếm chuyến xe (sử dụng stored procedure)
    search: async (fromStation, toStation, date, page = 1, limit = 10) => {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('fromStation', sql.NVarChar, fromStation || null)
                .input('toStation', sql.NVarChar, toStation || null)
                .input('departureDate', sql.Date, date || null)
                .input('pageNumber', sql.Int, page)
                .input('pageSize', sql.Int, limit)
                .execute('sp_SearchRoutes');

            return result.recordset;
        } catch (err) {
            throw err;
        }
    },

    // Lấy tuyến phổ biến
    getPopular: async (limit = 10) => {
        try {
            const pool = getPool();
            const result = await pool.request()
                .input('topCount', sql.Int, limit)
                .execute('sp_GetPopularRoutes');

            return result.recordset;
        } catch (err) {
            throw err;
        }
    }
};

module.exports = Trip;
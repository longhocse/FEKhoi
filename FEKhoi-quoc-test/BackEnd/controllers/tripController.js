const { poolPromise } = require("../config/db");

const getPopularTrips = async (req, res) => {
    try {
        const pool = await poolPromise;

        const result = await pool.request().query(`
      SELECT TOP 4 
        t.id,
        fs.name AS fromStation,
        ts.name AS toStation,
        t.startTime,
        t.price
      FROM Trips t
      JOIN Stations fs ON t.fromStationId = fs.id
      JOIN Stations ts ON t.toStationId = ts.id
      WHERE t.isActive = 1
      ORDER BY t.createdAt DESC
    `);

        res.json(result.recordset);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};


const getTrips = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const offset = (page - 1) * limit;

        const { from, to, minPrice } = req.query;

        let where = "WHERE t.isActive = 1";
        let params = [];

        if (from) {
            where += " AND s1.name LIKE @from";
            params.push({ name: "from", type: require("mssql").NVarChar, value: `%${from}%` });
        }

        if (to) {
            where += " AND s2.name LIKE @to";
            params.push({ name: "to", type: require("mssql").NVarChar, value: `%${to}%` });
        }

        if (minPrice) {
            where += " AND t.price >= @minPrice";
            params.push({ name: "minPrice", type: require("mssql").Decimal(10, 2), value: minPrice });
        }

        const pool = await poolPromise;

        const request = pool.request();
        params.forEach(p => request.input(p.name, p.type, p.value));

        const result = await request.query(`
      SELECT t.id,
             s1.name AS fromStation,
             s2.name AS toStation,
             v.name AS vehicle,
             t.startTime,
             t.price
      FROM Trips t
      JOIN Stations s1 ON t.fromStationId = s1.id
      JOIN Stations s2 ON t.toStationId = s2.id
      JOIN Vehicles v ON t.vehicleId = v.id
      ${where}
      ORDER BY t.startTime
      OFFSET ${offset} ROWS
      FETCH NEXT ${limit} ROWS ONLY
    `);

        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};


const getTripById = async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await poolPromise;

        const result = await pool.request()
            .input("id", require("mssql").Int, id)
            .query(`
                SELECT 
                    t.id,
                    s1.name AS fromStation,
                    s2.name AS toStation,
                    v.id AS vehicleId,
                    v.name AS vehicleName,
                    t.startTime,
                    t.price,
                    t.estimatedDuration,
                    t.imageUrl
                FROM Trips t
                JOIN Stations s1 ON t.fromStationId = s1.id
                JOIN Stations s2 ON t.toStationId = s2.id
                JOIN Vehicles v ON t.vehicleId = v.id
                WHERE t.id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ message: "Trip not found" });
        }

        const trip = result.recordset[0];

        const seatsResult = await pool.request()
            .input("vehicleId", require("mssql").Int, trip.vehicleId)
            .query(`
        SELECT 
            id,
            name AS seatName,
            floor,
            type AS seatType,
            status
        FROM Seats
        WHERE vehicleId = @vehicleId
        ORDER BY name
    `);

        res.json({
            ...trip,
            seats: seatsResult.recordset
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
};



module.exports = {
    getPopularTrips,
    getTrips,
    getTripById
};
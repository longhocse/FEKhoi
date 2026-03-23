const express = require('express');
const router = express.Router();
const tripController = require("../controllers/trip.controller");
const authMiddleware = require("../middleware/authMiddleware");
const { poolPromise } = require("../config/db");
const sql = require("mssql");

router.get("/trips", tripController.getTrips);
router.get("/all", tripController.getAllTrips);
router.get("/simple", tripController.getSimpleTrips);
router.get("/search", tripController.searchTrips);
router.get("/popular", tripController.getPopularTrips);
router.get("/:id", tripController.getTripById);
router.post("/book", authMiddleware, tripController.bookTicket);
router.post("/book-multiple", authMiddleware, tripController.bookMultipleTickets);
router.get('/fake-tracking/:tripId', async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const pool = await poolPromise;

        // 1. Trip
        const tripResult = await pool.request()
            .input('tripId', sql.Int, tripId)
            .query(`
        SELECT t.*, 
               sFrom.name AS fromStation,
               sTo.name AS toStation
        FROM Trips t
        JOIN Stations sFrom ON t.fromStationId = sFrom.id
        JOIN Stations sTo ON t.toStationId = sTo.id
        WHERE t.id = @tripId
    `);

        const trip = tripResult.recordset[0];
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // 2. TimePoints
        const tpResult = await pool.request()
            .input('tripId', sql.Int, tripId)
            .query(`
        SELECT tp.*, p.address
        FROM TimePoints tp
        JOIN Points p ON tp.pointId = p.id
        WHERE tp.tripId = @tripId
        ORDER BY tp.arrivalTime
    `);

        const timePoints = tpResult.recordset;
        if (timePoints.length === 0) {
            return res.json({ status: "NO_DATA" });
        }

        const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Ho_Chi_Minh" }));
        const startTime = new Date(trip.startTime);
        startTime.setHours(startTime.getHours() - 7);

        const locationMap = {
            // Start - End
            "Cần Thơ": [10.0452, 105.7469],
            "Bến xe Cần Thơ": [10.0452, 105.7469],

            "Đà Nẵng": [16.0544, 108.2022],
            "Bến xe Đà Nẵng": [16.0544, 108.2022],

            // Route cũ miền Trung
            "Thanh Hóa": [19.8067, 105.7852],
            "Vinh": [18.6796, 105.6813],
            "Hà Tĩnh": [18.3559, 105.8877],
            "Đồng Hới": [17.4689, 106.6223],
            "Đông Hà": [16.8163, 107.1003],
            "Huế": [16.4637, 107.5909],

            // 🔥 Route Đà Nẵng → Cần Thơ
            "Quảng Ngãi": [15.1205, 108.7923],
            "Quy Nhơn": [13.7820, 109.2197],
            "Nha Trang": [12.2388, 109.1967],
            "TP HCM": [10.8231, 106.6297],
        };


        const getTimeParts = (time) => {
            if (typeof time === "string") {
                return time.split(':').map(Number);
            } else {
                return [
                    time.getHours(),
                    time.getMinutes(),
                    time.getSeconds()
                ];
            }
        };
        // 3. Convert time
        const points = timePoints.map(tp => {
            const arrival = new Date(startTime);
            const departure = new Date(startTime);

            const [ah, am, as] = getTimeParts(tp.arrivalTime);
            const [dh, dm, ds] = getTimeParts(tp.departureTime);

            arrival.setHours(ah, am, as);
            departure.setHours(dh, dm, ds);

            if (arrival < startTime) arrival.setDate(arrival.getDate() + 1);
            if (departure < startTime) departure.setDate(departure.getDate() + 1);

            const coords = locationMap[tp.address] || [18.5, 106.5];

            return {
                name: tp.address,   // 👈 dùng address làm name luôn
                address: tp.address,
                lat: coords[0],
                lng: coords[1],
                arrivalTime: arrival,
                departureTime: departure
            };
        });

        points.sort((a, b) => a.arrivalTime - b.arrivalTime);

        // 🚀 thêm điểm xuất phát
        points.unshift({
            name: trip.fromStation,
            address: trip.fromStation,
            lat: locationMap[trip.fromStation]?.[0] || 10.0,
            lng: locationMap[trip.fromStation]?.[1] || 105.0,
            arrivalTime: startTime,
            departureTime: startTime
        });

        const last = points[points.length - 1];

        // 🚀 thêm điểm đích
        points.push({
            name: trip.toStation,
            address: trip.toStation,
            lat: locationMap[trip.toStation]?.[0] || 16.0,
            lng: locationMap[trip.toStation]?.[1] || 108.0,
            arrivalTime: last.arrivalTime,
            departureTime: last.departureTime
        });

        // 4. BEFORE START
        if (now < startTime) {
            return res.json({
                status: "NOT_STARTED",
                points,
                message: "Xe chưa khởi hành"
            });
        }

        const first = points[0];

        // 5. AFTER END
        if (now > last.departureTime) {
            return res.json({
                status: "ARRIVED",
                at: last,
                points,
                message: "Xe đã đến nơi"
            });
        }

        // 6. FROM START → FIRST POINT
        if (now >= startTime && now < first.arrivalTime) {
            const percent = (now - startTime) / (first.arrivalTime - startTime);

            return res.json({
                status: "MOVING",
                from: { lat: first.lat, lng: first.lng, name: "START" },
                to: first,
                progress: Number(percent.toFixed(2)),
                points,
                message: `Xe đang di chuyển đến ${first.name}`
            });
        }

        // 7. LOOP
        for (let i = 0; i < points.length; i++) {
            const p = points[i];

            // STOPPING
            if (now >= p.arrivalTime && now <= p.departureTime) {
                return res.json({
                    status: "STOPPING",
                    at: p,
                    points,
                    message: `Xe đang dừng tại ${p.name}`
                });
            }

            // MOVING
            if (i < points.length - 1) {
                const next = points[i + 1];

                if (now >= p.departureTime && now <= next.arrivalTime) {
                    const percent =
                        (now - p.departureTime) /
                        (next.arrivalTime - p.departureTime || 1);

                    return res.json({
                        status: "MOVING",
                        from: p,
                        to: next,
                        progress: Number(percent.toFixed(2)),
                        points,
                        message: `Xe đang di chuyển từ ${p.name} đến ${next.name}`
                    });
                }
            }
        }

        return res.json({ status: "UNKNOWN", points });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
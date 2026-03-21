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
router.get('/fake-tracking/:tripId', async (req, res) => {
    try {
        const tripId = req.params.tripId;
        const pool = await poolPromise;

        // 1. Lấy trip
        const tripResult = await pool.request()
            .input('tripId', sql.Int, tripId)
            .query(`SELECT * FROM Trips WHERE id = @tripId`);

        const trip = tripResult.recordset[0];
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // 2. Lấy time points
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

        // 3. Convert TIME → DATETIME
        const points = timePoints.map(tp => {
            const arrival = new Date(startTime);
            const departure = new Date(startTime);

            let ah, am, as, dh, dm, ds;

            if (typeof tp.arrivalTime === "string") {
                [ah, am, as] = tp.arrivalTime.split(':').map(Number);
                [dh, dm, ds] = tp.departureTime.split(':').map(Number);
            } else {
                const a = new Date(tp.arrivalTime);
                const d = new Date(tp.departureTime);
                ah = a.getHours(); am = a.getMinutes(); as = a.getSeconds();
                dh = d.getHours(); dm = d.getMinutes(); ds = d.getSeconds();
            }

            arrival.setHours(ah, am, as);
            departure.setHours(dh, dm, ds);

            if (arrival < startTime) arrival.setDate(arrival.getDate() + 1);
            if (departure < startTime) departure.setDate(departure.getDate() + 1);

            return {
                ...tp,
                arrivalTime: arrival,
                departureTime: departure
            };
        });
        points.sort((a, b) => a.arrivalTime - b.arrivalTime);
        console.log("===== DEBUG TIME POINTS =====");
        points.forEach(p => {
            console.log(
                p.address,
                "ARR:", p.arrivalTime.toISOString(),
                "DEP:", p.departureTime.toISOString()
            );
        });
        console.log("NOW:", now.toISOString());
        console.log("START:", startTime.toISOString());
        // 4. Check trạng thái
        if (now < startTime) {
            return res.json({
                status: "NOT_STARTED",
                message: "Xe chưa khởi hành"
            });
        }

        const lastPoint = points[points.length - 1];

        if (now > lastPoint.departureTime) {
            return res.json({
                status: "ARRIVED",
                message: "Xe đã đến nơi"
            });
        }
        const firstPoint = points[0];

        // 🚍 Đang di chuyển từ điểm xuất phát → điểm đầu tiên
        if (now >= startTime && now < firstPoint.arrivalTime) {
            const percent =
                (now - startTime) /
                (firstPoint.arrivalTime - startTime);

            return res.json({
                status: "MOVING",
                from: "Điểm xuất phát",
                to: firstPoint.address,
                progress: Number(percent.toFixed(2)),
                message: `Xe đang di chuyển từ điểm xuất phát đến ${firstPoint.address}`
            });
        }
        // 5. Tìm đoạn đang di chuyển
        for (let i = 0; i < points.length; i++) {
            const p = points[i];

            // 🚏 Đang dừng tại điểm
            if (now >= p.arrivalTime && now <= p.departureTime) {
                return res.json({
                    status: "STOPPING",
                    at: p.address,
                    message: `Xe đang dừng tại ${p.address}`
                });
            }

            // 🚍 Đang di chuyển giữa 2 điểm
            if (i < points.length - 1) {
                const next = points[i + 1];

                // STOPPING
                if (now >= p.arrivalTime && now <= p.departureTime) {
                    return res.json({
                        status: "STOPPING",
                        at: p.address,
                        message: `Xe đang dừng tại ${p.address}`
                    });
                }

                // MOVING (fix ở đây)
                if (i < points.length - 1) {
                    const next = points[i + 1];

                    if (now >= p.departureTime && now <= next.arrivalTime) {
                        const percent =
                            (now - p.departureTime) /
                            (next.arrivalTime - p.departureTime || 1); // tránh chia 0

                        return res.json({
                            status: "MOVING",
                            from: p.address,
                            to: next.address,
                            progress: Number(percent.toFixed(2)),
                            message: `Xe đang di chuyển từ ${p.address} đến ${next.address}`
                        });
                    }
                    // Nếu không match gì → assume đang di chuyển
                    const first = points[0];
                    const last = points[points.length - 1];
                }
            }
        }

        return res.json({ status: "UNKNOWN" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
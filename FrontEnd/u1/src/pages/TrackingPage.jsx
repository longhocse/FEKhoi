import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Container,
    Spinner,
    Alert,
    ProgressBar,
    Card,
    Badge,
    Row,
    Col
} from "react-bootstrap";
import { useParams } from "react-router-dom";

import {
    MapContainer,
    TileLayer,
    Marker,
    Polyline
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// fix icon leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    iconUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    shadowUrl:
        "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// icon xe bus
const busIcon = new L.Icon({
    iconUrl: "/assets/bus.png",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
});

const startIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

const endIcon = new L.Icon({
    iconUrl: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    iconSize: [35, 35],
    iconAnchor: [17, 35],
});

export default function TrackingPage() {
    const { tripId } = useParams();
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = "http://localhost:5000/api/trips";

    useEffect(() => {
        const fetchTracking = async () => {
            try {
                const res = await axios.get(`${API_URL}/fake-tracking/${tripId}`);
                setTracking(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchTracking();
        const interval = setInterval(fetchTracking, 3000);
        return () => clearInterval(interval);
    }, [tripId]);

    // 🧠 marker position theo route
    const getMarkerPosition = () => {
        if (!tracking || !tracking.points || tracking.points.length === 0)
            return [18.5, 106.5];

        // 🚍 đang di chuyển
        if (tracking.status === "MOVING") {
            const { from, to, progress } = tracking;

            const lat = from.lat + (to.lat - from.lat) * progress;
            const lng = from.lng + (to.lng - from.lng) * progress;

            return [lat, lng];
        }

        // 🚏 đang dừng
        if (tracking.status === "STOPPING") {
            return [tracking.at.lat, tracking.at.lng];
        }

        // 🏁 đã tới nơi
        if (tracking.status === "ARRIVED") {
            return [tracking.at.lat, tracking.at.lng];
        }

        // ⏳ chưa chạy
        return [tracking.points[0].lat, tracking.points[0].lng];
    };

    const markerPosition = getMarkerPosition();


    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (!tracking || !tracking.points) {
        return <Alert variant="danger">Không có dữ liệu tracking</Alert>;
    }

    const points = tracking.points;
    // const sortedPoints = [...tracking.points].sort(
    //     (a, b) => new Date(a.arrivalTime) - new Date(b.arrivalTime)
    // );
    const sortedPoints = tracking.points; // dùng thẳng backend trả
    return (
        <Container className="mt-4">
            <Row>
                {/* MAP */}
                <Col md={7}>
                    <Card className="shadow rounded-4 overflow-hidden">
                        <MapContainer
                            center={[points[0].lat, points[0].lng]}
                            zoom={6}
                            style={{ height: "500px", width: "100%" }}
                        >
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                            {/* route */}
                            <Polyline positions={sortedPoints.map(p => [p.lat, p.lng])} />

                            {/* START */}
                            <Marker
                                position={[sortedPoints[0].lat, sortedPoints[0].lng]}
                                icon={startIcon}
                            />

                            {/* END */}
                            <Marker
                                position={[
                                    sortedPoints[sortedPoints.length - 1].lat,
                                    sortedPoints[sortedPoints.length - 1].lng
                                ]}
                                icon={endIcon}
                            />

                            {/* intermediate points */}
                            {sortedPoints.slice(1, -1).map((p, index) => (
                                <Marker key={index} position={[p.lat, p.lng]} />
                            ))}

                            {/* 🚍 bus */}
                            <Marker position={markerPosition} icon={busIcon} />
                        </MapContainer>
                    </Card>
                </Col>

                {/* INFO */}
                <Col md={5}>
                    <Card className="shadow-lg p-4 rounded-4">
                        <h4 className="mb-3">🚍 Theo dõi hành trình</h4>

                        <Alert variant="info">{tracking.message}</Alert>

                        {/* progress */}
                        {tracking.status === "MOVING" && (
                            <>
                                <p className="fw-semibold">
                                    {tracking.from.name} → {tracking.to.name}
                                </p>
                                <ProgressBar
                                    now={tracking.progress * 100}
                                    label={`${Math.round(tracking.progress * 100)}%`}
                                    animated
                                    striped
                                    className="mb-4"
                                />
                            </>
                        )}

                        {/* timeline */}
                        <div className="mt-3">
                            <h6>📍 Lộ trình</h6>

                            <div className="timeline">
                                {sortedPoints.map((p, index) => {
                                    let status = "pending";

                                    // 🟢 đã qua
                                    if (
                                        tracking.status === "ARRIVED" ||
                                        (tracking.from && index < points.findIndex(pt => pt.name === tracking.from.name))
                                    ) {
                                        status = "done";
                                    }

                                    // 🔵 đang dừng
                                    if (tracking.status === "STOPPING" && tracking.at?.name === p.name) {
                                        status = "current";
                                    }

                                    // 🚍 đang di chuyển (highlight điểm đang tới)
                                    if (tracking.status === "MOVING" && tracking.to?.name === p.name) {
                                        status = "current";
                                    }

                                    return (
                                        <div key={index} className="timeline-item mb-3">
                                            <div
                                                className={`timeline-dot ${status === "current"
                                                    ? "bg-primary"
                                                    : status === "done"
                                                        ? "bg-success"
                                                        : "bg-secondary"
                                                    }`}
                                            />

                                            <div className="ms-3">
                                                <span className="fw-semibold">
                                                    {index === 0 && "🚏 "}
                                                    {index === points.length - 1 && "🏁 "}
                                                    {p.name}
                                                </span>

                                                {/* time */}
                                                <div className="text-muted small">
                                                    {p.arrivalTime.slice(11, 16)} - {p.departureTime.slice(11, 16)}
                                                </div>

                                                {/* badge */}
                                                {status === "current" && (
                                                    <Badge bg="primary" className="ms-2">
                                                        {tracking.status === "MOVING" ? "Đang tới" : "Hiện tại"}
                                                    </Badge>
                                                )}

                                                {status === "done" && (
                                                    <Badge bg="success" className="ms-2">
                                                        Đã qua
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>

            <style>
                {`
                .timeline {
                    border-left: 3px solid #dee2e6;
                    padding-left: 20px;
                }
                .timeline-item {
                    position: relative;
                }
                .timeline-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    position: absolute;
                    left: -27px;
                    top: 5px;
                }
                `}
            </style>
        </Container>
    );
}
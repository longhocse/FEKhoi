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

// 🚍 icon xe bus
const busIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/61/61231.png",
    iconSize: [32, 32],
});

export default function TrackingPage() {
    const { tripId } = useParams();
    const [tracking, setTracking] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_URL = "http://localhost:5000/api/trips";

    const locations = {
        "Điểm xuất phát": [21.0285, 105.8542], // ví dụ Hà Nội
        "Thanh Hóa": [19.8067, 105.7852],
        "Vinh": [18.6796, 105.6813],
        "Hà Tĩnh": [18.3559, 105.8877],
        "Đồng Hới": [17.4689, 106.6223],
        "Đông Hà": [16.8163, 107.1003],
        "Huế": [16.4637, 107.5909],
    };

    const points = Object.keys(locations);

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

    // 🧠 tính vị trí marker
    const getMarkerPosition = () => {
        if (!tracking) return locations["Thanh Hóa"];

        if (tracking.status === "MOVING") {
            const from = locations[tracking.from];
            const to = locations[tracking.to];

            if (!from || !to) {
                console.warn("Invalid location:", tracking.from, tracking.to);
                return locations["Thanh Hóa"]; // fallback
            }

            const lat = from[0] + (to[0] - from[0]) * tracking.progress;
            const lng = from[1] + (to[1] - from[1]) * tracking.progress;

            return [lat, lng];
        }

        if (tracking.status === "STOPPING") {
            return locations[tracking.at] || locations["Thanh Hóa"];
        }

        return locations["Thanh Hóa"];
    };

    console.log("tracking:", tracking);

    const markerPosition = getMarkerPosition();

    // 🧠 trạng thái timeline
    const getPointStatus = (point) => {
        if (!tracking) return "pending";

        if (tracking.status === "STOPPING" && tracking.at === point) {
            return "current";
        }

        if (
            tracking.status === "MOVING" &&
            (tracking.from === point || tracking.to === point)
        ) {
            return "current";
        }

        if (
            tracking.from &&
            points.indexOf(point) < points.indexOf(tracking.from)
        ) {
            return "done";
        }

        return "pending";
    };

    if (loading) {
        return (
            <Container className="text-center mt-5">
                <Spinner animation="border" />
            </Container>
        );
    }

    if (!tracking) {
        return <Alert variant="danger">Không có dữ liệu tracking</Alert>;
    }

    return (
        <Container className="mt-4">
            <Row>
                {/* 🗺️ MAP */}
                <Col md={7}>
                    <Card className="shadow rounded-4 overflow-hidden">
                        <MapContainer
                            center={[18.5, 106.5]}
                            zoom={6}
                            style={{ height: "500px", width: "100%" }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {/* route */}
                            <Polyline positions={Object.values(locations)} />

                            {/* xe */}
                            <Marker position={markerPosition} icon={busIcon} />
                        </MapContainer>
                    </Card>
                </Col>

                {/* 📍 INFO */}
                <Col md={5}>
                    <Card className="shadow-lg p-4 rounded-4">
                        <h4 className="mb-3">🚍 Theo dõi hành trình</h4>

                        <Alert variant="info">{tracking.message}</Alert>

                        {/* progress */}
                        {tracking.status === "MOVING" && (
                            <>
                                <p className="fw-semibold">
                                    {tracking.from} → {tracking.to}
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

                        {tracking.status === "NOT_STARTED" && (
                            <Alert variant="warning">Xe chưa khởi hành</Alert>
                        )}

                        {tracking.status === "ARRIVED" && (
                            <Alert variant="success">Xe đã đến nơi</Alert>
                        )}

                        {/* timeline */}
                        <div className="mt-3">
                            <h6>📍 Lộ trình</h6>

                            <div className="timeline">
                                {points.map((p, index) => {
                                    const status = getPointStatus(p);

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
                                                <span className="fw-semibold">{p}</span>

                                                {status === "current" && (
                                                    <Badge bg="primary" className="ms-2">
                                                        Hiện tại
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

            {/* CSS */}
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
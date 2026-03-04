import { Container, Card, Button, Badge } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function RouteDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);

  useEffect(() => {
    const fetchTrip = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/trips/${id}`);
        setTrip(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchTrip();
  }, [id]);

  if (!trip) return <Container className="py-4">Đang tải...</Container>;

  return (
    <Container className="py-4">
      <Button variant="link" onClick={() => navigate(-1)}>
        ← Quay lại
      </Button>

      <Card className="soft-card p-4">

        {trip.imageUrl && (
          <img
            src={trip.imageUrl}
            alt="Trip"
            style={{ width: "100%", borderRadius: 12 }}
            className="mb-3"
          />
        )}

        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h3>{trip.fromStation} → {trip.toStation}</h3>
            <div className="text-muted">
              {trip.vehicleName} • {trip.estimatedDuration} phút
            </div>
          </div>
          <Badge bg="light" text="dark">E-ticket</Badge>
        </div>

        <hr />

        <div className="d-flex justify-content-between align-items-center">
          <div className="fs-3 fw-bold text-primary">
            {trip.price.toLocaleString("vi-VN")}đ
          </div>

          <Button
            variant="primary"
            onClick={() => navigate("/chon-ghe", { state: { trip } })}
          >
            Chọn ghế và đặt vé
          </Button>
        </div>
      </Card>
    </Container>
  );
}
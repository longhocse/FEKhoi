import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Table, Button, Badge } from "react-bootstrap";
import "../styles/PartnerTrips.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function PartnerTrips() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const partnerId = user?.id;

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/partner/trips/${partnerId}`
      );
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Container fluid className="page-bg p-4">

      <Card className="shadow-sm border-0">
        <Card.Body>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="title">🚌 Danh sách chuyến xe</h4>

            <Button
              className="btn-add"
              onClick={() => navigate("/doi-tac/create-trip")}
            >
              + Thêm chuyến
            </Button>
          </div>

          {trips.length === 0 ? (
            <div className="text-center text-muted py-5">
              🚫 Chưa có chuyến nào
            </div>
          ) : (
            <Table hover responsive>
              <thead className="table-head">
                <tr>
                  <th>Tuyến</th>
                  <th>Xe</th>
                  <th>Khởi hành</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>

              <tbody>
                {trips.map((trip) => (
                  <tr key={trip.id}>
                    <td>{trip.routeName}</td>

                    <td>{trip.vehicleName}</td>

                    <td>
                      {new Date(trip.startTime).toLocaleString()}
                    </td>

                    <td className="price">
                      {trip.price.toLocaleString()} đ
                    </td>

                    <td>
                      <Badge className="status-badge">
                        {trip.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>

            </Table>
          )}
        </Card.Body>
      </Card>

    </Container>
  );
}
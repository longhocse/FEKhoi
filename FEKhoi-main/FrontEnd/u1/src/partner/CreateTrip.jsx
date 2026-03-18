import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/createTrip.css";

import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";

export default function CreateTrip() {

  const { user } = useAuth();

  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [seats, setSeats] = useState([]);

  const [form, setForm] = useState({
    fromStationId: "",
    toStationId: "",
    startDate: "",
    startTime: "",
    arrivalTime: "",
    price: "",
    vehicleId: "",
    imageUrl: ""
  });

  useEffect(() => {
    fetchVehicles();
    fetchStations();
  }, []);

  useEffect(() => {
    if (form.vehicleId) {
      fetchSeats(form.vehicleId);
    }
  }, [form.vehicleId]);

  const fetchSeats = async (vehicleId) => {
    const res = await axios.get(
      `http://localhost:5000/api/partner/vehicles/${vehicleId}/seats`
    );

    setSeats(res.data);
  };

  const fetchStations = async () => {
    const res = await axios.get("http://localhost:5000/api/partner/stations");
    setStations(res.data);
  };

  const fetchVehicles = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/partner/vehicles/${user.id}`
    );
    setVehicles(res.data);
  };

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let startDateTime = new Date(`${form.startDate}T${form.startTime}`);
    let arrivalDateTime = new Date(`${form.startDate}T${form.arrivalTime}`);

    if (arrivalDateTime <= startDateTime) {
      arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
    }

    await axios.post("http://localhost:5000/api/partner/trips", {
      fromStationId: form.fromStationId,
      toStationId: form.toStationId,
      startTime: startDateTime,
      arrivalTime: arrivalDateTime,
      price: form.price,
      vehicleId: form.vehicleId,
      imageUrl: form.imageUrl
    });

    alert("Tạo chuyến thành công");

    setForm({
      fromStationId: "",
      toStationId: "",
      startDate: "",
      startTime: "",
      arrivalTime: "",
      price: "",
      vehicleId: "",
      imageUrl: ""
    });
  };

  const floor1Seats = seats
    .filter(seat => seat.floor === 1)
    .sort((a, b) => a.name.localeCompare(b.name));

  const floor2Seats = seats
    .filter(seat => seat.floor === 2)
    .sort((a, b) => a.name.localeCompare(b.name));


  return (

    <Container className="create-trip-container">

      <h2 className="page-title">
        🚌 Tạo chuyến xe mới
      </h2>

      <Form onSubmit={handleSubmit}>

        {/* IMAGE */}
        <Card className="trip-card">
          <Card.Body>

            <Card.Title>🖼 Ảnh chuyến xe</Card.Title>

            <Form.Control
              type="text"
              name="imageUrl"
              placeholder="Paste image link"
              value={form.imageUrl}
              onChange={handleChange}
            />

            {form.imageUrl && (
              <img
                src={form.imageUrl}
                alt="preview"
                className="trip-preview"
              />
            )}

          </Card.Body>
        </Card>


        {/* ROUTE */}
        <Card className="trip-card">
          <Card.Body>

            <Card.Title>📍 Tuyến đường</Card.Title>

            <Row>

              <Col md={6}>
                <Form.Label>Điểm đi</Form.Label>
                <Form.Select
                  name="fromStationId"
                  value={form.fromStationId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn điểm đi</option>
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col md={6}>
                <Form.Label>Điểm đến</Form.Label>
                <Form.Select
                  name="toStationId"
                  value={form.toStationId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Chọn điểm đến</option>
                  {stations.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>

            </Row>

          </Card.Body>
        </Card>


        {/* TIME */}
        <Card className="trip-card">
          <Card.Body>

            <Card.Title>⏰ Thời gian chuyến xe</Card.Title>

            <Row>

              <Col md={4}>
                <Form.Label>Ngày khởi hành</Form.Label>
                <Form.Control
                  type="date"
                  name="startDate"
                  value={form.startDate}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col md={4}>
                <Form.Label>Giờ khởi hành</Form.Label>
                <Form.Control
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                  required
                />
              </Col>

              <Col md={4}>
                <Form.Label>Giờ đến nơi</Form.Label>
                <Form.Control
                  type="time"
                  name="arrivalTime"
                  value={form.arrivalTime}
                  onChange={handleChange}
                  required
                />
              </Col>

            </Row>

            <p className="time-hint">
              ⏱ Thời gian di chuyển sẽ được hệ thống tự động tính.
            </p>

          </Card.Body>
        </Card>


        {/* PRICE */}
        <Card className="trip-card">
          <Card.Body>

            <Card.Title>💰 Giá vé</Card.Title>

            <Form.Control
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="Ví dụ: 250000"
              required
            />

          </Card.Body>
        </Card>


        {/* VEHICLE */}
        <Card className="trip-card">
          <Card.Body>

            <Card.Title>🚍 Xe sử dụng</Card.Title>

            <Form.Select
              name="vehicleId"
              value={form.vehicleId}
              onChange={handleChange}
              required
            >
              <option value="">Chọn xe</option>

              {vehicles.map(v => (
                <option key={v.id} value={v.id}>
                  {v.name} - {v.licensePlate}
                </option>
              ))}

            </Form.Select>

          </Card.Body>
        </Card>
        <Card className="trip-card">
          <Card.Body>

            <Card.Title>Seat Layout Preview</Card.Title>

            {/* FLOOR 1 */}
            {floor1Seats.length > 0 && (
              <>
                <h5 className="floor-title">Tầng 1</h5>

                <div className="seat-grid">
                  {floor1Seats.map(seat => (
                    <div
                      key={seat.id}
                      className={`seat ${seat.type.toLowerCase()}`}
                    >
                      {seat.name}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* FLOOR 2 */}
            {floor2Seats.length > 0 && (
              <>
                <h5 className="floor-title">Tầng 2</h5>

                <div className="seat-grid">
                  {floor2Seats.map(seat => (
                    <div
                      key={seat.id}
                      className={`seat ${seat.type.toLowerCase()}`}
                    >
                      {seat.name}
                    </div>
                  ))}
                </div>
              </>
            )}

          </Card.Body>
        </Card>

        <div className="submit-area">
          <Button type="submit" className="create-btn">
            Tạo chuyến xe
          </Button>
        </div>

      </Form>

    </Container>

  );
}
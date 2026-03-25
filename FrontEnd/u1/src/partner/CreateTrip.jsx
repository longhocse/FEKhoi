import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/createTrip.css";
import { useParams, useNavigate } from "react-router-dom";

import { Container, Card, Row, Col, Form, Button } from "react-bootstrap";

export default function CreateTrip() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [stations, setStations] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [seats, setSeats] = useState([]);
  const { id } = useParams();
  const isEdit = !!id;

  const [timePoints, setTimePoints] = useState([]);
  const [points, setPoints] = useState([]);

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
    fetchPoints();
    if (isEdit) {
      fetchTripDetail();
    }
  }, [id]);

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

  const fetchPoints = async () => {
    const res = await axios.get("http://localhost:5000/api/trips/points");
    setPoints(res.data);
  };

  const fetchVehicles = async () => {
    const res = await axios.get(
      `http://localhost:5000/api/partner/vehicles/${user.id}`
    );
    setVehicles(res.data);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "startDate") {
      setForm(prev => ({
        ...prev,
        startDate: value,
        endDate: "" // reset để user chọn lại
      }));
      return;
    }

    setForm({
      ...form,
      [name]: value
    });
  };

  const fetchTripDetail = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/partner/trips/detail/${id}`
      );

      const trip = res.data;

      const start = new Date(trip.startTime);
      const arrival = new Date(trip.arrivalTime);

      setForm({
        fromStationId: trip.fromStationId,
        toStationId: trip.toStationId,
        endDate: "",
        startDate: start.toISOString().slice(0, 10),
        startTime: start.toTimeString().slice(0, 5),
        arrivalTime: arrival.toTimeString().slice(0, 5),
        price: trip.price,
        vehicleId: trip.vehicleId,
        imageUrl: trip.imageUrl || ""
      });

    } catch (err) {
      console.error(err);
    }
  };

  const formatDateTime = (date) => {
    const yyyy = date.getFullYear();
    const MM = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const HH = String(date.getHours()).padStart(2, "0");
    const mm = String(date.getMinutes()).padStart(2, "0");
    const ss = "00";

    return `${yyyy}-${MM}-${dd} ${HH}:${mm}:${ss}`;
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    let startDateTime = new Date(`${form.startDate}T${form.startTime}:00`);
    let arrivalDateTime = new Date(`${form.startDate}T${form.arrivalTime}:00`);

    if (arrivalDateTime <= startDateTime) {
      arrivalDateTime.setDate(arrivalDateTime.getDate() + 1);
    }
    for (let tp of timePoints) {
      if (!tp.pointId || !tp.arrivalTime || !tp.departureTime) {
        alert("Vui lòng nhập đầy đủ điểm dừng và thời gian!");
        return;
      }
    }


    try {
      if (isEdit) {
        // UPDATE
        await axios.put(
          `http://localhost:5000/api/partner/trips/detail/${id}`,
          {
            ...form,
            startTime: startDateTime,
            arrivalTime: arrivalDateTime
          }
        );

        alert("Cập nhật thành công!");

        navigate("/doi-tac/trips");
      } else {
        // CREATE


        const formattedTimePoints = timePoints
          .filter(tp => tp.pointId && tp.arrivalTime && tp.departureTime)
          .map(tp => ({
            ...tp,
            arrivalTime: formatTime(tp.arrivalTime),
            departureTime: formatTime(tp.departureTime)
          }));

        console.log("🚀 SUBMIT DATA:", {
          ...form,
          startTime: formatDateTime(startDateTime),
          arrivalTime: formatDateTime(arrivalDateTime),
          timePoints: formattedTimePoints
        });

        await axios.post(
          "http://localhost:5000/api/partner/trips",
          {
            ...form,
            startTime: formatDateTime(startDateTime),
            arrivalTime: formatDateTime(arrivalDateTime),
            timePoints: formattedTimePoints
          }
        );

        alert("Tạo chuyến thành công!");
        navigate("/doi-tac/trips");
      }


    } catch (err) {
      console.error(err);
    }
  };

  const floor1Seats = seats
    .filter(seat => seat.floor === 1)
    .sort((a, b) => a.name.localeCompare(b.name));

  const floor2Seats = seats
    .filter(seat => seat.floor === 2)
    .sort((a, b) => a.name.localeCompare(b.name));

  const addTimePoint = () => {
    setTimePoints([
      ...timePoints,
      {
        pointId: "",
        arrivalTime: "",
        departureTime: "",
        stopDuration: 0
      }
    ]);
  };

  const removeTimePoint = (index) => {
    const updated = [...timePoints];
    updated.splice(index, 1);
    setTimePoints(updated);
  };

  const handleTimePointChange = (index, field, value) => {
    const updated = [...timePoints];
    updated[index][field] = value;
    setTimePoints(updated);
  };

  const formatTime = (time) => {
    if (!time) return null; // 🔥 tránh gửi rác

    // nếu là HH:mm thì convert thành HH:mm:ss
    if (time.length === 5) return time + ":00";

    return time;
  };

  const MAX_DAYS = 60;

  const getMaxEndDate = (startDate) => {
    if (!startDate) return "";

    const d = new Date(startDate);
    d.setDate(d.getDate() + MAX_DAYS - 1);

    return d.toISOString().slice(0, 10);
  };

  return (

    <Container className="create-trip-container">

      <h2 className="page-title">
        {isEdit ? "✏️ Chỉnh sửa chuyến xe" : "🚌 Tạo chuyến xe mới"}
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

              <Form.Control
                type="date"
                name="endDate"
                value={form.endDate || ""}
                onChange={handleChange}
                min={form.startDate}
                max={getMaxEndDate(form.startDate)}
                required
              />

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

        <Card className="trip-card">
          <Card.Body>

            <Card.Title>📍 Điểm dừng (TimePoints)</Card.Title>

            {timePoints.map((tp, index) => (
              <Row key={index} className="mb-3">

                <Col md={3}>
                  <Form.Select
                    value={tp.pointId}
                    onChange={(e) =>
                      handleTimePointChange(index, "pointId", e.target.value)
                    }
                  >
                    <option value="">Chọn điểm</option>
                    {points.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.address}
                      </option>
                    ))}
                  </Form.Select>
                </Col>

                <Col md={3}>
                  <Form.Control
                    type="time"
                    value={tp.arrivalTime}
                    onChange={(e) =>
                      handleTimePointChange(index, "arrivalTime", e.target.value)
                    }
                  />
                </Col>

                <Col md={3}>
                  <Form.Control
                    type="time"
                    value={tp.departureTime}
                    onChange={(e) =>
                      handleTimePointChange(index, "departureTime", e.target.value)
                    }
                  />
                </Col>

                <Col md={2}>
                  <Form.Control
                    type="number"
                    placeholder="Stop (phút)"
                    value={tp.stopDuration}
                    onChange={(e) =>
                      handleTimePointChange(index, "stopDuration", e.target.value)
                    }
                  />
                </Col>

                <Col md={1}>
                  <Button
                    variant="danger"
                    onClick={() => removeTimePoint(index)}
                  >
                    ✕
                  </Button>
                </Col>

              </Row>
            ))}

            <Button onClick={addTimePoint}>
              ➕ Thêm điểm dừng
            </Button>

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
            {isEdit ? "💾 Cập nhật" : "Tạo chuyến xe"}
          </Button>
        </div>

      </Form>

    </Container>

  );
}

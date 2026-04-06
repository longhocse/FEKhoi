import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import "../styles/PartnerVehicles.css";
import { Container, Row, Col, Card, Form, Button, Badge } from "react-bootstrap";

export default function PartnerVehicles() {

  const { user } = useAuth();
  const partnerId = user?.id;

  const [vehicles, setVehicles] = useState([]);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    name: "",
    licensePlate: "",
    type: "",
    numberOfFloors: 1
  });

  const [services, setServices] = useState([]);

  const fetchServices = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/partner/services");
      setServices(res.data);
    } catch (err) {
      console.error("Lỗi lấy services:", err);
    }
  };

  const [selectedServices, setSelectedServices] = useState([]);

  const fetchVehicles = async () => {
    try {

      const res = await axios.get(
        `http://localhost:5000/api/partner/vehicles/${partnerId}`
      );

      setVehicles(res.data);

    } catch (err) {
      console.error("Lỗi lấy danh sách xe:", err);
    }
  };

  useEffect(() => {
    if (partnerId) {
      fetchVehicles();
      fetchServices();
    }
  }, [partnerId]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddVehicle = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setError("");

      await axios.post("http://localhost:5000/api/partner/vehicles", {
        ...form,
        partnerId,
        services: selectedServices
      });

      fetchVehicles();
      setForm({
        name: "",
        licensePlate: "",
        type: "",
        numberOfFloors: 1
      });
      setSelectedServices([]);

    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Lỗi thêm xe");
      }
    }
  };

  const validate = () => {
    const newErrors = {};

    // Name
    if (!form.name.trim()) {
      newErrors.name = "Vui lòng nhập tên xe";
    } else if (form.name.trim().length < 2) {
      newErrors.name = "Tên xe quá ngắn";
    }

    // License Plate (VN)
    if (!form.licensePlate.trim()) {
      newErrors.licensePlate = "Vui lòng nhập biển số";
    } else if (!/^[0-9]{2}[A-Z]-?[0-9]{4,5}$/.test(form.licensePlate)) {
      newErrors.licensePlate = "Biển số không hợp lệ (VD: 43A-12345)";
    }

    // Type
    if (!form.type.trim()) {
      newErrors.type = "Vui lòng nhập loại xe";
    }

    // Floors
    if (!form.numberOfFloors) {
      newErrors.numberOfFloors = "Vui lòng nhập số tầng";
    } else if (form.numberOfFloors < 1 || form.numberOfFloors > 2) {
      newErrors.numberOfFloors = "Chỉ hỗ trợ xe 1 hoặc 2 tầng";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  return (
    <Container fluid style={{ background: "#FFF8F0", minHeight: "100vh", padding: "30px" }}>

      <h2 className="mb-4" style={{ color: "#0C4A6E", fontWeight: "bold" }}>
        🚍 Đội xe của tôi
      </h2>

      <Row>
        {/* ===== FORM ===== */}
        {error && <div className="text-danger mb-2">{error}</div>}
        <Col md={4}>
          <Card className="shadow-sm mb-4" style={{ borderRadius: 16 }}>
            <Card.Header style={{ background: "#FF8C42", color: "white", borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
              <h5 className="mb-0">Thêm xe mới</h5>
            </Card.Header>

            <Card.Body>
              <Form noValidate onSubmit={handleAddVehicle}>
                <Form.Group className="mb-3">
                  <Form.Label>Tên xe</Form.Label>
                  <Form.Control
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    isInvalid={!!errors.name}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.name}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Biển số</Form.Label>
                  <Form.Control
                    name="licensePlate"
                    value={form.licensePlate}
                    onChange={handleChange}
                    isInvalid={!!errors.licensePlate}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.licensePlate}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Loại xe</Form.Label>
                  <Form.Control
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    isInvalid={!!errors.type}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.type}
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Số tầng</Form.Label>
                  <Form.Control
                    type="number"
                    name="numberOfFloors"
                    value={form.numberOfFloors}
                    onChange={handleChange}
                    isInvalid={!!errors.numberOfFloors}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.numberOfFloors}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* SERVICES */}
                <Form.Group className="mb-3">
                  <Form.Label>Tiện ích</Form.Label>
                  <div className="d-flex flex-wrap gap-2">
                    {services.map((s) => (
                      <Form.Check
                        key={s.id}
                        type="checkbox"
                        label={s.name}
                        value={s.id}
                        onChange={(e) => {
                          const value = Number(e.target.value);

                          if (e.target.checked) {
                            setSelectedServices([...selectedServices, value]);
                          } else {
                            setSelectedServices(selectedServices.filter(x => x !== value));
                          }
                        }}
                      />
                    ))}
                  </div>
                </Form.Group>

                <Button
                  type="submit"
                  className="w-100"
                  style={{
                    background: "#FF8C42",
                    border: "none",
                    fontWeight: "bold"
                  }}
                >
                  + Thêm xe
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* ===== LIST VEHICLES ===== */}
        <Col md={8}>
          {vehicles.length === 0 ? (
            <Card className="text-center p-4">
              <p>Chưa có xe nào.</p>
            </Card>
          ) : (
            <Row>
              {vehicles.map((vehicle) => (
                <Col md={6} key={vehicle.id} className="mb-4">
                  <Card
                    className="shadow-sm h-100"
                    style={{ borderRadius: 16 }}
                  >
                    <Card.Body>
                      <h5 style={{ color: "#0C4A6E", fontWeight: "bold" }}>
                        🚐 {vehicle.name}
                      </h5>

                      <p className="mb-1">
                        <strong>Biển số:</strong> {vehicle.licensePlate}
                      </p>

                      <p className="mb-1">
                        <strong>Loại xe:</strong> {vehicle.type}
                      </p>

                      <p className="mb-1">
                        <strong>Số tầng:</strong> {vehicle.numberOfFloors}
                      </p>

                      <p>
                        <strong>Trạng thái:</strong>{" "}
                        <Badge bg={vehicle.isActive ? "success" : "secondary"}>
                          {vehicle.isActive ? "Hoạt động" : "Ngưng"}
                        </Badge>
                      </p>

                      {/* SERVICES */}
                      <div className="mt-2">
                        <strong>Tiện ích:</strong>
                        <div className="d-flex flex-wrap gap-2 mt-1">
                          {vehicle.services && vehicle.services.length > 0 ? (
                            vehicle.services.map((s, i) => (
                              <Badge
                                key={i}
                                style={{
                                  background: "#0C4A6E",
                                  color: "white",
                                  padding: "6px 10px",
                                  borderRadius: 12
                                }}
                              >
                                {s}
                              </Badge>
                            ))
                          ) : (
                            <small className="text-muted">Không có</small>
                          )}
                        </div>
                      </div>

                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
}
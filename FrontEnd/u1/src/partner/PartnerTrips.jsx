import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Card, Table, Button, Badge } from "react-bootstrap";
import "../styles/PartnerTrips.css";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { FaBus, FaPlus, FaEdit, FaTrash, FaChair } from "react-icons/fa";

export default function PartnerTrips() {
  const [trips, setTrips] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [filterDays, setFilterDays] = useState([]);
  const [tripIdFilter, setTripIdFilter] = useState("");


  const weekDays = [
    { label: "T2", value: 1 },
    { label: "T3", value: 2 },
    { label: "T4", value: 3 },
    { label: "T5", value: 4 },
    { label: "T6", value: 5 },
    { label: "T7", value: 6 },
    { label: "CN", value: 0 }
  ];

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

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa chuyến này không?")) return;

    try {
      await axios.put(`http://localhost:5000/api/partner/trips/delete/${id}`);

      // reload lại list
      fetchTrips();
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTrips = trips.filter(trip => {
    const tripDate = new Date(trip.startTime);


    // filter theo ID
    if (tripIdFilter) {
      if (trip.id !== Number(tripIdFilter)) return false;
    }

    // filter theo ngày
    if (fromDate) {
      const from = new Date(fromDate);
      if (tripDate < from) return false;
    }

    if (toDate) {
      const to = new Date(toDate);
      to.setHours(23, 59, 59, 999);
      if (tripDate > to) return false;
    }

    // filter theo thứ
    if (filterDays.length > 0) {
      const dayOfWeek = tripDate.getDay(); // 0-6
      if (!filterDays.includes(dayOfWeek)) return false;
    }

    return true;
  });

  return (
    <Container fluid className="page-bg p-4">

      <Card className="shadow-sm border-0">
        <Card.Body>

          <div className="d-flex justify-content-between align-items-center mb-4">
            <h4 className="title">
              <FaBus className="me-2" />
              Danh sách chuyến xe
            </h4>

            <Button
              className="btn-add"
              onClick={() => navigate("/doi-tac/create-trip")}
            >
              <FaPlus className="me-1" />
              Thêm chuyến
            </Button>
          </div>
          <div className="row g-3 mb-3 align-items-end">

            <div className="col-md-2">
              <label>ID chuyến</label>
              <input
                type="number"
                className="form-control"
                value={tripIdFilter}
                onChange={(e) => setTripIdFilter(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label>Từ ngày</label>
              <input
                type="date"
                className="form-control"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </div>

            <div className="col-md-2">
              <label>Đến ngày</label>
              <input
                type="date"
                className="form-control"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label>Lọc theo thứ</label>
              <div className="d-flex flex-wrap gap-2 mt-2">
                {weekDays.map(day => (
                  <Button
                    key={day.value}
                    size="sm"
                    variant={filterDays.includes(day.value) ? "primary" : "outline-secondary"}
                    onClick={() => {
                      let updated = [...filterDays];
                      if (updated.includes(day.value)) {
                        updated = updated.filter(d => d !== day.value);
                      } else {
                        updated.push(day.value);
                      }
                      setFilterDays(updated);
                    }}
                  >
                    {day.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="col-md-2 d-flex">
              <Button
                className="w-100"
                variant="secondary"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                  setFilterDays([]);
                  setTripIdFilter("");
                }}
              >
                Reset
              </Button>
            </div>

          </div>

          {filteredTrips.length === 0 ? (
            <div className="text-center text-muted py-5">
              Không có chuyến phù hợp
            </div>
          ) : (
            <Table hover responsive>
              <thead className="table-head">
                <tr>
                  <th>ID</th>
                  <th>Tuyến</th>
                  <th>Xe</th>
                  <th>Khởi hành</th>
                  <th>Giá</th>
                  <th>Trạng thái</th>
                  <th>Hành động</th>
                </tr>
              </thead>

              <tbody>
                {[...filteredTrips]
                  .sort((a, b) => b.id - a.id)
                  .map(trip => (
                    <tr key={trip.id}>
                      <td>{trip.id}</td>

                      <td>{trip.routeName}</td>

                      <td>{trip.vehicleName}</td>

                      <td>
                        {new Date(trip.startTime).toLocaleString()}
                      </td>

                      <td className="price">
                        {trip.price.toLocaleString()} đ
                      </td>

                      <td>
                        <Badge
                          bg={trip.status === "INACTIVE" ? "danger" : "success"}
                        >
                          {trip.status}
                        </Badge>
                      </td>
                      <td>
                        <Button
                          size="sm"
                          variant="warning"
                          className="me-2"
                          onClick={() => navigate(`/doi-tac/edit-trip/${trip.id}`)}
                        >
                          <FaEdit className="me-1" />
                          Sửa
                        </Button>

                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(trip.id)}
                        >
                          <FaTrash className="me-1" />
                          Xóa
                        </Button>

                        <Button
                          size="sm"
                          variant="info"
                          onClick={() => navigate(`/doi-tac/trip-seats/${trip.id}`)}
                        >
                          <FaChair className="me-1" />
                          Ghế
                        </Button>
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

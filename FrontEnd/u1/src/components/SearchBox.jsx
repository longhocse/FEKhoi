import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function SearchBox({ defaultFrom, defaultTo, defaultDate }) {
  const navigate = useNavigate();

  const [from, setFrom] = useState(defaultFrom || "");
  const [to, setTo] = useState(defaultTo || "");
  const [date, setDate] = useState(defaultDate || "");

  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);

  const [loading, setLoading] = useState(false);

  // ✅ validation state
  const [errors, setErrors] = useState({});
  const [validated, setValidated] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // ===== Suggestion logic giữ nguyên =====
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (from.length < 2) {
        setFromSuggestions([]);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/api/suggestions?keyword=${from}`
        );
        setFromSuggestions(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [from]);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (to.length < 2) {
        setToSuggestions([]);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:5000/api/suggestions?keyword=${to}`
        );
        setToSuggestions(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [to]);

  // ===== Validate function =====
  const validateForm = () => {
    const newErrors = {};

    if (!from.trim()) newErrors.from = "Vui lòng nhập điểm đi";
    if (!to.trim()) newErrors.to = "Vui lòng nhập điểm đến";
    if (!date) newErrors.date = "Vui lòng chọn ngày";

    if (from && to && from.trim() === to.trim()) {
      newErrors.to = "Điểm đến phải khác điểm đi";
    }

    if (date && date < today) {
      newErrors.date = "Ngày đi không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSearch = async (e) => {
    e.preventDefault();
    setValidated(true);

    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await axios.get(
        "http://localhost:5000/api/search",
        {
          params: { from, to, date },
        }
      );

      navigate(`/tuyen-xe?from=${from}&to=${to}&date=${date}`, {
        state: { searchResults: response.data.data },
      });
    } catch (error) {
      console.error(error);
      alert("Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Form noValidate onSubmit={onSearch}>
          <Row className="g-3">

            {/* FROM */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Điểm đi</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập điểm đi (tỉnh/thành phố)..."
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  isInvalid={!!errors.from}
                  list="from-suggestions"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.from}
                </Form.Control.Feedback>

                <datalist id="from-suggestions">
                  {fromSuggestions.map((item, i) => (
                    <option key={i} value={item.value} />
                  ))}
                </datalist>
              </Form.Group>
            </Col>

            {/* TO */}
            <Col md={4}>
              <Form.Group>
                <Form.Label>Điểm đến</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập điểm đến (tỉnh/thành phố)..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  isInvalid={!!errors.to}
                  list="to-suggestions"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.to}
                </Form.Control.Feedback>

                <datalist id="to-suggestions">
                  {toSuggestions.map((item, i) => (
                    <option key={i} value={item.value} />
                  ))}
                </datalist>
              </Form.Group>
            </Col>

            {/* DATE */}
            <Col md={2}>
              <Form.Group>
                <Form.Label>Ngày đi</Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  isInvalid={!!errors.date}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.date}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* BUTTON */}
            <Col md={2} className="d-flex align-items-end">
              <Button
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? "Đang tìm..." : "Tìm chuyến"}
              </Button>
            </Col>

          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}
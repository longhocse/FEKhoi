import { Card, Row, Col, Form, Button, InputGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function SearchBox() {
  const navigate = useNavigate();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [fromSuggestions, setFromSuggestions] = useState([]);
  const [toSuggestions, setToSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Lấy gợi ý cho điểm đi
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (from.length < 2) {
        setFromSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/suggestions?keyword=${from}`);
        setFromSuggestions(response.data);
      } catch (error) {
        console.error('Lỗi lấy gợi ý:', error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [from]);

  // Lấy gợi ý cho điểm đến
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (to.length < 2) {
        setToSuggestions([]);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:5000/api/suggestions?keyword=${to}`);
        setToSuggestions(response.data);
      } catch (error) {
        console.error('Lỗi lấy gợi ý:', error);
      }
    };

    const debounce = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [to]);

  const onSearch = async (e) => {
    e.preventDefault();

    if (!from || !to || !date) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    setLoading(true);

    try {
      // Gọi API search-simple
      const response = await axios.get('http://localhost:5000/api/trips/search', {
        params: {
          from: from,
          to: to
          // Không dùng date vì đang test
        }
      });

      console.log('Kết quả tìm kiếm:', response.data);

      navigate('/tuyen-xe', {
        state: {
          searchResults: response.data.data,
          searchParams: { from, to, date }
        }
      });
    } catch (error) {
      console.error('Lỗi:', error);
      console.log(from, to);
      alert('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-sm border-0">
      <Card.Body>
        <Form onSubmit={onSearch}>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary mb-2">
                  <i className="bi bi-geo-alt-fill text-primary me-2" />
                  Điểm đi
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập điểm đi (tỉnh/thành phố)..."
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  required
                  list="from-suggestions"
                  autoComplete="off"
                />
                {fromSuggestions.length > 0 && (
                  <datalist id="from-suggestions">
                    {fromSuggestions.map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.label} ({item.type === 'province' ? 'Tỉnh' : 'Bến xe'})
                      </option>
                    ))}
                  </datalist>
                )}
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary mb-2">
                  <i className="bi bi-flag-fill text-primary me-2" />
                  Điểm đến
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Nhập điểm đến (tỉnh/thành phố)..."
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  required
                  list="to-suggestions"
                  autoComplete="off"
                />
                {toSuggestions.length > 0 && (
                  <datalist id="to-suggestions">
                    {toSuggestions.map((item, index) => (
                      <option key={index} value={item.value}>
                        {item.label} ({item.type === 'province' ? 'Tỉnh' : 'Bến xe'})
                      </option>
                    ))}
                  </datalist>
                )}
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label className="fw-bold text-secondary mb-2">
                  <i className="bi bi-calendar-event-fill text-primary me-2" />
                  Ngày đi
                </Form.Label>
                <Form.Control
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={today}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={2} className="d-flex align-items-end">
              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none'
                }}
              >
                <i className="bi bi-search me-2" />
                {loading ? 'Đang tìm...' : 'Tìm chuyến'}
              </Button>
            </Col>
          </Row>
        </Form>
      </Card.Body>
    </Card>
  );
}

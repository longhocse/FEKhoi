import { Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function RouteCard({ item }) {
  const navigate = useNavigate();

  const serviceIcons = {
    "Wifi": "bi-wifi",
    "Điều hòa": "bi-snow",
    "Chăn gối": "bi-moon-stars",
    "Cho phép thú cưng": "bi-emoji-smile",
    "Ổ cắm điện": "bi-plug",
    "Nước uống": "bi-cup-straw",
  };

  console.log('RouteCard nhận item:', item);

  const fromStation = item.fromStation || item.from || 'Không xác định';
  const toStation = item.toStation || item.to || 'Không xác định';
  const price = item.price || 0;

  // ĐÚNG: vehicleName là loại xe, companyName là nhà xe
  const vehicleType = item.vehicleName || item.vehicleType || item.vehicle || 'Xe khách';
  const companyName = item.companyName || item.company || 'Nhà xe BUSGO';

  const imageUrl = item.imageUrl || item.image || "/images/default-bus.jpg";
  const availableSeats = item.availableSeats || item.seatsAvailable || 0;
  const services = item.services || [];

  return (
    <Card className="soft-card h-100 overflow-hidden">
      <div
        style={{
          height: 140,
          backgroundImage: imageUrl
            ? `url(${imageUrl})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
        }}
      >
        {availableSeats < 10 && availableSeats > 0 && (
          <Badge
            bg="warning"
            text="dark"
            style={{
              position: 'absolute',
              top: 10,
              right: 10
            }}
          >
            Chỉ còn {availableSeats} chỗ
          </Badge>
        )}
      </div>

      <Card.Body>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="fw-bold fs-5">{fromStation} → {toStation}</div>
            <div className="text-muted small">
              <i className="bi bi-bus-front me-1"></i>
              {vehicleType}  {/* Loại xe: Xe giường nằm 40 chỗ */}
            </div>
            <div className="text-muted small mt-1">
              <i className="bi bi-building me-1"></i>
              {companyName}  {/* Nhà xe: Xe Phương Trang */}
            </div>
          </div>
        </div>

        <div className="mt-2">
          {services.length > 0 ? (
            <div className="d-flex flex-wrap gap-1">
              {services.slice(0, 4).map((s, index) => {
                const iconClass = serviceIcons[s.name] || "bi-check-circle";

                return (
                  <Badge
                    key={s.id || index}
                    bg="light"
                    text="dark"
                    className="border small"
                  >
                    <i className={`bi ${iconClass} me-1`}></i>
                    {s.name}
                  </Badge>
                );
              })}

              {services.length > 4 && (
                <Badge bg="secondary" className="small">
                  +{services.length - 4}
                </Badge>
              )}
            </div>
          ) : (
            <span className="text-muted small">Không có dịch vụ</span>
          )}
        </div>

        <div className="mt-2 mb-3 text-muted small">
          <i className="bi bi-clock me-1"></i>
          {item.startTime ? new Date(item.startTime).toLocaleString('vi-VN') : 'Đang cập nhật'}
        </div>

        <div className="d-flex align-items-center justify-content-between">
          <div>
            <span className="text-muted small">Giá vé</span>
            <div className="fw-bold text-primary-custom fs-5">
              {price.toLocaleString('vi-VN')}₫
            </div>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            className="pill px-3"
            onClick={() => navigate(`/tuyen-xe/${item.id}`)}
          >
            Chi tiết
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
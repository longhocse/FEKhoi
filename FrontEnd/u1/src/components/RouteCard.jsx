import { Card, Button, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function RouteCard({ item }) {
  const navigate = useNavigate();

  // Debug: xem dữ liệu nhận được
  console.log('RouteCard nhận item:', item);

  // Xử lý giá trị mặc định nếu thiếu dữ liệu
  const fromStation = item.fromStation || item.from || 'Không xác định';
  const toStation = item.toStation || item.to || 'Không xác định';
  const price = item.price || 0;
  const companyName = item.companyName || item.company || 'Nhà xe BUSGO';
  const vehicleName = item.vehicleName || item.vehicle || 'Xe khách';
  const imageUrl =
    item.imageUrl ||
    item.image ||
    item.vehicleImage ||
    "/images/default-bus.jpg";
  const availableSeats = item.availableSeats || item.seatsAvailable || 0;

  return (
    <Card className="soft-card h-100 overflow-hidden">
      {/* Ảnh xe */}
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
        {availableSeats < 10 && (
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
              {vehicleName} • {companyName}
            </div>
          </div>
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
            onClick={() => navigate(`/tuyen-xe/${item.id}`)} // Sửa thành id
          >
            Chi tiết
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}
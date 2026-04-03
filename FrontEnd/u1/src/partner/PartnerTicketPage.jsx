import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Badge, Container, Card } from "react-bootstrap";
import { Pagination } from "react-bootstrap";


export default function PartnerTicketsPage() {
  const [tickets, setTickets] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTickets = tickets.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(tickets.length / itemsPerPage);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/partner/tickets", {
          headers: {
            // nếu có auth thì mở dòng dưới
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        });

        setTickets(res.data.data || []);
      } catch (error) {
        console.error("❌ Lỗi lấy danh sách vé:", error);
      }
    };

    fetchTickets();
  }, []);

  return (
    <Container className="mt-4">
      <h2 className="mb-4 text-center" style={{ color: "#0C4A6E" }}>
        vé được đặt
      </h2>

      <Card className="shadow-sm">
        <Card.Body>
          <Table bordered hover responsive>

            {/* HEADER */}
            <thead style={{ backgroundColor: "#0C4A6E", color: "white" }}>
              <tr>
                <th>Mã vé</th>
                <th>Khách hàng</th>
                <th>Tuyến</th>
                <th>Giờ đi</th>
                <th>Giá</th>
                <th className="text-center">Trạng thái</th>
              </tr>
            </thead>

            {/* BODY */}
            <tbody>
              {currentTickets.map((t) => (
                <tr key={t.ticketId}>
                  <td><strong>#{t.ticketId}</strong></td>

                  <td>{t.customerName}</td>


                  <td>
                    {t.fromStation} → {t.toStation}
                  </td>

                  <td>
                    {new Date(t.startTime).toLocaleString()}
                  </td>

                  <td style={{ color: "#FF8C42", fontWeight: "bold" }}>
                    {t.totalAmount?.toLocaleString()} VND
                  </td>

                  <td className="text-center">
                    <StatusBadge status={t.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          <Pagination className="justify-content-center mt-3">

            {/* Prev */}
            <Pagination.Prev
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(currentPage - 1)}
            />

            {/* Page numbers */}
            {[...Array(totalPages)].map((_, index) => (
              <Pagination.Item
                key={index + 1}
                active={index + 1 === currentPage}
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Pagination.Item>
            ))}

            {/* Next */}
            <Pagination.Next
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(currentPage + 1)}
            />

          </Pagination>

          {tickets.length === 0 && (
            <div className="text-center text-muted py-3">
              Không có dữ liệu vé
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

function StatusBadge({ status }) {
  switch (status) {
    case "PAID":
      return <Badge bg="success">Đã thanh toán</Badge>;
    case "BOOKED":
      return <Badge bg="warning">Đã đặt</Badge>;
    case "USED":
      return <Badge bg="primary">Đã sử dụng</Badge>;
    case "CANCELLED":
      return <Badge bg="danger">Đã hủy</Badge>;
    default:
      return <Badge bg="secondary">{status}</Badge>;
  }
}
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form, Modal } from "react-bootstrap";

export default function PartnerRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [status, setStatus] = useState("ALL");

  const [showModal, setShowModal] = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [actionType, setActionType] = useState(""); // APPROVED | REJECTED

  useEffect(() => {
    fetchRefunds();
  }, [status]);

  const fetchRefunds = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/refunds/partner?status=${status}`,
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      setRefunds(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcess = async (id, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5000/api/refunds/partner/${id}/process`,
        { status: newStatus },
        {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        }
      );

      fetchRefunds();
    } catch (err) {
      console.error(err);
    }
  };

  const openConfirmModal = (refund, action) => {
    setSelectedRefund(refund);
    setActionType(action);
    setShowModal(true);
  };

  const confirmAction = async () => {
    if (!selectedRefund) return;

    await handleProcess(selectedRefund.id, actionType);

    setShowModal(false);
    setSelectedRefund(null);
  };


  return (
    <div className="container mt-4">
      <h3>Quản lý hoàn tiền</h3>

      {/* FILTER */}
      <div className="d-flex mb-3">
        <Form.Select
          style={{ width: 200 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
        </Form.Select>

        <Button className="ms-2" onClick={fetchRefunds}>
          Tìm kiếm
        </Button>
      </div>

      {/* TABLE */}
      <Table bordered hover>
        <thead>
          <tr>
            <th>ID</th>
            <th>Người dùng</th>
            <th>Vé</th>
            <th>Ghế</th>
            <th>Số tiền</th>
            <th>Lý do</th>
            <th>Trạng thái</th>
            <th>Thao tác</th>
          </tr>
        </thead>

        <tbody>
          {refunds.map((r) => (
            <tr key={r.id}>
              <td>#{r.id}</td>

              <td>
                {r.customerName || "N/A"}
                <br />
                <small>{r.customerEmail}</small>
              </td>

              <td>
                #{r.ticketId}
                <br />
                <small>{r.routeName}</small>
              </td>

              <td>
                <b>{r.seatName || "N/A"}</b>
              </td>

              <td style={{ color: "blue", fontWeight: "bold" }}>
                {r.amount?.toLocaleString()} đ
              </td>

              <td>{r.reason}</td>

              <td>
                {r.status === "PENDING" && (
                  <span className="badge bg-warning text-dark">
                    Chờ duyệt
                  </span>
                )}
                {r.status === "APPROVED" && (
                  <span className="badge bg-success">
                    Đã duyệt
                  </span>
                )}
                {r.status === "REJECTED" && (
                  <span className="badge bg-danger">
                    Từ chối
                  </span>
                )}
              </td>

              <td>
                <td>
                  {r.status === "PENDING" && (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => openConfirmModal(r, "APPROVED")}
                      >
                        Duyệt
                      </Button>{" "}

                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => openConfirmModal(r, "REJECTED")}
                      >
                        Từ chối
                      </Button>
                    </>
                  )}
                </td>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>


      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {actionType === "APPROVED"
              ? "Xác nhận duyệt hoàn tiền"
              : "Xác nhận từ chối hoàn tiền"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedRefund && (
            <>
              <p>
                Bạn có chắc muốn{" "}
                <b>
                  {actionType === "APPROVED" ? "DUYỆT" : "TỪ CHỐI"}
                </b>{" "}
                yêu cầu hoàn tiền này?
              </p>

              <ul>
                <li><b>ID:</b> #{selectedRefund.id}</li>
                <li><b>Khách:</b> {selectedRefund.customerName}</li>
                <li><b>Vé:</b> #{selectedRefund.ticketId}</li>
                <li><b>Số tiền:</b> {selectedRefund.amount?.toLocaleString()} đ</li>
              </ul>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Hủy
          </Button>

          <Button
            variant={actionType === "APPROVED" ? "success" : "danger"}
            onClick={confirmAction}
          >
            Xác nhận
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
import { useEffect, useState } from "react";
import axios from "axios";
import { Table, Button, Form } from "react-bootstrap";

export default function PartnerRefunds() {
  const [refunds, setRefunds] = useState([]);
  const [status, setStatus] = useState("PENDING");

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

              <td>{r.routeName}</td>

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
                {r.status === "PENDING" && (
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() =>
                        handleProcess(r.id, "APPROVED")
                      }
                    >
                      Duyệt
                    </Button>{" "}

                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        handleProcess(r.id, "REJECTED")
                      }
                    >
                      Từ chối
                    </Button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
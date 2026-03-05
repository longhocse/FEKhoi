import React, { useEffect, useState } from "react";
import axios from "axios";

function TicketManagement() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/admin/tickets");
      setTickets(res.data);
    } catch (error) {
      console.error("Lỗi lấy danh sách vé:", error);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      await axios.put(
        `http://localhost:5000/api/admin/tickets/${id}/status`,
        { status }
      );
      fetchTickets();
    } catch (error) {
      console.error("Lỗi cập nhật trạng thái:", error);
    }
  };

  return (
    <div className="container mt-4">
      <h3>Quản lý vé</h3>

      <table className="table table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Khách</th>
            <th>Tuyến</th>
            <th>Ghế</th>
            <th>Trạng thái</th>
            <th>Tổng tiền</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {tickets.map(ticket => (
            <tr key={ticket.id}>
              <td>{ticket.id}</td>
              <td>{ticket.passengerName}</td>
              <td>{ticket.fromStation} → {ticket.toStation}</td>
              <td>{ticket.seatName}</td>
              <td>{ticket.status}</td>
              <td>{ticket.totalAmount?.toLocaleString()} đ</td>
              <td>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => changeStatus(ticket.id, "CANCELLED")}
                >
                  Hủy vé
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TicketManagement;
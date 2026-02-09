import "./admin.css";

export default function AdminDashboard() {
  return (
    <>
      {/* CARDS */}
      <div className="admin-stats">
        <div className="card blue">
          <h3>1,248</h3>
          <p>Người dùng</p>
        </div>

        <div className="card green">
          <h3>42</h3>
          <p>Nhà xe</p>
        </div>

        <div className="card orange">
          <h3>356</h3>
          <p>Chuyến xe</p>
        </div>

        <div className="card red">
          <h3>128,000,000 ₫</h3>
          <p>Doanh thu</p>
        </div>
      </div>

      {/* TABLE */}
      <div className="admin-table">
        <h3>Vé đặt gần đây</h3>

        <table>
          <thead>
            <tr>
              <th>Mã vé</th>
              <th>Khách</th>
              <th>Tuyến</th>
              <th>Giá</th>
              <th>Trạng thái</th>
            </tr>
          </thead>

          <tbody>
            <tr>
              <td>#BK1023</td>
              <td>Nguyễn Văn A</td>
              <td>Hà Nội → Đà Nẵng</td>
              <td>350,000₫</td>
              <td><span className="badge success">Đã thanh toán</span></td>
            </tr>

            <tr>
              <td>#BK1024</td>
              <td>Trần Thị B</td>
              <td>HCM → Nha Trang</td>
              <td>280,000₫</td>
              <td><span className="badge warning">Chờ xử lý</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}

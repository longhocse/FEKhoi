const nodemailer = require("nodemailer");
require("dotenv").config();

// Tạo transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Hàm gửi email vé
const sendTicketEmail = async (to, ticket) => {
  try {

    const html = `
    <div style="font-family: Arial, sans-serif; background:#f4f6f8; padding:20px">

      <div style="max-width:600px;margin:auto;background:white;border-radius:10px;overflow:hidden;box-shadow:0 3px 10px rgba(0,0,0,0.1)">

        <!-- HEADER -->
        <div style="background:#007bff;color:white;padding:20px;text-align:center">
          <h1 style="margin:0"> BUSGO</h1>
          <p style="margin:5px 0 0 0">Hệ thống đặt vé xe trực tuyến</p>
        </div>

        <!-- CONTENT -->
        <div style="padding:20px">

          <h2 style="color:#333"> Xác nhận đặt vé thành công</h2>

          <p>Xin chào <b>${ticket.name}</b>,</p>
          <p>Cảm ơn bạn đã đặt vé tại <b>BUSGO</b>. Thông tin vé của bạn:</p>

          <table style="width:100%;border-collapse:collapse;margin-top:15px">

            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Mã vé</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">#${ticket.ticketId}</td>
            </tr>

            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Tuyến</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.route}</td>
            </tr>

            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Ngày khởi hành</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.date}</td>
            </tr>

            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Giờ khởi hành</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.time}</td>
            </tr>

            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Ghế</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.seat}</td>
            </tr>

            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Biển số xe</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.vehicle}</td>
            </tr>

            <!-- 🆕 Nhà xe (từ role partner) -->
            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Nhà xe</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.companyName || 'N/A'}</td>
            </tr>

            <!-- 🆕 SĐT nhà xe -->
            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>SĐT nhà xe</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.companyPhone || 'N/A'}</td>
            </tr>

            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Giá vé</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.price.toLocaleString()} VND</td>
            </tr>

            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Khách hàng</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.name}</td>
            </tr>

            <tr>
              <td style="padding:8px;border-bottom:1px solid #ddd"><b>Số điện thoại</b></td>
              <td style="padding:8px;border-bottom:1px solid #ddd">${ticket.phone}</td>
            </tr>

            <tr>
              <td style="padding:8px"><b>Email</b></td>
              <td style="padding:8px">${ticket.email}</td>
            </tr>

          </table>

          <hr style="margin:20px 0">

          <h3>📌 Lưu ý</h3>

          <p>1️⃣ Vui lòng có mặt trước giờ khởi hành <b>15 phút</b>.</p>
          <p>2️⃣ Nếu có sai sót hoặc không hài lòng vui lòng liên hệ <b>CSKH: 1900 1111</b>.</p>

        </div>

        <!-- FOOTER -->
        <div style="background:#f1f1f1;padding:15px;text-align:center;font-size:13px;color:#666">
          © 2026 BUSGO - Hệ thống đặt vé xe trực tuyến
        </div>

      </div>

    </div>
    `;

    await transporter.sendMail({
      from: `"BUSGO" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: " BUSGO - Xác nhận đặt vé",
      html: html
    });

    console.log("✅ Email gửi thành công:", to);

  } catch (err) {
    console.error("❌ Lỗi gửi email:", err);
  }
};

module.exports = sendTicketEmail;
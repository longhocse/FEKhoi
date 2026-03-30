const QRCode = require("qrcode");

async function createQR({ ticketId, verifyUrl }) {
    const data = {
        ticketId,
        verifyUrl
    };

    return await QRCode.toDataURL(JSON.stringify(data));
}

module.exports = { createQR };
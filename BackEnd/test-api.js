// test-api.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testWalletAPI() {
    console.log('🔍 BẮT ĐẦU KIỂM TRA API WALLET...');
    console.log('='.repeat(50));

    try {
        // 1. Đăng nhập để lấy token
        console.log('1. Đang đăng nhập...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'hung.dinh@gmail.com',
            password: '123456'
        });

        if (!loginRes.data.token) {
            console.log('❌ Không lấy được token');
            return;
        }

        const token = loginRes.data.token;
        console.log('✅ Đăng nhập thành công!');
        console.log('   Token:', token.substring(0, 20) + '...');

        // 2. Gọi API lấy thông tin ví
        console.log('\n2. Gọi API /wallets/me...');
        const walletRes = await axios.get(`${API_URL}/wallets/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Kết quả:', walletRes.data.success ? 'THÀNH CÔNG' : 'THẤT BẠI');

        if (walletRes.data.success && walletRes.data.data) {
            const wallet = walletRes.data.data;
            console.log('\n📊 THÔNG TIN VÍ:');
            console.log(`   - ID: ${wallet.id}`);
            console.log(`   - User ID: ${wallet.userId}`);
            console.log(`   - Số dư: ${wallet.balance?.toLocaleString()} ${wallet.currency}`);
            console.log(`   - Trạng thái: ${wallet.isLocked ? 'Đã khóa' : 'Hoạt động'}`);
            console.log(`   - Cập nhật: ${new Date(wallet.updatedAt).toLocaleString()}`);
        } else {
            console.log('❌ Không có dữ liệu ví:', walletRes.data);
        }

        // 3. Gọi API lấy lịch sử giao dịch
        console.log('\n3. Gọi API /wallets/transactions...');
        const transRes = await axios.get(`${API_URL}/wallets/transactions`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        console.log('✅ Kết quả:', transRes.data.success ? 'THÀNH CÔNG' : 'THẤT BẠI');

        if (transRes.data.success && transRes.data.data) {
            const transactions = transRes.data.data;
            console.log(`   - Số giao dịch: ${transactions.length}`);

            if (transactions.length > 0) {
                console.log('\n   GIAO DỊCH GẦN NHẤT:');
                transactions.slice(0, 3).forEach((t, i) => {
                    console.log(`   ${i + 1}. ${t.type}: ${t.amount?.toLocaleString()} VND - ${t.status}`);
                });
            }
        }

        console.log('\n' + '='.repeat(50));
        console.log('✅ KIỂM TRA HOÀN TẤT!');

    } catch (error) {
        console.log('\n❌ LỖI:');
        if (error.response) {
            // Lỗi từ server
            console.log(`   Status: ${error.response.status}`);
            console.log(`   Data:`, error.response.data);
        } else if (error.request) {
            // Không nhận được response
            console.log(`   Không thể kết nối đến server`);
            console.log(`   Kiểm tra: http://localhost:5000 có chạy không?`);
        } else {
            // Lỗi khác
            console.log(`   Message: ${error.message}`);
        }
    }
}

testWalletAPI();
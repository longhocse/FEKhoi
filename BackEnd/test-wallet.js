// test-wallet.js
const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

async function testWallet() {
    try {
        // 1. Đăng nhập
        console.log('1. Đang đăng nhập...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'customer@busgo.vn',
            password: '123456'
        });

        const token = loginRes.data.token;
        console.log('✅ Đăng nhập thành công!');

        // 2. Lấy thông tin ví
        console.log('\n2. Lấy thông tin ví...');
        const walletRes = await axios.get(`${API_URL}/wallets/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (walletRes.data.success) {
            console.log('✅ Thông tin ví:');
            console.log('   - ID:', walletRes.data.data.id);
            console.log('   - User ID:', walletRes.data.data.userId);
            console.log('   - Số dư:', walletRes.data.data.balance?.toLocaleString(), walletRes.data.data.currency);
            console.log('   - Trạng thái:', walletRes.data.data.isLocked ? 'Đã khóa' : 'Hoạt động');
        }

        // 3. Lấy lịch sử giao dịch
        console.log('\n3. Lấy lịch sử giao dịch...');
        const transRes = await axios.get(`${API_URL}/wallets/transactions`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (transRes.data.success) {
            console.log(`✅ Có ${transRes.data.data.length} giao dịch`);
            if (transRes.data.data.length > 0) {
                console.log('   Giao dịch gần nhất:');
                const t = transRes.data.data[0];
                console.log(`   - ${t.type}: ${t.amount?.toLocaleString()} VND - ${t.status}`);
            }
        }

    } catch (error) {
        console.error('❌ Lỗi:', error.response?.data || error.message);
    }
}

testWallet();
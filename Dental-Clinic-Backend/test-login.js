// Test login for admin account
const axios = require('axios');

const testLogin = async () => {
  try {
    console.log('🔍 Testing login for admin@healthcare.vn...');

    const response = await axios.post('http://localhost:3000/accounts/login', {
      email: 'admin@healthcare.vn',
      password: 'admin123'
    }, {
      withCredentials: true
    });

    console.log('✅ Login successful!');
    console.log('📊 Response:', response.data);

  } catch (error) {
    console.log('❌ Login failed:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Message:', error.response.data.message);
    } else {
      console.log('Error:', error.message);
    }
  }
};

testLogin();
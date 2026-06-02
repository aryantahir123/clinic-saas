const http = require('http');

const testRegister = () => {
  const payload = JSON.stringify({
    name: "Umiar",
    email: "umair99@example.com",
    phone: "03001234567",
    password: "password123",
    role: "patient"
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  const req = http.request(options, (res) => {
    console.log('Response Status:', res.statusCode);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => { console.log('Response Data:', data); });
  });

  req.on('error', (error) => {
    console.error('❌ Request Error:', error.message);
  });

  req.write(payload);
  req.end();
};

testRegister();

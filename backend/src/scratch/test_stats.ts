
import axios from 'axios';

async function testStats() {
    try {
        // We need a token. Let's try to login as the admin we found.
        const loginRes = await axios.post('http://localhost:3001/auth/login', {
            email: 'shivamatangulu41@gmail.com',
            password: 'password123' // Guessing password or need to find it
        });
        
        const token = loginRes.data.token;
        console.log('Logged in, token obtained');
        
        const statsRes = await axios.get('http://localhost:3001/admin/stats', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('Stats:', statsRes.data);
    } catch (error: any) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

testStats();

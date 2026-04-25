
async function testDelete() {
    try {
        console.log('Logging in...');
        const loginRes = await fetch('http://127.0.0.1:3001/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'shivamatangulu41@gmail.com',
                password: 'password123'
            })
        });
        
        const loginData: any = await loginRes.json();
        if (!loginRes.ok) {
            console.error('Login failed:', loginData);
            return;
        }
        
        const token = loginData.token;
        console.log('Logged in successfully, token obtained.');
        
        const targetId = '4db5eda5-9d41-4337-8f12-1aeeaedfc186';
        
        console.log(`Attempting to delete user ${targetId}...`);
        const delRes = await fetch(`http://127.0.0.1:3001/admin/users/${targetId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const delData = await delRes.json();
        console.log('Delete Result Status:', delRes.status);
        console.log('Delete Result Body:', delData);
    } catch (error: any) {
        console.error('Error:', error.message);
    }
}

testDelete();

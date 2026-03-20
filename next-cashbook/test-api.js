const BASE_URL = 'http://localhost:5173/api';

async function testAuth() {
  console.log('--- Testing /api/auth/signup ---');
  const signupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test User 3',
      phone: '1234567890',
      password: 'Password123'
    }),
  });
  
  const signupData = await signupRes.json();
  console.log('Signup Status:', signupRes.status);
  console.log('Signup Response:', signupData);
  
  // Extract token from cookies or response body if any
  const cookies = signupRes.headers.get('set-cookie');
  console.log('Set-Cookie Header:', cookies);
  
  // Let's test login as well
  console.log('\n--- Testing /api/auth/login ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '1234567890',
      password: 'Password123'
    }),
  });
  
  const loginData = await loginRes.json();
  console.log('Login Status:', loginRes.status);
  console.log('Login Response:', loginData);
  
  const loginCookies = loginRes.headers.get('set-cookie');
  console.log('Set-Cookie Header on Login:', loginCookies);
  
  // Now test accounts
  console.log('\\n--- Testing GET /api/accounts ---');
  const accountsRes = await fetch(`${BASE_URL}/accounts`, {
    headers: { 'Cookie': loginCookies },
  });
  const accountsData = await accountsRes.json();
  console.log('Accounts Status:', accountsRes.status);
  console.log('Accounts Response:', accountsData);
  
  return loginCookies;
}

testAuth()
  .then(() => console.log('Done testing auth'))
  .catch(err => console.error(err));

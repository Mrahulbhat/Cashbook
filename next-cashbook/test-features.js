const BASE_URL = 'http://localhost:5173/api';

async function testFeatures() {
  console.log('--- Logging in ---');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      phone: '1234567890',
      password: 'Password123'
    }),
  });
  const loginCookies = loginRes.headers.get('set-cookie');
  
  if (!loginCookies) throw new Error('No cookie received');

  const headers = {
    'Content-Type': 'application/json',
    'Cookie': loginCookies
  };

  console.log('\\n--- Creating Account ---');
  const accRes = await fetch(`${BASE_URL}/accounts`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Cash',
      balance: 1000,
      description: 'Default cash account'
    })
  });
  const accData = await accRes.json();
  console.log('Create Account Status:', accRes.status);
  console.log('Account Data:', accData);

  let accountId = accData?._id;

  console.log('\\n--- Creating Category ---');
  const catRes = await fetch(`${BASE_URL}/categories`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Food',
      type: 'expense',
      color: '#ff0000',
      icon: 'fast-food'
    })
  });
  const catData = await catRes.json();
  console.log('Create Category Status:', catRes.status);
  console.log('Category Data:', catData);

  let categoryId = catData?._id || catData?.category?._id;

  if (accountId && categoryId) {
    console.log('\\n--- Creating Transaction ---');
    const txRes = await fetch(`${BASE_URL}/transactions`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        account: accountId,
        category: categoryId,
        amount: 50,
        type: 'expense',
        date: new Date().toISOString(),
        description: 'Lunch'
      })
    });
    console.log('Create Transaction Status:', txRes.status);
    console.log('Transaction Data:', await txRes.json());

    // Check account balance updated
    console.log('\\n--- Checking Account Balance ---');
    const accListRes = await fetch(`${BASE_URL}/accounts`, { headers });
    console.log('Accounts:', await accListRes.json());
  }
}

testFeatures().then(() => console.log('Done')).catch(console.error);

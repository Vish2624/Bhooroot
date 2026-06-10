(async () => {
  const fetch = globalThis.fetch || (await import('node-fetch')).default;
  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6InRlc3RfdXNlcl8xIiwiaWF0IjoxNzgwMTM4OTQ1fQ.0pCZgXZaGw9pLZPDNKa4wDgD62QdO8f6R18x10YvF1o';
  const sig = '82d01f1cadff21478d7838830128da3cf98abcd8e06da05b2c814492b13e8f2e';
  const body = {
    razorpay_order_id: 'order_test_123',
    razorpay_payment_id: 'pay_test_456',
    razorpay_signature: sig,
    orderId: 'localOrder1'
  };

  try {
    const res = await fetch('http://127.0.0.1:5000/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });
    const text = await res.text();
    console.log('STATUS', res.status);
    console.log('BODY');
    console.log(text);
  } catch (err) {
    console.error('Request failed', err);
  }
})();

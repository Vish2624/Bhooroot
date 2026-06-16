const crypto = require('crypto');
// Minimal JWT creation without external libs
const razorSecret = 'your_razorpay_key_secret_here';
const jwtSecret = 'replace_with_a_long_random_secret_string_here';

const orderId = 'order_test_123';
const paymentId = 'pay_test_456';

const signature = crypto.createHmac('sha256', razorSecret).update(`${orderId}|${paymentId}`).digest('hex');

function base64url(input) {
	return Buffer.from(JSON.stringify(input)).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const header = { alg: 'HS256', typ: 'JWT' };
const payload = { id: 'test_user_1', iat: Math.floor(Date.now() / 1000) };
const signingInput = base64url(header) + '.' + base64url(payload);
const sig = crypto.createHmac('sha256', jwtSecret).update(signingInput).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
const token = signingInput + '.' + sig;

console.log('RAZOR_SIGNATURE=' + signature);
console.log('TEST_JWT=' + token);

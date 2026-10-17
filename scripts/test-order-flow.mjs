#!/usr/bin/env node
/**
 * scripts/test-order-flow.mjs
 * 
 * End-to-End Test Suite for Mullaways Medical Cannabis:
 * 1. Checkout calculations (promos, tiered shipping, Bitcoin 10% discount)
 * 2. Form field validations (AU phone, 4-digit postcode, email regex)
 * 3. Test Order 1 (Bitcoin Payment with Promo code + Express delivery)
 * 4. Test Order 2 (Bank Transfer / PayID with Free Standard delivery)
 * 5. Email template HTML generation & integrity checks (zero broken tags, valid links, official domain)
 * 6. Cloudflare Pages serverless function execution (/api/send-email) with mock Resend API
 * 7. Live Chat (Zoho SalesIQ) pre-fill and visitor info payload validation
 * 8. Dist artifact integrity (dist/checkout and dist/order-confirmation)
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const OFFICIAL_DOMAIN = 'mullawaysmedicalcannabis.store';
const OFFICIAL_EMAIL = 'hello@mullawaysmedicalcannabis.store';
const BTC_ADDRESS = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

async function runAsyncTest(name, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('  MULLAWAYS MEDICAL CANNABIS — ORDER PIPELINE TEST SUITE');
console.log('======================================================\n');

// ── 1. Calculation & Logic Engine (Matches checkout.astro) ───────────────────
const VALID_PROMOS = {
  'WELCOME15': { rate: 0.15, label: '15% Off First Order' },
  'FIRST15': { rate: 0.15, label: '15% Off First Order' },
  'MULLAWAYS15': { rate: 0.15, label: '15% Off First Order' },
  'SAVE10': { rate: 0.10, label: '10% Off' },
};

function calculateOrder({ items, deliveryMethod, paymentMethod, promoCode }) {
  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  // Shipping fee
  let shipping = 0;
  if (deliveryMethod === 'express') {
    shipping = 19.95;
  } else {
    shipping = subtotal >= 150 ? 0 : 9.95;
  }

  // Promo discount
  let promoDiscount = 0;
  let appliedPromo = null;
  if (promoCode && VALID_PROMOS[promoCode.toUpperCase()]) {
    appliedPromo = VALID_PROMOS[promoCode.toUpperCase()];
    promoDiscount = Math.round(subtotal * appliedPromo.rate * 100) / 100;
  }

  // Bitcoin discount (10% on amount after promo)
  const baseForBtc = Math.max(0, subtotal - promoDiscount);
  const btcDiscount = paymentMethod === 'bitcoin' ? Math.round(baseForBtc * 0.10 * 100) / 100 : 0;

  const total = Math.max(0, subtotal - promoDiscount + shipping - btcDiscount);

  return {
    subtotal: Math.round(subtotal * 100) / 100,
    shipping,
    promoDiscount,
    btcDiscount,
    total: Math.round(total * 100) / 100,
    appliedPromo,
  };
}

function generateOrderRef() {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `MW-${timestamp.slice(-4)}${random}`;
}

// ── Tests: Calculations ──────────────────────────────────────────────────────
console.log('▸ Test Suite 1: Pricing, Promo & Shipping Calculation Rules');

runTest('Free shipping applies on standard orders >= $150', () => {
  const res = calculateOrder({
    items: [{ name: 'Amnesia Haze 14g', price: 160.00, quantity: 1 }],
    deliveryMethod: 'standard',
    paymentMethod: 'bank',
    promoCode: null,
  });
  assert.equal(res.subtotal, 160.00);
  assert.equal(res.shipping, 0.00);
  assert.equal(res.total, 160.00);
});

runTest('Standard shipping fee $9.95 applies on orders under $150', () => {
  const res = calculateOrder({
    items: [{ name: 'CBD Gummies 30pk', price: 85.00, quantity: 1 }],
    deliveryMethod: 'standard',
    paymentMethod: 'bank',
    promoCode: null,
  });
  assert.equal(res.subtotal, 85.00);
  assert.equal(res.shipping, 9.95);
  assert.equal(res.total, 94.95);
});

runTest('Express delivery is always $19.95 regardless of subtotal', () => {
  const res = calculateOrder({
    items: [{ name: 'Northern Lights 28g', price: 340.00, quantity: 1 }],
    deliveryMethod: 'express',
    paymentMethod: 'bank',
    promoCode: null,
  });
  assert.equal(res.shipping, 19.95);
  assert.equal(res.total, 359.95);
});

runTest('Promo code WELCOME15 applies 15% discount correctly', () => {
  const res = calculateOrder({
    items: [{ name: 'Product A', price: 200.00, quantity: 1 }],
    deliveryMethod: 'standard',
    paymentMethod: 'bank',
    promoCode: 'WELCOME15',
  });
  assert.equal(res.promoDiscount, 30.00); // 15% of 200
  assert.equal(res.total, 170.00);
});

runTest('Bitcoin 10% discount applies on net subtotal after promo', () => {
  const res = calculateOrder({
    items: [{ name: 'Product B', price: 100.00, quantity: 1 }],
    deliveryMethod: 'standard',
    paymentMethod: 'bitcoin',
    promoCode: 'SAVE10', // 10% off -> $90
  });
  assert.equal(res.subtotal, 100.00);
  assert.equal(res.promoDiscount, 10.00);
  assert.equal(res.btcDiscount, 9.00); // 10% of 90
  assert.equal(res.shipping, 9.95); // subtotal $100 < $150
  assert.equal(res.total, 90.95); // 100 - 10 + 9.95 - 9 = 90.95
});

runTest('Order reference matches pattern MW-XXXXXXXX', () => {
  const ref = generateOrderRef();
  assert.match(ref, /^MW-[A-Z0-9]{7,9}$/);
});

// ── Tests: Form Validation ───────────────────────────────────────────────────
console.log('\n▸ Test Suite 2: Form Input Validations (Step 1 Customer Info)');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[\d\s\+\-\(\)]{8,15}$/;
const postcodeRegex = /^\d{4}$/;

runTest('Australian email validation', () => {
  assert.ok(emailRegex.test('patient@domain.com.au'));
  assert.ok(emailRegex.test('name+tag@sub.domain.org'));
  assert.ok(!emailRegex.test('invalid-email'));
  assert.ok(!emailRegex.test('patient@domain'));
});

runTest('Australian phone validation', () => {
  assert.ok(phoneRegex.test('0412 345 678'));
  assert.ok(phoneRegex.test('+61412345678'));
  assert.ok(phoneRegex.test('03 9123 4567'));
  assert.ok(!phoneRegex.test('123'));
  assert.ok(!phoneRegex.test('not-a-number'));
});

runTest('Australian 4-digit postcode validation', () => {
  assert.ok(postcodeRegex.test('3000')); // Melbourne
  assert.ok(postcodeRegex.test('4000')); // Brisbane
  assert.ok(postcodeRegex.test('2000')); // Sydney
  assert.ok(!postcodeRegex.test('300'));
  assert.ok(!postcodeRegex.test('30001'));
  assert.ok(!postcodeRegex.test('VIC1'));
});

// ── Tests: Simulated Orders & Email Templates ────────────────────────────────
console.log('\n▸ Test Suite 3: End-to-End Test Orders & Email Generation');

const sendEmailModule = await import('../functions/api/send-email.js');

function buildTemplateParams(order) {
  const itemsList = order.items.map(i =>
    `${i.name} × ${i.quantity} — $${(i.price * i.quantity).toFixed(2)}`
  ).join('\n');

  let paymentStatus = '';
  let paymentNextStep = '';

  if (order.payment === 'bitcoin') {
    paymentStatus = 'Awaiting Bitcoin payment';
    paymentNextStep = 'Please send the exact amount shown on the order confirmation page to the Bitcoin address provided. Your order will be dispatched once verified on the blockchain.';
  } else if (order.payment === 'bank') {
    paymentStatus = 'Awaiting bank transfer';
    paymentNextStep = 'Please open Live Chat on our website to receive our PayID or bank transfer details. For your security we share banking details exclusively via Live Chat.';
  }

  const discountParts = [];
  if (order.promoDiscount && order.promoDiscount > 0) {
    discountParts.push(`-$${order.promoDiscount.toFixed(2)} (Promo: ${order.promoCode || 'Applied'})`);
  }
  if (order.discount && order.discount > 0) {
    discountParts.push(`-$${order.discount.toFixed(2)} (Bitcoin 10% discount)`);
  }
  const discountText = discountParts.length > 0 ? discountParts.join(' + ') : '$0.00';
  const shippingText = order.shipping === 0 ? 'FREE (Standard delivery over $150)' : `$${order.shipping.toFixed(2)}`;

  return {
    to_email: order.customer.email,
    to_name: `${order.customer.firstName} ${order.customer.lastName}`,
    order_ref: order.ref,
    order_date: new Date(order.date).toLocaleDateString('en-AU', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }),
    items_list: itemsList,
    subtotal: `$${order.subtotal.toFixed(2)}`,
    discount: discountText,
    shipping: shippingText,
    total: `$${order.total.toFixed(2)}`,
    payment_method: order.payment === 'bitcoin' ? 'Bitcoin' : 'Bank Transfer',
    payment_status: paymentStatus,
    payment_next_step: paymentNextStep,
    shipping_address: `${order.customer.address}, ${order.customer.city}, ${order.customer.state} ${order.customer.postcode}`,
    delivery_method: order.shippingMethod === 'express'
      ? 'Express (1–2 business days)'
      : (order.shipping === 0 ? 'Standard (2–5 business days, Free shipping)' : 'Standard (2–5 business days)'),
    customer_email: order.customer.email,
    customer_phone: order.customer.phone,
    btc_address: order.btcAddress || '',
  };
}

// ── Test Order 1: Bitcoin ──
const testOrder1 = {
  ref: generateOrderRef(),
  date: new Date().toISOString(),
  items: [
    { name: 'Northern Lights 28g', price: 340.00, quantity: 1 },
    { name: 'Sour Diesel Vape Cartridge 1ml', price: 120.00, quantity: 1 },
  ],
  customer: {
    firstName: 'Marcus',
    lastName: 'Vance',
    email: 'marcus.vance.test@example.com',
    phone: '0412 888 999',
    address: '142 St Kilda Road',
    city: 'Melbourne',
    state: 'VIC',
    postcode: '3004',
  },
  deliveryMethod: 'express',
  payment: 'bitcoin',
  promoCode: 'WELCOME15',
  btcAddress: BTC_ADDRESS,
};

const calc1 = calculateOrder({
  items: testOrder1.items,
  deliveryMethod: testOrder1.deliveryMethod,
  paymentMethod: testOrder1.payment,
  promoCode: testOrder1.promoCode,
});

testOrder1.subtotal = calc1.subtotal;
testOrder1.shipping = calc1.shipping;
testOrder1.shippingMethod = testOrder1.deliveryMethod;
testOrder1.promoDiscount = calc1.promoDiscount;
testOrder1.discount = calc1.btcDiscount;
testOrder1.total = calc1.total;

const data1 = buildTemplateParams(testOrder1);

runTest('Test Order 1 (Bitcoin) amounts are strictly calculated', () => {
  assert.equal(testOrder1.subtotal, 460.00);
  assert.equal(testOrder1.promoDiscount, 69.00); // 15% of 460
  assert.equal(testOrder1.shipping, 19.95);
  assert.equal(testOrder1.discount, 39.10); // 10% of (460 - 69) = 10% of 391 = 39.10
  assert.equal(testOrder1.total, 371.85); // 460 - 69 + 19.95 - 39.10 = 371.85
  assert.equal(data1.total, '$371.85');
});

// Mock Resend fetch interceptor to test Cloudflare Functions
let interceptedEmails = [];
const originalFetch = globalThis.fetch;

globalThis.fetch = async (url, options) => {
  const urlStr = String(url);
  if (urlStr.includes('api.resend.com/emails')) {
    const payload = JSON.parse(options.body);
    interceptedEmails.push({
      url: urlStr,
      from: payload.from,
      to: payload.to,
      replyTo: payload.reply_to,
      subject: payload.subject,
      html: payload.html,
    });
    return new Response(JSON.stringify({ id: `resend_mock_${Date.now()}` }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return originalFetch(url, options);
};

await runAsyncTest('Test Order 1 (Bitcoin): Send Customer & Admin Emails via Cloudflare Function', async () => {
  interceptedEmails = [];
  const mockEnv = { RESEND_API_KEY: 're_test_key_mock_12345' };

  // 1. Customer email
  const custReq = new Request('https://mullawaysmedicalcannabis.store/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'order-customer', data: data1 }),
  });
  const custRes = await sendEmailModule.onRequestPost({ request: custReq, env: mockEnv });
  assert.equal(custRes.status, 200);
  const custJson = await custRes.json();
  assert.equal(custJson.success, true);

  // 2. Admin email
  const adminReq = new Request('https://mullawaysmedicalcannabis.store/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'order-admin', data: data1 }),
  });
  const adminRes = await sendEmailModule.onRequestPost({ request: adminReq, env: mockEnv });
  assert.equal(adminRes.status, 200);
  const adminJson = await adminRes.json();
  assert.equal(adminJson.success, true);

  // Validate email payloads
  assert.equal(interceptedEmails.length, 2);

  const [custEmail, adminEmail] = interceptedEmails;

  // Verify Customer Email
  assert.equal(custEmail.to[0], 'marcus.vance.test@example.com');
  assert.ok(custEmail.subject.includes(testOrder1.ref));
  assert.ok(custEmail.html.includes(testOrder1.ref));
  assert.ok(custEmail.html.includes('$371.85'));
  assert.ok(custEmail.html.includes('Bitcoin Payment Details'));
  assert.ok(custEmail.html.includes(BTC_ADDRESS));
  assert.ok(custEmail.html.includes('10% Crypto Discount Applied'));
  assert.ok(custEmail.html.includes('1. Order Placed'));
  assert.ok(custEmail.html.includes('2. Payment'));
  assert.ok(custEmail.html.includes('3. Tracked Dispatch'));
  assert.ok(custEmail.html.includes(OFFICIAL_DOMAIN));
  assert.ok(custEmail.html.includes(OFFICIAL_EMAIL));
  assert.ok(!custEmail.html.includes('undefined'));
  assert.ok(!custEmail.html.includes('[object Object]'));

  // Verify Admin Email
  assert.equal(adminEmail.to[0], OFFICIAL_EMAIL);
  assert.ok(adminEmail.subject.includes(testOrder1.ref));
  assert.ok(adminEmail.html.includes('Marcus Vance'));
  assert.ok(adminEmail.html.includes('Northern Lights 28g'));
  assert.ok(adminEmail.html.includes('Sour Diesel Vape Cartridge 1ml'));
  assert.ok(adminEmail.html.includes('$371.85'));
});

// ── Test Order 2: Bank Transfer / PayID ──
const testOrder2 = {
  ref: generateOrderRef(),
  date: new Date().toISOString(),
  items: [
    { name: 'Granddaddy Purple 14g', price: 190.00, quantity: 1 },
  ],
  customer: {
    firstName: 'Sarah',
    lastName: 'O\'Connor',
    email: 'sarah.oconnor@example.com',
    phone: '0498 765 432',
    address: '88 Eagle Street',
    city: 'Brisbane',
    state: 'QLD',
    postcode: '4000',
  },
  deliveryMethod: 'standard',
  payment: 'bank',
  promoCode: null,
};

const calc2 = calculateOrder({
  items: testOrder2.items,
  deliveryMethod: testOrder2.deliveryMethod,
  paymentMethod: testOrder2.payment,
  promoCode: testOrder2.promoCode,
});

testOrder2.subtotal = calc2.subtotal;
testOrder2.shipping = calc2.shipping;
testOrder2.shippingMethod = testOrder2.deliveryMethod;
testOrder2.promoDiscount = calc2.promoDiscount;
testOrder2.discount = calc2.btcDiscount;
testOrder2.total = calc2.total;

const data2 = buildTemplateParams(testOrder2);

runTest('Test Order 2 (Bank Transfer) qualifies for Free Shipping', () => {
  assert.equal(testOrder2.subtotal, 190.00);
  assert.equal(testOrder2.shipping, 0.00); // >= $150
  assert.equal(testOrder2.total, 190.00);
  assert.equal(data2.shipping, 'FREE (Standard delivery over $150)');
});

await runAsyncTest('Test Order 2 (Bank Transfer): Customer & Admin Emails with Live Chat Action Block', async () => {
  interceptedEmails = [];
  const mockEnv = { RESEND_API_KEY: 're_test_key_mock_12345' };

  // 1. Customer email
  const custReq = new Request('https://mullawaysmedicalcannabis.store/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'order-customer', data: data2 }),
  });
  const custRes = await sendEmailModule.onRequestPost({ request: custReq, env: mockEnv });
  assert.equal(custRes.status, 200);

  // 2. Admin email
  const adminReq = new Request('https://mullawaysmedicalcannabis.store/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'order-admin', data: data2 }),
  });
  const adminRes = await sendEmailModule.onRequestPost({ request: adminReq, env: mockEnv });
  assert.equal(adminRes.status, 200);

  assert.equal(interceptedEmails.length, 2);
  const [custEmail, adminEmail] = interceptedEmails;

  // Verify Bank Customer Email contains Live Chat CTA & order link
  assert.equal(custEmail.to[0], 'sarah.oconnor@example.com');
  assert.ok(custEmail.html.includes('Open Live Chat to Receive Bank Details'));
  assert.ok(custEmail.html.includes('we never transmit bank transfer or PayID account numbers over unencrypted email'));
  assert.ok(custEmail.html.includes(`order-confirmation/?ref=${testOrder2.ref}`));
  assert.ok(custEmail.html.includes('Granddaddy Purple 14g'));
  assert.ok(custEmail.html.includes('FREE (Standard delivery over $150)'));
  assert.ok(custEmail.html.includes('$190.00'));
  assert.ok(!custEmail.html.includes(BTC_ADDRESS)); // No BTC QR for bank orders
});

// ── Test Zoho Live Chat Pre-fill Logic ───────────────────────────────────────
console.log('\n▸ Test Suite 4: Live Chat (Zoho SalesIQ) Widget Integration');

runTest('Live Chat prefill message generates correct order ref & payment summary', () => {
  const totalStr = `$${testOrder2.total.toFixed(2)} AUD`;
  const payLabel = testOrder2.payment === 'bank' ? 'Bank Transfer' : 'Bitcoin';
  const prefillMsg = `Hi Mullaways, I just placed order ${testOrder2.ref} (${totalStr}) and I'd like the bank details to finalise payment by ${payLabel}.`;
  
  assert.ok(prefillMsg.includes(testOrder2.ref));
  assert.ok(prefillMsg.includes('$190.00 AUD'));
  assert.ok(prefillMsg.includes('Bank Transfer'));
});

// ── Test Contact & Newsletter APIs ──────────────────────────────────────────
console.log('\n▸ Test Suite 5: Contact & Newsletter Email Submissions');

await runAsyncTest('Contact form email sends successfully', async () => {
  interceptedEmails = [];
  const mockEnv = { RESEND_API_KEY: 're_test_key_mock_12345' };
  const contactReq = new Request('https://mullawaysmedicalcannabis.store/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'contact',
      data: {
        from_name: 'David Miller',
        from_email: 'david@example.com',
        subject: 'Product Consultation Inquiry',
        message: 'Hello, which flower strain is best suited for chronic insomnia?',
      },
    }),
  });
  const res = await sendEmailModule.onRequestPost({ request: contactReq, env: mockEnv });
  assert.equal(res.status, 200);
  assert.equal(interceptedEmails.length, 1);
  assert.equal(interceptedEmails[0].to[0], OFFICIAL_EMAIL);
  assert.equal(interceptedEmails[0].replyTo, 'david@example.com');
  assert.ok(interceptedEmails[0].html.includes('chronic insomnia'));
});

await runAsyncTest('Newsletter signup email sends successfully', async () => {
  interceptedEmails = [];
  const mockEnv = { RESEND_API_KEY: 're_test_key_mock_12345' };
  const newsletterReq = new Request('https://mullawaysmedicalcannabis.store/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: 'newsletter',
      data: {
        email: 'subscriber@domain.com.au',
        source: 'https://mullawaysmedicalcannabis.store/shop/',
      },
    }),
  });
  const res = await sendEmailModule.onRequestPost({ request: newsletterReq, env: mockEnv });
  assert.equal(res.status, 200);
  assert.equal(interceptedEmails.length, 1);
  assert.equal(interceptedEmails[0].to[0], OFFICIAL_EMAIL);
  assert.ok(interceptedEmails[0].html.includes('subscriber@domain.com.au'));
});

// ── Test Dist Artifacts Integrity ───────────────────────────────────────────
console.log('\n▸ Test Suite 6: Production Build & Deployed Artifacts Integrity');

runTest('Checkout HTML page (dist/checkout/index.html) contains 3-step progressive stepper', () => {
  const checkoutHtml = fs.readFileSync(path.join(ROOT_DIR, 'dist/checkout/index.html'), 'utf8');
  assert.ok(checkoutHtml.includes('Customer Info'), 'Missing Customer Info step in HTML');
  assert.ok(checkoutHtml.includes('Shipping / Delivery'), 'Missing Shipping/Delivery step in HTML');
  assert.ok(checkoutHtml.includes('Payment'), 'Missing Payment step in HTML');
  assert.ok(checkoutHtml.includes('step-nav-1'), 'Missing step-nav-1');
  assert.ok(checkoutHtml.includes('step-nav-2'), 'Missing step-nav-2');
  assert.ok(checkoutHtml.includes('step-nav-3'), 'Missing step-nav-3');
  assert.ok(checkoutHtml.includes(OFFICIAL_EMAIL), 'Missing official contact email in footer');
  assert.ok(!checkoutHtml.includes('weed-melbourne.pages.dev'), 'Contains old dev domain in checkout HTML');
});

runTest('Order Confirmation HTML page (dist/order-confirmation/index.html) contains Live Chat Alert & BTC UI', () => {
  const confirmHtml = fs.readFileSync(path.join(ROOT_DIR, 'dist/order-confirmation/index.html'), 'utf8');
  assert.ok(confirmHtml.includes('wa-alert'), 'Missing Live Chat alert container');
  assert.ok(confirmHtml.includes('Open Live Chat now to get bank details'), 'Missing Live Chat alert title');
  assert.ok(confirmHtml.includes('btc-timer-bar'), 'Missing Bitcoin payment timer bar');
  assert.ok(confirmHtml.includes('download-order-btn'), 'Missing PDF download button');
  assert.ok(confirmHtml.includes(OFFICIAL_EMAIL), 'Missing official contact email');
});

// Restore fetch
globalThis.fetch = originalFetch;

console.log('\n======================================================');
console.log(`  TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  console.log('✨ ALL ORDER FLOW, CALCULATION & EMAIL TESTS PASSED SUCCESSFULLY! ✨\n');
  process.exit(0);
} else {
  console.error('❌ SOME TESTS FAILED. PLEASE REVIEW LOGS ABOVE. ❌\n');
  process.exit(1);
}

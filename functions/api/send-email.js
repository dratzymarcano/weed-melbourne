// ══════════════════════════════════════════════════════════════════════
// Cloudflare Pages Function — /api/send-email
// Handles all outbound emails via the Resend API
// ══════════════════════════════════════════════════════════════════════
//
// SETUP:
//   1. Sign up at https://resend.com (free: 3,000 emails/month)
//   2. Verify your domain (DNS records) — or use onboarding@resend.dev for testing
//   3. Create an API key at https://resend.com/api-keys
//   4. In Cloudflare Pages → Settings → Environment variables, add:
//        RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//
// Accepts POST with JSON body:
//   { type: "order-customer" | "order-admin" | "contact", ...data }
//
// ══════════════════════════════════════════════════════════════════════

const ADMIN_EMAIL = 'hello@mullawaysmedicalcannabis.com.au';
const BRAND = 'Mullaways Medical Cannabis';

// ── Resend send helper ──────────────────────────────────────────────
async function sendEmail(apiKey, { from, to, replyTo, subject, html }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: Array.isArray(to) ? to : [to],
      ...(replyTo ? { reply_to: replyTo } : {}),
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend API ${res.status}: ${err}`);
  }

  return res.json();
}

// ── Email templates ─────────────────────────────────────────────────

function orderCustomerHTML(data) {
  const {
    to_name, order_ref, order_date, items_list, subtotal,
    discount, shipping, total, payment_method, payment_status,
    payment_next_step, shipping_address, delivery_method, btc_address,
  } = data;

  const itemRows = items_list
    .split('\n')
    .map((line) => `<tr><td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">${line}</td></tr>`)
    .join('');

  // Bitcoin payment section (only for BTC orders)
  const btcSection = btc_address ? `
      <!-- Bitcoin Payment Details -->
      <div style="margin-top:24px;background:#fef3c7;border:1px solid #f59e0b;border-radius:10px;padding:20px;text-align:center;">
        <p style="margin:0 0 12px;font-size:15px;color:#92400e;font-weight:600;">Bitcoin Payment Details</p>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=bitcoin:${btc_address}" alt="Bitcoin QR Code" width="180" height="180" style="border-radius:8px;margin-bottom:12px;">
        <p style="margin:0 0 4px;font-size:12px;color:#92400e;">Wallet Address:</p>
        <p style="margin:0;font-size:13px;color:#78350f;font-family:monospace;word-break:break-all;background:#fff7ed;border-radius:6px;padding:10px;">${btc_address}</p>
        <p style="margin:12px 0 0;font-size:12px;color:#92400e;">Send the exact total to this address. Your order will be processed once 2-3 blockchain confirmations are received.</p>
      </div>` : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;margin-top:20px;margin-bottom:20px;">

    <!-- Header -->
    <div style="background:#1a1a2e;padding:30px 40px;text-align:center;">
      <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:600;">${BRAND}</h1>
      <p style="margin:8px 0 0;color:#a0a0b0;font-size:14px;">Order Confirmation</p>
    </div>

    <!-- Body -->
    <div style="padding:30px 40px;">
      <p style="margin:0 0 20px;font-size:16px;color:#333;">Hi ${to_name},</p>
      <p style="margin:0 0 20px;font-size:15px;color:#555;line-height:1.6;">
        Thank you for your order! Here's a summary of what you ordered.
      </p>

      <!-- Order info -->
      <div style="background:#f8f8fc;border-radius:10px;padding:20px;margin-bottom:20px;">
        <table style="width:100%;font-size:14px;color:#444;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:4px 0;"><strong>Order Ref:</strong></td>
            <td style="text-align:right;">${order_ref}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><strong>Date:</strong></td>
            <td style="text-align:right;">${order_date}</td>
          </tr>
          <tr>
            <td style="padding:4px 0;"><strong>Delivery:</strong></td>
            <td style="text-align:right;">${delivery_method}</td>
          </tr>
        </table>
      </div>

      <!-- Items -->
      <h3 style="margin:0 0 10px;font-size:15px;color:#333;">Items Ordered</h3>
      <table style="width:100%;font-size:14px;color:#444;" cellpadding="0" cellspacing="0">
        ${itemRows}
      </table>

      <!-- Totals -->
      <div style="margin-top:16px;border-top:2px solid #eee;padding-top:16px;">
        <table style="width:100%;font-size:14px;color:#444;" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:4px 0;">Subtotal</td>
            <td style="text-align:right;">${subtotal}</td>
          </tr>
          ${discount !== '$0.00' ? `<tr>
            <td style="padding:4px 0;color:#059669;">Discount</td>
            <td style="text-align:right;color:#059669;">${discount}</td>
          </tr>` : ''}
          <tr>
            <td style="padding:4px 0;">Shipping</td>
            <td style="text-align:right;">${shipping}</td>
          </tr>
          <tr>
            <td style="padding:8px 0 0;font-size:16px;"><strong>Total</strong></td>
            <td style="text-align:right;padding:8px 0 0;font-size:16px;"><strong>${total}</strong></td>
          </tr>
        </table>
      </div>

      <!-- Payment -->
      <div style="margin-top:24px;background:#fffbeb;border:1px solid #fde68a;border-radius:10px;padding:18px;">
        <p style="margin:0 0 6px;font-size:14px;color:#92400e;"><strong>Payment: ${payment_method}</strong></p>
        <p style="margin:0 0 6px;font-size:13px;color:#92400e;">Status: ${payment_status}</p>
        <p style="margin:0;font-size:13px;color:#78350f;line-height:1.5;">${payment_next_step}</p>
      </div>

      ${btcSection}

      <!-- Payment screenshot reminder -->
      <div style="margin-top:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:18px;">
        <p style="margin:0 0 6px;font-size:14px;color:#1e40af;"><strong>Important: Send Proof of Payment</strong></p>
        <p style="margin:0;font-size:13px;color:#1e3a8a;line-height:1.6;">Once you've completed your payment, please reply to this email with a <strong>screenshot of the payment confirmation</strong>. This helps us verify and process your order faster.</p>
      </div>

      <!-- Shipping address -->
      <div style="margin-top:20px;">
        <p style="margin:0 0 4px;font-size:14px;color:#333;"><strong>Delivery Address</strong></p>
        <p style="margin:0;font-size:14px;color:#555;line-height:1.5;">${shipping_address}</p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8f8fc;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
      <p style="margin:0;font-size:12px;color:#999;">
        Questions? Reply to this email or contact us at ${ADMIN_EMAIL}
      </p>
    </div>

  </div>
</body>
</html>`.trim();
}


function orderAdminHTML(data) {
  const {
    to_name, order_ref, order_date, items_list, subtotal,
    discount, shipping, total, payment_method, payment_status,
    shipping_address, delivery_method, customer_email, customer_phone,
    psc_pin,
  } = data;

  // Paysafecard PIN section (only when PIN is provided)
  const pscPinSection = psc_pin ? `
      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
      <div style="background:#fef3c7;border:1px solid #f59e0b;border-radius:8px;padding:16px;">
        <p style="margin:0 0 6px;font-size:14px;color:#92400e;font-weight:600;">Paysafecard PIN</p>
        <p style="margin:0;font-size:18px;color:#78350f;font-family:monospace;letter-spacing:2px;font-weight:bold;">${psc_pin}</p>
        <p style="margin:8px 0 0;font-size:12px;color:#92400e;">Please verify this PIN at paysafecard.com before processing the order.</p>
      </div>` : '';

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;">

    <div style="background:#1a1a2e;padding:24px 40px;">
      <h1 style="margin:0;color:#fff;font-size:20px;">New Order Received</h1>
    </div>

    <div style="padding:24px 40px;font-size:14px;color:#333;line-height:1.6;">
      <table style="width:100%;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;"><strong>Order Ref:</strong></td><td>${order_ref}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Date:</strong></td><td>${order_date}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Customer:</strong></td><td>${to_name}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Email:</strong></td><td>${customer_email}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Phone:</strong></td><td>${customer_phone}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Payment:</strong></td><td>${payment_method} — ${payment_status}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Delivery:</strong></td><td>${delivery_method}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Address:</strong></td><td>${shipping_address}</td></tr>
      </table>

      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
      <h3 style="margin:0 0 8px;font-size:15px;">Items</h3>
      <pre style="margin:0;font-size:13px;color:#555;white-space:pre-wrap;">${items_list}</pre>

      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
      <table style="width:100%;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:3px 0;">Subtotal:</td><td style="text-align:right;">${subtotal}</td></tr>
        ${discount !== '$0.00' ? `<tr><td style="padding:3px 0;">Discount:</td><td style="text-align:right;">${discount}</td></tr>` : ''}
        <tr><td style="padding:3px 0;">Shipping:</td><td style="text-align:right;">${shipping}</td></tr>
        <tr><td style="padding:6px 0;font-weight:bold;font-size:16px;">Total:</td><td style="text-align:right;font-weight:bold;font-size:16px;">${total}</td></tr>
      </table>
      ${pscPinSection}
    </div>

  </div>
</body>
</html>`.trim();
}


function contactAdminHTML({ from_name, from_email, order_ref, subject, message }) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="max-width:600px;margin:20px auto;background:#fff;border-radius:12px;overflow:hidden;">

    <div style="background:#1a1a2e;padding:24px 40px;">
      <h1 style="margin:0;color:#fff;font-size:20px;">New Contact Message</h1>
    </div>

    <div style="padding:24px 40px;font-size:14px;color:#333;line-height:1.6;">
      <table style="width:100%;" cellpadding="0" cellspacing="0">
        <tr><td style="padding:4px 0;width:100px;"><strong>Name:</strong></td><td>${from_name}</td></tr>
        <tr><td style="padding:4px 0;"><strong>Email:</strong></td><td>${from_email}</td></tr>
        ${order_ref ? `<tr><td style="padding:4px 0;"><strong>Order Ref:</strong></td><td>${order_ref}</td></tr>` : ''}
        <tr><td style="padding:4px 0;"><strong>Subject:</strong></td><td>${subject}</td></tr>
      </table>

      <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
      <h3 style="margin:0 0 8px;font-size:15px;">Message</h3>
      <div style="background:#f8f8fc;border-radius:8px;padding:16px;white-space:pre-wrap;font-size:14px;color:#444;">${message}</div>
    </div>

  </div>
</body>
</html>`.trim();
}


// ══════════════════════════════════════════════════════════════════════
// ── Request handler ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════
export async function onRequestPost(context) {
  const { env, request } = context;
  const apiKey = env.RESEND_API_KEY;

  // CORS headers (same origin, but just in case)
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
      { status: 500, headers }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers }
    );
  }

  const { type } = body;

  const fromAddress = `${BRAND} <hello@mullawaysmedicalcannabis.com.au>`;

  try {
    if (type === 'order-customer') {
      // ── Customer order confirmation ─────────────────────────────
      const { data } = body;
      if (!data?.to_email) {
        return new Response(
          JSON.stringify({ error: 'Missing to_email' }),
          { status: 400, headers }
        );
      }

      const result = await sendEmail(apiKey, {
        from: fromAddress,
        to: data.to_email,
        replyTo: ADMIN_EMAIL,
        subject: `Order ${data.order_ref} - We've Received Your Order`,
        html: orderCustomerHTML(data),
      });

      return new Response(JSON.stringify({ success: true, id: result.id }), { headers });

    } else if (type === 'order-admin') {
      // ── Admin order notification ────────────────────────────────
      const { data } = body;

      const result = await sendEmail(apiKey, {
        from: fromAddress,
        to: ADMIN_EMAIL,
        replyTo: data.customer_email,
        subject: `New Order ${data.order_ref} - ${data.total} via ${data.payment_method}`,
        html: orderAdminHTML(data),
      });

      return new Response(JSON.stringify({ success: true, id: result.id }), { headers });

    } else if (type === 'contact') {
      // ── Contact form message ────────────────────────────────────
      const { data } = body;
      if (!data?.from_email || !data?.subject || !data?.message) {
        return new Response(
          JSON.stringify({ error: 'Missing required contact fields' }),
          { status: 400, headers }
        );
      }

      const result = await sendEmail(apiKey, {
        from: fromAddress,
        to: ADMIN_EMAIL,
        replyTo: data.from_email,
        subject: `Contact Form: ${data.subject}`,
        html: contactAdminHTML(data),
      });

      return new Response(JSON.stringify({ success: true, id: result.id }), { headers });

    } else {
      return new Response(
        JSON.stringify({ error: `Unknown email type: ${type}` }),
        { status: 400, headers }
      );
    }
  } catch (err) {
    console.error('Email send error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to send email' }),
      { status: 500, headers }
    );
  }
}

// Handle preflight CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

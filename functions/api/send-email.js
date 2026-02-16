// Cloudflare Pages Function  /api/send-email
// Handles all outbound emails via the Resend API
//
// SETUP:
//   1. Sign up at https://resend.com (free: 3,000 emails/month)
//   2. Verify your domain (DNS records) or use onboarding@resend.dev for testing
//   3. Create an API key at https://resend.com/api-keys
//   4. In Cloudflare Pages  Settings  Environment variables, add:
//        RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//
// Accepts POST with JSON body:
//   { type: "order-customer" | "order-admin" | "contact", ...data }

const ADMIN_EMAIL = 'hello@mullawaysmedicalcannabis.com.au';
const BRAND = 'Mullaways Medical Cannabis';

// Resend send helper
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

// -- Email templates ----------------------------------------------------------

// Shared email wrapper - ultra-minimal, premium flat design
function emailWrapper({ preheader, heroTitle, heroSub, bodyContent }) {
  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
<style>
  body,table,td,p,a,li{-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}
  body{margin:0;padding:0}
  @media only screen and (max-width:620px){
    .outer{width:100%!important;padding:24px 12px!important}
    .card{width:100%!important}
    .inner{padding:32px 24px!important}
    .hero-pad{padding:36px 24px 32px!important}
    .foot-pad{padding:20px 24px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F2F2F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:#F2F2F2;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader || ''}</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F2F2F2;">
<tr><td class="outer" align="center" style="padding:48px 16px;">
<table role="presentation" class="card" cellpadding="0" cellspacing="0" width="580" style="max-width:580px;width:100%;background-color:#FFFFFF;">

<!-- Top line -->
<tr><td style="height:2px;background-color:#2D5A4A;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Hero -->
<tr><td class="hero-pad" style="padding:48px 48px 40px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td>
<p style="margin:0 0 20px;font-size:11px;font-weight:700;color:#2D5A4A;text-transform:uppercase;letter-spacing:3px;">${BRAND.toUpperCase()}</p>
<h1 style="margin:0;font-size:32px;font-weight:200;color:#111111;line-height:1.25;letter-spacing:-0.5px;">${heroTitle}</h1>
${heroSub ? `<p style="margin:12px 0 0;font-size:15px;color:#888888;font-weight:400;line-height:1.5;">${heroSub}</p>` : ''}
</td></tr>
</table>
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 48px;"><div style="height:1px;background-color:#EEEEEE;"></div></td></tr>

<!-- Body -->
<tr><td class="inner" style="padding:36px 48px 44px;">
${bodyContent}
</td></tr>

<!-- Footer -->
<tr><td style="padding:0 48px;"><div style="height:1px;background-color:#EEEEEE;"></div></td></tr>
<tr><td class="foot-pad" style="padding:24px 48px 28px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
<td>
<p style="margin:0;font-size:12px;color:#BBBBBB;line-height:1.6;">${BRAND}</p>
</td>
<td align="right">
<a href="mailto:${ADMIN_EMAIL}" style="font-size:12px;color:#BBBBBB;text-decoration:none;">${ADMIN_EMAIL}</a>
</td>
</tr></table>
</td></tr>

<!-- Bottom line -->
<tr><td style="height:2px;background-color:#2D5A4A;font-size:0;line-height:0;">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// -- Helpers ------------------------------------------------------------------

function sectionLabel(text) {
  return `<p style="margin:0 0 14px;font-size:10px;font-weight:700;color:#BBBBBB;text-transform:uppercase;letter-spacing:2.5px;">${text}</p>`;
}

function divider() {
  return '<div style="height:1px;background-color:#EEEEEE;margin:28px 0;"></div>';
}

function dataRow(label, value) {
  return `<tr>
<td style="padding:6px 0;font-size:13px;color:#999999;vertical-align:top;width:120px;">${label}</td>
<td style="padding:6px 0;font-size:14px;color:#222222;">${value}</td>
</tr>`;
}

function sumRow(label, value, isTotal) {
  return `<tr>
<td style="padding:${isTotal ? '10px 0 4px' : '4px 0'};font-size:${isTotal ? '16' : '13'}px;font-weight:${isTotal ? '600' : '400'};color:${isTotal ? '#111111' : '#888888'};">${label}</td>
<td style="padding:${isTotal ? '10px 0 4px' : '4px 0'};text-align:right;font-size:${isTotal ? '16' : '13'}px;font-weight:${isTotal ? '600' : '400'};color:${isTotal ? '#111111' : '#222222'};">${value}</td>
</tr>`;
}


// 1. Customer Order Confirmation
function orderCustomerHTML(data) {
  const {
    to_name, order_ref, order_date, items_list, subtotal,
    discount, shipping, total, payment_method, payment_status,
    payment_next_step, shipping_address, delivery_method, btc_address,
  } = data;

  const firstName = to_name.split(' ')[0] || to_name;
  const items = items_list.split('\n').filter(l => l.trim());

  // Payment color chip
  let payColor = '#2D5A4A';
  if (payment_method === 'Bitcoin') payColor = '#F7931A';
  else if (payment_method === 'Paysafecard') payColor = '#4A8B9C';

  const itemRows = items.map((line, i) =>
    `<tr>
<td style="padding:12px 0;font-size:14px;color:#333333;line-height:1.5;${i < items.length - 1 ? 'border-bottom:1px solid #F5F5F5;' : ''}">${line}</td>
</tr>`
  ).join('');

  // BTC payment section
  const btcSection = btc_address ? `
${divider()}
${sectionLabel('Bitcoin Payment')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td align="center" style="padding:20px 0;">
<table role="presentation" cellpadding="0" cellspacing="0">
<tr><td style="background:#FAFAFA;padding:24px;text-align:center;">
<img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin%3A${btc_address}" alt="Bitcoin QR" width="140" height="140" style="display:block;margin:0 auto 16px;">
<p style="margin:0 0 6px;font-size:10px;font-weight:700;color:#BBBBBB;text-transform:uppercase;letter-spacing:2px;">Wallet Address</p>
<p style="margin:0;font-size:11px;color:#333333;word-break:break-all;font-family:'SF Mono','Fira Code','Courier New',monospace;line-height:1.6;max-width:280px;">${btc_address}</p>
</td></tr>
</table>
</td></tr>
</table>
<p style="margin:0;font-size:12px;color:#F7931A;text-align:center;">Order processed after 2+ blockchain confirmations</p>
` : '';

  const bodyContent = `
<p style="margin:0 0 32px;font-size:15px;color:#666666;line-height:1.7;">
Your order has been received and is being processed. Here are the details.
</p>

${sectionLabel('Order Details')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('Reference', `<span style="font-family:'SF Mono','Fira Code','Courier New',monospace;font-size:13px;letter-spacing:0.5px;color:#111111;">${order_ref}</span>`)}
${dataRow('Date', order_date)}
${dataRow('Delivery', delivery_method)}
${dataRow('Payment', `<span style="color:${payColor};font-weight:600;">${payment_method}</span>`)}
</table>

${divider()}

${sectionLabel('Items')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${itemRows}
</table>

<div style="margin:20px 0 0;padding:16px 20px;background-color:#FAFAFA;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${sumRow('Subtotal', subtotal)}
${discount !== '$0.00' ? sumRow('Discount', `<span style="color:#2D5A4A;">${discount}</span>`) : ''}
${sumRow('Shipping', shipping)}
<tr><td colspan="2" style="padding:6px 0;"><div style="height:1px;background-color:#EEEEEE;"></div></td></tr>
${sumRow('Total', total, true)}
</table>
</div>

${divider()}

${sectionLabel('Payment Status')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:0 0 6px;">
<span style="display:inline-block;width:8px;height:8px;background-color:${payColor};margin-right:8px;vertical-align:middle;"></span>
<span style="font-size:14px;color:#222222;font-weight:500;">${payment_method}</span>
<span style="font-size:13px;color:#888888;margin-left:8px;">${payment_status}</span>
</td></tr>
<tr><td style="padding:4px 0 0;">
<p style="margin:0;font-size:13px;color:#888888;line-height:1.6;">${payment_next_step}</p>
</td></tr>
</table>

${btcSection}

${divider()}

<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td style="width:50%;vertical-align:top;padding-right:16px;">
${sectionLabel('Proof of Payment')}
<p style="margin:0;font-size:13px;color:#888888;line-height:1.6;">Reply to this email with a screenshot of your payment confirmation.</p>
</td>
<td style="width:50%;vertical-align:top;padding-left:16px;">
${sectionLabel('Delivery Address')}
<p style="margin:0;font-size:13px;color:#333333;line-height:1.6;">${shipping_address}</p>
</td>
</tr>
</table>
`;

  return emailWrapper({
    preheader: `Order ${order_ref} confirmed - ${total} via ${payment_method}`,
    heroTitle: `Thank you, ${firstName}.`,
    heroSub: `Order ${order_ref} has been received.`,
    bodyContent,
  });
}


// 2. Admin Order Notification
function orderAdminHTML(data) {
  const {
    to_name, order_ref, order_date, items_list, subtotal,
    discount, shipping, total, payment_method, payment_status,
    shipping_address, delivery_method, customer_email, customer_phone,
    psc_pin,
  } = data;

  const items = items_list.split('\n').filter(l => l.trim());

  let payColor = '#2D5A4A';
  if (payment_method === 'Bitcoin') payColor = '#F7931A';
  else if (payment_method === 'Paysafecard') payColor = '#4A8B9C';

  const itemRows = items.map((line, i) =>
    `<tr>
<td style="padding:10px 0;font-size:14px;color:#333333;${i < items.length - 1 ? 'border-bottom:1px solid #F5F5F5;' : ''}">${line}</td>
</tr>`
  ).join('');

  const pscSection = psc_pin ? `
<div style="margin:20px 0;padding:16px 20px;background-color:#FFF9EE;border:1px solid #F5E6CC;">
<p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:2px;">Paysafecard PIN</p>
<p style="margin:0 0 6px;font-size:24px;font-weight:600;color:#111111;font-family:'SF Mono','Fira Code','Courier New',monospace;letter-spacing:4px;">${psc_pin}</p>
<p style="margin:0;font-size:11px;color:#92400E;">Verify at paysafecard.com before processing</p>
</div>` : '';

  const bodyContent = `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
<tr>
<td>
<p style="margin:0 0 4px;font-size:13px;color:#888888;">Customer</p>
<p style="margin:0;font-size:18px;font-weight:600;color:#111111;">${to_name}</p>
</td>
<td align="right" valign="top">
<div style="display:inline-block;background-color:${payColor};padding:6px 16px;">
<span style="font-size:11px;font-weight:700;color:#FFFFFF;text-transform:uppercase;letter-spacing:1px;">${payment_method}</span>
</div>
</td>
</tr>
</table>

<div style="background-color:#111111;padding:20px 24px;margin-bottom:28px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td>
<p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#666666;text-transform:uppercase;letter-spacing:2px;">Reference</p>
<p style="margin:0;font-size:15px;font-weight:500;color:#FFFFFF;font-family:'SF Mono','Fira Code','Courier New',monospace;letter-spacing:0.5px;">${order_ref}</p>
</td>
<td align="right">
<p style="margin:0 0 4px;font-size:10px;font-weight:700;color:#666666;text-transform:uppercase;letter-spacing:2px;">Total</p>
<p style="margin:0;font-size:22px;font-weight:600;color:#FFFFFF;">${total}</p>
</td>
</tr>
</table>
</div>

${sectionLabel('Customer Details')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('Email', `<a href="mailto:${customer_email}" style="color:#2D5A4A;text-decoration:none;">${customer_email}</a>`)}
${dataRow('Phone', customer_phone || 'N/A')}
${dataRow('Delivery', delivery_method)}
${dataRow('Address', shipping_address)}
</table>

${divider()}

${sectionLabel('Payment')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('Method', payment_method)}
${dataRow('Status', payment_status)}
${dataRow('Date', order_date)}
</table>

${pscSection}

${divider()}

${sectionLabel('Items')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${itemRows}
</table>

<div style="margin:20px 0 0;padding:16px 20px;background-color:#FAFAFA;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${sumRow('Subtotal', subtotal)}
${discount !== '$0.00' ? sumRow('Discount', `<span style="color:#2D5A4A;">${discount}</span>`) : ''}
${sumRow('Shipping', shipping)}
<tr><td colspan="2" style="padding:6px 0;"><div style="height:1px;background-color:#EEEEEE;"></div></td></tr>
${sumRow('Total', total, true)}
</table>
</div>
`;

  return emailWrapper({
    preheader: `New order ${order_ref} - ${total} via ${payment_method} from ${to_name}`,
    heroTitle: `${total} via ${payment_method}`,
    heroSub: `New order from ${to_name}`,
    bodyContent,
  });
}


// 3. Contact Form Notification
function contactAdminHTML({ from_name, from_email, order_ref, subject, message }) {
  const bodyContent = `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:28px;">
<tr><td>
<p style="margin:0;font-size:18px;font-weight:600;color:#111111;">${from_name}</p>
<p style="margin:6px 0 0;font-size:14px;">
<a href="mailto:${from_email}" style="color:#2D5A4A;text-decoration:none;">${from_email}</a>
</p>
</td></tr>
</table>

${sectionLabel('Details')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('Subject', subject)}
${order_ref ? dataRow('Order Ref', order_ref) : ''}
</table>

${divider()}

${sectionLabel('Message')}
<div style="padding:20px 24px;background-color:#FAFAFA;margin-bottom:28px;">
<p style="margin:0;font-size:14px;color:#333333;line-height:1.8;white-space:pre-wrap;">${message}</p>
</div>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td align="center">
<a href="mailto:${from_email}?subject=Re: ${subject}" style="display:inline-block;background-color:#2D5A4A;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:600;padding:14px 40px;letter-spacing:0.5px;">Reply to ${from_name.split(' ')[0]}</a>
</td></tr>
</table>
`;

  return emailWrapper({
    preheader: `New message from ${from_name}: ${subject}`,
    heroTitle: `Message received`,
    heroSub: `From ${from_name}`,
    bodyContent,
  });
}


// -- Request handler ----------------------------------------------------------
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
      // Customer order confirmation
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
      // Admin order notification
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
      // Contact form message
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

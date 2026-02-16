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

// Inline SVG encoded as data URI for the official Bitcoin logo (orange circle + white B)
const BTC_LOGO = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23F7931A'/%3E%3Cpath d='M46.1 27.4c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5c-.9-.2-1.9-.4-2.8-.7l1.4-5.5-3.5-.9-1.4 5.7c-.8-.2-1.5-.3-2.2-.5l0 0-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.7 1.3 1.6 2l-1.6 6.6c.1 0 .2 0 .3.1l-.3-.1-2.3 9.2c-.2.4-.6 1.1-1.6.8 0 0-2.5-.6-2.5-.6l-1.7 4 4.5 1.1c.8.2 1.7.4 2.5.6l-1.5 5.8 3.5.9 1.4-5.7c1 .3 1.9.5 2.8.7l-1.4 5.7 3.5.9 1.5-5.8c5.8 1.1 10.2.7 12-4.6 1.5-4.3-.1-6.7-3.2-8.3 2.2-.5 3.9-2 4.4-5.1zm-7.8 10.9c-1.1 4.3-8.2 2-10.5 1.4l1.9-7.5c2.3.6 9.7 1.7 8.6 6.1zm1-11c-1 3.9-6.9 1.9-8.8 1.4l1.7-6.8c1.9.5 8.2 1.4 7.1 5.4z' fill='%23FFF'/%3E%3C/svg%3E`;

// Shared email wrapper with the site's Australian-inspired theme
function emailWrapper({ preheader, heroIcon, heroTitle, heroSubtitle, bodyContent, footerExtra }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:#F5F1EB;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;font-size:1px;color:#F5F1EB;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader || ''}</div>

  <!-- Outer container -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F5F1EB;">
    <tr>
      <td align="center" style="padding:24px 16px;">

        <!-- Email card -->
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- ======== HEADER ======== -->
          <tr>
            <td style="background:linear-gradient(135deg,#1A3D32 0%,#2D5A4A 50%,#1C1C1C 100%);padding:32px 40px;text-align:center;">
              ${heroIcon ? `<div style="margin-bottom:16px;">${heroIcon}</div>` : ''}
              <h1 style="margin:0;color:#FFFFFF;font-size:24px;font-weight:700;letter-spacing:-0.3px;font-family:Georgia,'Times New Roman',serif;">${heroTitle}</h1>
              ${heroSubtitle ? `<p style="margin:10px 0 0;color:#8BA888;font-size:14px;font-weight:400;">${heroSubtitle}</p>` : ''}
            </td>
          </tr>

          <!-- ======== BODY ======== -->
          <tr>
            <td style="padding:32px 40px;">
              ${bodyContent}
            </td>
          </tr>

          <!-- ======== FOOTER ======== -->
          <tr>
            <td style="background-color:#F5F1EB;padding:24px 40px;border-top:1px solid #E8DED1;">
              ${footerExtra || ''}
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center" style="padding-top:${footerExtra ? '16px' : '0'};">
                    <p style="margin:0 0 6px;font-size:13px;font-weight:600;color:#2D5A4A;">${BRAND}</p>
                    <p style="margin:0;font-size:12px;color:#8A8A8A;line-height:1.5;">
                      Questions? Reply to this email or contact us at<br>
                      <a href="mailto:${ADMIN_EMAIL}" style="color:#C4704B;text-decoration:none;font-weight:500;">${ADMIN_EMAIL}</a>
                    </p>
                    <p style="margin:12px 0 0;font-size:11px;color:#B0B0B0;">
                      mullawaysmedicalcannabis.com.au
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>
</body>
</html>`.trim();
}

// ─── Section builder helpers ──────────────────────────────────────
function sectionBox(bgColor, borderColor, content) {
  return `<div style="background:${bgColor};border:1px solid ${borderColor};border-radius:12px;padding:20px;margin-bottom:20px;">${content}</div>`;
}

function infoRow(label, value, labelColor = '#5A5A5A', valueColor = '#1C1C1C') {
  return `<tr><td style="padding:6px 0;font-size:14px;color:${labelColor};font-weight:500;">${label}</td><td style="padding:6px 0;text-align:right;font-size:14px;color:${valueColor};font-weight:600;">${value}</td></tr>`;
}

function divider() {
  return `<div style="border-top:1px solid #E8DED1;margin:20px 0;"></div>`;
}

// ═══════════════════════════════════════════════════════════════════
// 1. CUSTOMER ORDER CONFIRMATION
// ═══════════════════════════════════════════════════════════════════
function orderCustomerHTML(data) {
  const {
    to_name, order_ref, order_date, items_list, subtotal,
    discount, shipping, total, payment_method, payment_status,
    payment_next_step, shipping_address, delivery_method, btc_address,
  } = data;

  const firstName = to_name.split(' ')[0] || to_name;

  const items = items_list.split('\n').filter(l => l.trim());
  const itemRowsHTML = items.map((line, i) => `
    <tr>
      <td style="padding:12px 0;${i < items.length - 1 ? 'border-bottom:1px solid #F5F1EB;' : ''}font-size:14px;color:#1C1C1C;">${line}</td>
    </tr>`).join('');

  // Payment method icon mapping
  let paymentIcon = '';
  let paymentColor = '#C4704B';
  let paymentBg = '#FFF8F3';
  let paymentBorder = '#E8DED1';

  if (payment_method === 'Bitcoin') {
    paymentIcon = `<img src="${BTC_LOGO}" width="20" height="20" alt="BTC" style="vertical-align:middle;margin-right:6px;border-radius:50%;">`;
    paymentColor = '#F7931A';
    paymentBg = '#FFF9F0';
    paymentBorder = '#FDE8C8';
  } else if (payment_method === 'Bank Transfer') {
    paymentIcon = `<span style="display:inline-block;width:20px;height:20px;background:#2D5A4A;border-radius:50%;text-align:center;line-height:20px;font-size:11px;color:#fff;vertical-align:middle;margin-right:6px;">$</span>`;
    paymentColor = '#2D5A4A';
    paymentBg = '#F0F7F4';
    paymentBorder = '#C8E0D5';
  } else {
    paymentIcon = `<span style="display:inline-block;width:20px;height:20px;background:#4A8B9C;border-radius:50%;text-align:center;line-height:20px;font-size:10px;color:#fff;vertical-align:middle;margin-right:6px;">P</span>`;
    paymentColor = '#4A8B9C';
    paymentBg = '#F0F7F9';
    paymentBorder = '#C8DEE4';
  }

  // Bitcoin QR + address section
  const btcSection = btc_address ? `
    <div style="margin-top:4px;background:#FFFAF3;border:2px solid #F7931A;border-radius:12px;padding:24px;text-align:center;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td align="center" style="padding-bottom:16px;">
            <img src="${BTC_LOGO}" width="32" height="32" alt="Bitcoin" style="border-radius:50%;">
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:16px;">
            <p style="margin:0;font-size:16px;font-weight:700;color:#1C1C1C;">Send Bitcoin to this address</p>
            <p style="margin:6px 0 0;font-size:13px;color:#5A5A5A;">Scan with any Bitcoin wallet app</p>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-bottom:16px;">
            <div style="display:inline-block;background:#FFFFFF;border:2px solid #E8DED1;border-radius:12px;padding:12px;">
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin%3A${btc_address}" alt="Bitcoin QR Code" width="180" height="180" style="display:block;border-radius:4px;">
            </div>
          </td>
        </tr>
        <tr>
          <td align="center">
            <p style="margin:0 0 6px;font-size:11px;font-weight:600;color:#8A8A8A;text-transform:uppercase;letter-spacing:1px;">Wallet Address</p>
            <div style="background:#FFFFFF;border:1px solid #E8DED1;border-radius:8px;padding:12px 16px;">
              <code style="font-size:13px;color:#1C1C1C;word-break:break-all;font-family:'SF Mono','Fira Code','Courier New',monospace;">${btc_address}</code>
            </div>
            <p style="margin:12px 0 0;font-size:12px;color:#C4704B;font-weight:500;">Your order is processed once 2+ blockchain confirmations are received</p>
          </td>
        </tr>
      </table>
    </div>` : '';

  const bodyContent = `
    <!-- Greeting -->
    <p style="margin:0 0 8px;font-size:18px;font-weight:600;color:#1C1C1C;">Hi ${firstName},</p>
    <p style="margin:0 0 24px;font-size:15px;color:#5A5A5A;line-height:1.6;">
      Thank you for your order! We've received it and here's everything you need to know.
    </p>

    <!-- Order Reference Banner -->
    <div style="background:linear-gradient(135deg,#2D5A4A,#3D7A64);border-radius:12px;padding:20px;margin-bottom:24px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:600;color:#8BA888;text-transform:uppercase;letter-spacing:1.5px;">Order Reference</p>
      <p style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:1px;font-family:'SF Mono','Fira Code','Courier New',monospace;">${order_ref}</p>
    </div>

    <!-- Order Details -->
    ${sectionBox('#FAFAF8', '#E8DED1', `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;">
        ${infoRow('Date', order_date)}
        ${infoRow('Delivery', delivery_method)}
        ${infoRow('Payment', `${paymentIcon}<span style="color:${paymentColor};font-weight:600;">${payment_method}</span>`)}
      </table>
    `)}

    <!-- Items -->
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#2D5A4A;text-transform:uppercase;letter-spacing:1px;">Items Ordered</p>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      ${itemRowsHTML}
    </table>

    <!-- Totals -->
    <div style="background:#FAFAF8;border:1px solid #E8DED1;border-radius:12px;padding:20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${infoRow('Subtotal', subtotal, '#5A5A5A', '#1C1C1C')}
        ${discount !== '$0.00' ? infoRow('Discount', discount, '#2D5A4A', '#2D5A4A') : ''}
        ${infoRow('Shipping', shipping, '#5A5A5A', '#1C1C1C')}
        <tr><td colspan="2" style="padding:8px 0;"><div style="border-top:2px solid #E8DED1;"></div></td></tr>
        ${infoRow('Total', total, '#1C1C1C', '#1C1C1C')}
      </table>
    </div>

    ${divider()}

    <!-- Payment Status -->
    <div style="background:${paymentBg};border:1px solid ${paymentBorder};border-radius:12px;padding:20px;">
      <p style="margin:0 0 8px;font-size:15px;font-weight:700;color:${paymentColor};">${paymentIcon}${payment_method}</p>
      <p style="margin:0 0 4px;font-size:13px;color:#5A5A5A;">Status: <strong style="color:${paymentColor};">${payment_status}</strong></p>
      <p style="margin:0;font-size:13px;color:#5A5A5A;line-height:1.6;">${payment_next_step}</p>
    </div>

    ${btcSection}

    <!-- Proof of Payment -->
    <div style="margin-top:16px;background:#F0F7F4;border:1px solid #C8E0D5;border-radius:12px;padding:20px;">
      <table role="presentation" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align:top;padding-right:12px;">
            <div style="width:32px;height:32px;background:#2D5A4A;border-radius:50%;text-align:center;line-height:32px;">
              <span style="color:#fff;font-size:16px;font-weight:bold;">!</span>
            </div>
          </td>
          <td>
            <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#1A3D32;">Send Proof of Payment</p>
            <p style="margin:0;font-size:13px;color:#2D5A4A;line-height:1.6;">Once you've completed your payment, reply to this email with a <strong>screenshot of the payment confirmation</strong>. This helps us verify and process your order faster.</p>
          </td>
        </tr>
      </table>
    </div>

    ${divider()}

    <!-- Delivery Address -->
    <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#2D5A4A;text-transform:uppercase;letter-spacing:1px;">Delivery Address</p>
    <div style="background:#FAFAF8;border:1px solid #E8DED1;border-radius:12px;padding:16px;">
      <p style="margin:0;font-size:14px;color:#1C1C1C;line-height:1.6;">${shipping_address}</p>
    </div>
  `;

  return emailWrapper({
    preheader: `Order ${order_ref} confirmed - ${total} via ${payment_method}`,
    heroIcon: `<div style="width:56px;height:56px;background:rgba(139,168,136,0.2);border-radius:50%;display:inline-block;text-align:center;line-height:56px;"><span style="font-size:28px;">&#10003;</span></div>`,
    heroTitle: 'Order Confirmed',
    heroSubtitle: `Order ${order_ref}`,
    bodyContent,
  });
}


// ═══════════════════════════════════════════════════════════════════
// 2. ADMIN ORDER NOTIFICATION
// ═══════════════════════════════════════════════════════════════════
function orderAdminHTML(data) {
  const {
    to_name, order_ref, order_date, items_list, subtotal,
    discount, shipping, total, payment_method, payment_status,
    shipping_address, delivery_method, customer_email, customer_phone,
    psc_pin,
  } = data;

  const items = items_list.split('\n').filter(l => l.trim());
  const itemRowsHTML = items.map((line, i) => `
    <tr>
      <td style="padding:10px 0;${i < items.length - 1 ? 'border-bottom:1px solid #F5F1EB;' : ''}font-size:14px;color:#1C1C1C;">${line}</td>
    </tr>`).join('');

  // Payment badge color
  let badgeColor = '#C4704B';
  let badgeBg = '#FFF3ED';
  if (payment_method === 'Bitcoin') { badgeColor = '#F7931A'; badgeBg = '#FFF9F0'; }
  else if (payment_method === 'Bank Transfer') { badgeColor = '#2D5A4A'; badgeBg = '#F0F7F4'; }
  else { badgeColor = '#4A8B9C'; badgeBg = '#F0F7F9'; }

  // Paysafecard PIN section
  const pscPinSection = psc_pin ? `
    <div style="background:#FFF9F0;border:2px solid #F59E0B;border-radius:12px;padding:20px;margin-bottom:20px;">
      <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1px;">Paysafecard PIN</p>
      <p style="margin:0 0 8px;font-size:24px;font-weight:700;color:#1C1C1C;font-family:'SF Mono','Fira Code','Courier New',monospace;letter-spacing:3px;">${psc_pin}</p>
      <p style="margin:0;font-size:12px;color:#92400E;">Verify at paysafecard.com before processing</p>
    </div>` : '';

  const bodyContent = `
    <!-- Order headline -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td>
          <p style="margin:0 0 4px;font-size:13px;color:#5A5A5A;">New order from</p>
          <p style="margin:0;font-size:20px;font-weight:700;color:#1C1C1C;">${to_name}</p>
        </td>
        <td align="right" valign="top">
          <div style="display:inline-block;background:${badgeBg};border:1px solid ${badgeColor}33;border-radius:20px;padding:6px 14px;">
            <span style="font-size:13px;font-weight:600;color:${badgeColor};">${payment_method}</span>
          </div>
        </td>
      </tr>
    </table>

    <!-- Order ref + total highlight -->
    <div style="background:linear-gradient(135deg,#1A3D32,#2D5A4A);border-radius:12px;padding:20px;margin-bottom:24px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        <tr>
          <td>
            <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#8BA888;text-transform:uppercase;letter-spacing:1px;">Order Ref</p>
            <p style="margin:0;font-size:18px;font-weight:700;color:#FFFFFF;font-family:'SF Mono','Fira Code','Courier New',monospace;">${order_ref}</p>
          </td>
          <td align="right">
            <p style="margin:0 0 2px;font-size:11px;font-weight:600;color:#8BA888;text-transform:uppercase;letter-spacing:1px;">Total</p>
            <p style="margin:0;font-size:22px;font-weight:700;color:#FFFFFF;">${total}</p>
          </td>
        </tr>
      </table>
    </div>

    <!-- Customer Details -->
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#2D5A4A;text-transform:uppercase;letter-spacing:1px;">Customer Details</p>
    ${sectionBox('#FAFAF8', '#E8DED1', `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;">
        ${infoRow('Email', `<a href="mailto:${customer_email}" style="color:#C4704B;text-decoration:none;">${customer_email}</a>`)}
        ${infoRow('Phone', customer_phone || 'N/A')}
        ${infoRow('Delivery', delivery_method)}
        ${infoRow('Address', shipping_address)}
      </table>
    `)}

    <!-- Payment Info -->
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#2D5A4A;text-transform:uppercase;letter-spacing:1px;">Payment</p>
    ${sectionBox('#FAFAF8', '#E8DED1', `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;">
        ${infoRow('Method', payment_method)}
        ${infoRow('Status', payment_status)}
        ${infoRow('Date', order_date)}
      </table>
    `)}

    ${pscPinSection}

    <!-- Items -->
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#2D5A4A;text-transform:uppercase;letter-spacing:1px;">Items</p>
    <div style="background:#FAFAF8;border:1px solid #E8DED1;border-radius:12px;padding:16px 20px;margin-bottom:20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${itemRowsHTML}
      </table>
    </div>

    <!-- Totals -->
    <div style="background:#FAFAF8;border:1px solid #E8DED1;border-radius:12px;padding:20px;">
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
        ${infoRow('Subtotal', subtotal)}
        ${discount !== '$0.00' ? infoRow('Discount', discount, '#2D5A4A', '#2D5A4A') : ''}
        ${infoRow('Shipping', shipping)}
        <tr><td colspan="2" style="padding:8px 0;"><div style="border-top:2px solid #E8DED1;"></div></td></tr>
        <tr>
          <td style="padding:6px 0;font-size:18px;font-weight:700;color:#1C1C1C;">Total</td>
          <td style="padding:6px 0;text-align:right;font-size:18px;font-weight:700;color:#1C1C1C;">${total}</td>
        </tr>
      </table>
    </div>
  `;

  return emailWrapper({
    preheader: `New order ${order_ref} - ${total} via ${payment_method} from ${to_name}`,
    heroIcon: `<div style="width:56px;height:56px;background:rgba(196,112,75,0.2);border-radius:50%;display:inline-block;text-align:center;line-height:56px;"><span style="font-size:24px;color:#C4704B;">&#9733;</span></div>`,
    heroTitle: 'New Order Received',
    heroSubtitle: `${total} via ${payment_method}`,
    bodyContent,
  });
}


// ═══════════════════════════════════════════════════════════════════
// 3. CONTACT FORM NOTIFICATION
// ═══════════════════════════════════════════════════════════════════
function contactAdminHTML({ from_name, from_email, order_ref, subject, message }) {

  const bodyContent = `
    <!-- Sender info -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
      <tr>
        <td>
          <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#C4704B,#D4896A);border-radius:50%;text-align:center;line-height:48px;vertical-align:middle;margin-right:14px;">
            <span style="font-size:20px;font-weight:700;color:#FFFFFF;">${from_name.charAt(0).toUpperCase()}</span>
          </div>
          <div style="display:inline-block;vertical-align:middle;">
            <p style="margin:0;font-size:18px;font-weight:700;color:#1C1C1C;">${from_name}</p>
            <p style="margin:2px 0 0;font-size:14px;color:#5A5A5A;">
              <a href="mailto:${from_email}" style="color:#C4704B;text-decoration:none;">${from_email}</a>
            </p>
          </div>
        </td>
      </tr>
    </table>

    <!-- Contact details -->
    ${sectionBox('#FAFAF8', '#E8DED1', `
      <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="font-size:14px;">
        ${infoRow('Subject', subject)}
        ${order_ref ? infoRow('Order Ref', order_ref) : ''}
      </table>
    `)}

    <!-- Message -->
    <p style="margin:0 0 12px;font-size:13px;font-weight:700;color:#2D5A4A;text-transform:uppercase;letter-spacing:1px;">Message</p>
    <div style="background:#FAFAF8;border:1px solid #E8DED1;border-radius:12px;padding:20px;">
      <p style="margin:0;font-size:14px;color:#1C1C1C;line-height:1.7;white-space:pre-wrap;">${message}</p>
    </div>

    <div style="margin-top:20px;text-align:center;">
      <a href="mailto:${from_email}?subject=Re: ${subject}" style="display:inline-block;background:linear-gradient(135deg,#2D5A4A,#3D7A64);color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:12px 32px;border-radius:8px;">Reply to ${from_name.split(' ')[0]}</a>
    </div>
  `;

  return emailWrapper({
    preheader: `New message from ${from_name}: ${subject}`,
    heroIcon: `<div style="width:56px;height:56px;background:rgba(74,139,156,0.2);border-radius:50%;display:inline-block;text-align:center;line-height:56px;"><span style="font-size:24px;color:#6BA3B2;">&#9993;</span></div>`,
    heroTitle: 'New Contact Message',
    heroSubtitle: `From ${from_name}`,
    bodyContent,
  });
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

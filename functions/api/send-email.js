// Cloudflare Pages Function — /api/send-email
// Handles all outbound emails via the Resend API
// Flat, minimalist, professional editorial design with zero emojis.

const ADMIN_EMAIL = 'hello@mullawaysmedicalcannabis.store';
const BRAND = 'Mullaways Medical Cannabis';
const SITE_URL = 'https://mullawaysmedicalcannabis.store';
const WHATSAPP_NUMBER = '+61420133074';
const WHATSAPP_DISPLAY = '+61 420 133 074';

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

// ── Helpers ──────────────────────────────────────────────────────────────────

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function sectionLabel(text) {
  return `<p style="margin:0 0 10px;font-size:11px;font-weight:700;color:#527A66;text-transform:uppercase;letter-spacing:1.5px;">${text}</p>`;
}

function divider() {
  return '<div style="height:1px;background-color:#E5E7EB;margin:24px 0;"></div>';
}

function dataRow(label, value) {
  return `<tr>
<td style="padding:6px 0;font-size:13px;color:#6B7280;vertical-align:top;width:140px;font-weight:500;">${label}</td>
<td style="padding:6px 0;font-size:13px;color:#111827;font-weight:500;">${value}</td>
</tr>`;
}

function sumRow(label, value, isTotal) {
  return `<tr>
<td style="padding:${isTotal ? '12px 0 2px' : '5px 0'};font-size:${isTotal ? '15' : '13'}px;font-weight:${isTotal ? '700' : '500'};color:${isTotal ? '#111827' : '#4B5563'};">${label}</td>
<td style="padding:${isTotal ? '12px 0 2px' : '5px 0'};text-align:right;font-size:${isTotal ? '16' : '13'}px;font-weight:${isTotal ? '700' : '600'};color:${isTotal ? '#1F4D3C' : '#111827'};">${value}</td>
</tr>`;
}

function liveChatLink(orderRef) {
  return `${SITE_URL}/order-confirmation/?ref=${encodeURIComponent(orderRef || '')}`;
}

function whatsappLink(orderRef, total) {
  const amountStr = total ? ` (${total})` : '';
  const text = orderRef
    ? `Hi Mullaways, I just placed order ${orderRef}${amountStr} and I need the bank transfer / PayID details to complete payment.`
    : 'Hi Mullaways, I need assistance with an order.';
  return `https://wa.me/61420133074?text=${encodeURIComponent(text)}`;
}

// ── Email Wrapper (Flat, Minimalist, No Emojis) ─────────────────────────────
function emailWrapper({ preheader, badgeText, heroTitle, heroSub, bodyContent }) {
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
  body{margin:0;padding:0;background-color:#F8F9FA}
  @media only screen and (max-width:620px){
    .outer{width:100%!important;padding:16px 8px!important}
    .card{width:100%!important;border-radius:6px!important}
    .inner{padding:24px 20px 32px!important}
    .header-pad{padding:20px 20px!important}
    .foot-pad{padding:24px 20px!important}
    .btn-stack{display:block!important;width:100%!important;margin-bottom:10px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#111827;">
<div style="display:none;font-size:1px;color:#F8F9FA;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader || ''}</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F8F9FA;">
<tr><td class="outer" align="center" style="padding:40px 16px;">

<table role="presentation" class="card" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:8px;border:1px solid #E5E7EB;overflow:hidden;">

<!-- Top Minimalist Accent Line -->
<tr><td style="height:3px;background-color:#1F4D3C;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Header / Wordmark -->
<tr><td class="header-pad" style="padding:24px 36px 20px;border-bottom:1px solid #E5E7EB;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td valign="middle">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="vertical-align:middle;padding-right:10px;">
      <!-- Monoline Leaf SVG Icon -->
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1F4D3C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block;">
        <path d="M11 20A7 7 0 0 1 4 13a7 7 0 0 1 7-7 7 7 0 0 1 7 7v1a6 6 0 0 1-6 6z"/>
        <path d="M11 13a3 3 0 0 0 3-3"/>
      </svg>
    </td>
    <td valign="middle">
      <a href="${SITE_URL}" style="text-decoration:none;display:block;">
        <span style="font-size:14px;font-weight:700;color:#111827;letter-spacing:0.8px;display:block;line-height:1.2;">MULLAWAYS</span>
        <span style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;display:block;">Medical Cannabis Australia</span>
      </a>
    </td>
  </tr></table>
</td>
<td align="right" valign="middle">
  ${badgeText ? `<span style="display:inline-block;padding:4px 10px;background-color:#F3F4F6;color:#374151;font-size:11px;font-weight:600;border-radius:4px;letter-spacing:0.5px;text-transform:uppercase;">${badgeText}</span>` : ''}
</td>
</tr>
</table>
</td></tr>

<!-- Hero Headline -->
<tr><td style="padding:32px 36px 24px;">
<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#111827;line-height:1.3;letter-spacing:-0.3px;">${heroTitle}</h1>
${heroSub ? `<p style="margin:0;font-size:14px;color:#4B5563;line-height:1.5;">${heroSub}</p>` : ''}
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 36px;"><div style="height:1px;background-color:#E5E7EB;"></div></td></tr>

<!-- Body Content -->
<tr><td class="inner" style="padding:28px 36px 36px;">
${bodyContent}
</td></tr>

<!-- Trust Indicators (Flat, Clean SVGs, No Emojis) -->
<tr><td style="padding:18px 36px;background-color:#F9FAFB;border-top:1px solid #E5E7EB;border-bottom:1px solid #E5E7EB;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="33%" align="center" style="padding:4px 6px;">
  <!-- Shield Vector Icon -->
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#527A66" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 6px;">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>
  <span style="font-size:11px;font-weight:600;color:#111827;display:block;">100% Smell-Proof</span>
  <span style="font-size:10px;color:#6B7280;display:block;margin-top:2px;">Triple heat-sealed</span>
</td>
<td width="34%" align="center" style="padding:4px 6px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
  <!-- Box Vector Icon -->
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#527A66" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 6px;">
    <polyline points="21 8 21 21 3 21 3 8"/>
    <rect x="1" y="3" width="22" height="5"/>
    <line x1="10" y1="12" x2="14" y2="12"/>
  </svg>
  <span style="font-size:11px;font-weight:600;color:#111827;display:block;">Discreet Packaging</span>
  <span style="font-size:10px;color:#6B7280;display:block;margin-top:2px;">Zero cannabis markings</span>
</td>
<td width="33%" align="center" style="padding:4px 6px;">
  <!-- Truck Vector Icon -->
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#527A66" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" style="display:block;margin:0 auto 6px;">
    <rect x="1" y="3" width="15" height="13"/>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/>
    <circle cx="5.5" cy="18.5" r="2.5"/>
    <circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
  <span style="font-size:11px;font-weight:600;color:#111827;display:block;">Tracked Delivery</span>
  <span style="font-size:10px;color:#6B7280;display:block;margin-top:2px;">Australia Post Express</span>
</td>
</tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td class="foot-pad" style="padding:28px 36px 32px;background-color:#FFFFFF;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td>
<p style="margin:0 0 6px;font-size:12px;font-weight:700;color:#111827;">${BRAND}</p>
<p style="margin:0 0 12px;font-size:12px;color:#6B7280;line-height:1.6;">
  Store: <a href="${SITE_URL}" style="color:#1F4D3C;text-decoration:none;font-weight:600;">mullawaysmedicalcannabis.store</a> &middot;
  Email: <a href="mailto:${ADMIN_EMAIL}" style="color:#1F4D3C;text-decoration:none;font-weight:600;">${ADMIN_EMAIL}</a><br>
  WhatsApp: <a href="${whatsappLink()}" style="color:#1F4D3C;text-decoration:none;font-weight:600;">${WHATSAPP_DISPLAY}</a> &middot;
  Support Hours: Mon&ndash;Fri 9:00 AM&ndash;6:00 PM AEST
</p>
<p style="margin:0 0 14px;font-size:11px;color:#9CA3AF;line-height:1.5;">
  This notification is related to your order with Mullaways Medical Cannabis Australia. Products are strictly intended for Australian adults aged 18+.
</p>
<div style="font-size:11px;color:#9CA3AF;">
  <a href="${SITE_URL}/shop/" style="color:#6B7280;text-decoration:none;margin-right:12px;">Shop Catalog</a>
  <a href="${SITE_URL}/shipping-and-delivery/" style="color:#6B7280;text-decoration:none;margin-right:12px;">Shipping &amp; Delivery</a>
  <a href="${SITE_URL}/faq/" style="color:#6B7280;text-decoration:none;margin-right:12px;">FAQs</a>
  <a href="${SITE_URL}/privacy-policy/" style="color:#6B7280;text-decoration:none;">Privacy Policy</a>
</div>
</td></tr>
</table>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── 3-Step Order Progress Tracker (Flat, Minimalist) ─────────────────────────
function orderProgressTracker({ step2Active = true, step3Active = false }) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 24px;background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:12px 14px;">
<tr>
<td class="tracker-col" width="33%" align="center" style="padding:4px;">
  <span style="font-size:11px;font-weight:700;color:#059669;display:block;">1. Order Logged</span>
  <span style="font-size:10px;color:#6B7280;display:block;margin-top:2px;">Confirmed</span>
</td>
<td class="tracker-col" width="34%" align="center" style="padding:4px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
  <span style="font-size:11px;font-weight:700;color:${step2Active ? '#D97706' : '#111827'};display:block;">2. Payment</span>
  <span style="font-size:10px;color:${step2Active ? '#B45309' : '#059669'};font-weight:600;display:block;margin-top:2px;">${step2Active ? 'Action Required' : 'Verified'}</span>
</td>
<td class="tracker-col" width="33%" align="center" style="padding:4px;">
  <span style="font-size:11px;font-weight:700;color:${step3Active ? '#111827' : '#9CA3AF'};display:block;">3. Tracked Dispatch</span>
  <span style="font-size:10px;color:#9CA3AF;display:block;margin-top:2px;">Australia Post</span>
</td>
</tr>
</table>`;
}

// ── Bank Transfer Contact Action Block (WhatsApp + Live Chat) ────────────────
function bankTransferActionBlock({ orderRef, total }) {
  const waUrl = whatsappLink(orderRef, total);
  const chatUrl = liveChatLink(orderRef);

  return `
<div style="background-color:#F8FAF9;border:1px solid #D1E5DA;border-radius:8px;padding:22px 20px;margin:0 0 28px;">
  <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#1F4D3C;text-transform:uppercase;letter-spacing:1px;">Action Required &bull; Bank Transfer / PayID Details</p>
  <h2 style="margin:0 0 8px;font-size:16px;font-weight:700;color:#111827;line-height:1.35;">Contact us to receive Bank Details and complete payment</h2>
  <p style="margin:0 0 16px;font-size:13px;color:#374151;line-height:1.6;">
    For client confidentiality and security, PayID and direct bank transfer details are provided directly by our dispensary team. Please message us on <strong>WhatsApp</strong> or <strong>Live Chat</strong> quoting your order reference <strong style="font-family:'SF Mono',Consolas,monospace;background:#EBF2ED;padding:2px 6px;border-radius:4px;color:#111827;">${orderRef}</strong>.
  </p>

  <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
  <tr>
    <td style="padding-bottom:10px;">
      <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:100%;box-sizing:border-box;text-align:center;background-color:#128C7E;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:600;padding:12px 18px;border-radius:6px;letter-spacing:0.2px;">
        <!-- Inlined WhatsApp SVG -->
        <svg width="15" height="15" viewBox="0 0 24 24" fill="#FFFFFF" style="vertical-align:middle;margin-right:6px;display:inline-block;">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 13.85 2.5 15.58 3.38 17.07L2 22L7.07 20.65C8.52 21.51 10.21 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM16.63 15.68C16.44 16.22 15.63 16.69 15.03 16.78C14.62 16.84 14.09 16.88 12.28 16.13C9.97 15.17 8.48 12.82 8.36 12.67C8.25 12.51 7.42 11.4 7.42 10.27C7.42 9.13 8 8.58 8.23 8.34C8.42 8.14 8.73 8.05 9.03 8.05C9.13 8.05 9.22 8.05 9.3 8.06C9.53 8.07 9.65 8.08 9.8 8.44C9.99 8.89 10.45 10.02 10.51 10.13C10.57 10.25 10.61 10.39 10.53 10.54C10.46 10.7 10.39 10.79 10.28 10.92C10.16 11.05 10.06 11.14 9.93 11.3C9.79 11.45 9.64 11.61 9.8 11.89C9.97 12.18 10.55 13.12 11.4 13.88C12.5 14.86 13.4 15.17 13.72 15.3C13.97 15.4 14.12 15.38 14.27 15.21C14.46 14.99 15.06 14.28 15.28 13.97C15.49 13.67 15.72 13.71 16.03 13.82C16.34 13.94 17.98 14.75 18.32 14.92C18.66 15.09 18.88 15.17 18.96 15.3C19.04 15.43 19.04 16.04 18.63 15.68Z"/>
        </svg>
        Chat on WhatsApp (${WHATSAPP_DISPLAY})
      </a>
    </td>
  </tr>
  <tr>
    <td>
      <a href="${chatUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-block;width:100%;box-sizing:border-box;text-align:center;background-color:#FFFFFF;border:1px solid #D1D5DB;color:#111827;text-decoration:none;font-size:13px;font-weight:600;padding:11px 18px;border-radius:6px;letter-spacing:0.2px;">
        <!-- Inlined Chat Bubble SVG -->
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;display:inline-block;">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        Open Website Live Chat
      </a>
    </td>
  </tr>
  </table>

  <p style="margin:12px 0 0;font-size:11px;color:#6B7280;text-align:center;">
    Quote reference <strong style="font-family:'SF Mono',Consolas,monospace;color:#111827;">${orderRef}</strong> &bull; Amount: <strong style="color:#111827;">${total}</strong>
  </p>
</div>`;
}

// ── 1. Customer Order Confirmation ───────────────────────────────────────────
function orderCustomerHTML(data) {
  const to_name = escHtml(data.to_name);
  const order_ref = escHtml(data.order_ref);
  const order_date = escHtml(data.order_date);
  const subtotal = escHtml(data.subtotal);
  const discount = escHtml(data.discount);
  const shipping = escHtml(data.shipping);
  const total = escHtml(data.total);
  const payment_method = escHtml(data.payment_method);
  const shipping_address = escHtml(data.shipping_address);
  const delivery_method = escHtml(data.delivery_method);
  const btc_address = escHtml(data.btc_address);

  const firstName = to_name.split(' ')[0] || to_name;
  const items = String(data.items_list || '').split('\n').filter(l => l.trim()).map(l => escHtml(l));

  const isBtc = payment_method === 'Bitcoin';
  const isBtcConfirmed = data.payment_status === 'Payment confirmed on blockchain';

  const itemRows = items.map((line, i) =>
    `<tr>
      <td style="padding:8px 0;font-size:13px;color:#1F2937;line-height:1.5;${i < items.length - 1 ? 'border-bottom:1px solid #F3F4F6;' : ''}">
        ${line}
      </td>
    </tr>`
  ).join('');

  // BTC payment details section (for Bitcoin orders)
  const btcSection = btc_address ? `
${divider()}
${sectionLabel('Bitcoin Payment Details')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F8FAF9;border:1px solid #E5E7EB;border-radius:6px;padding:18px;margin-bottom:16px;">
<tr><td align="center">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin%3A${btc_address}" alt="Bitcoin Deposit QR" width="130" height="130" style="display:block;margin:0 auto 12px;border:1px solid #E5E7EB;border-radius:4px;">
  <p style="margin:0 0 4px;font-size:11px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Deposit Wallet Address</p>
  <p style="margin:0 0 8px;font-size:11px;color:#111827;word-break:break-all;font-family:'SF Mono',Consolas,monospace;background:#FFFFFF;padding:6px 10px;border:1px solid #E5E7EB;border-radius:4px;max-width:340px;line-height:1.4;">${btc_address}</p>
  <p style="margin:0;font-size:11px;color:#1F4D3C;font-weight:600;">10% Crypto Discount Applied &bull; Verified via blockchain node</p>
</td></tr>
</table>
` : '';

  const bodyContent = `
${orderProgressTracker({ step2Active: !isBtcConfirmed, step3Active: isBtcConfirmed })}

<p style="margin:0 0 20px;font-size:14px;color:#374151;line-height:1.6;">
  Hi ${firstName}, thank you for your order. We have logged order <strong style="font-family:'SF Mono',Consolas,monospace;color:#111827;">${order_ref}</strong>. ${!isBtc
    ? 'To complete payment, please message us on WhatsApp or Live Chat to receive bank account or PayID details.'
    : (isBtcConfirmed
      ? 'Your Bitcoin payment has been verified on the blockchain. Your package is being prepared for discreet dispatch.'
      : 'Please transfer the Bitcoin amount to the wallet address below.')}
</p>

${!isBtc ? bankTransferActionBlock({ orderRef: order_ref, total }) : ''}

${sectionLabel('Order Summary')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:10px;">
${dataRow('Order Reference', `<span style="font-family:'SF Mono',Consolas,monospace;font-size:13px;font-weight:700;color:#111827;">${order_ref}</span>`)}
${dataRow('Order Date', order_date)}
${dataRow('Delivery Tier', delivery_method)}
${dataRow('Payment Method', `<span style="font-weight:600;color:#111827;">${payment_method}</span>`)}
</table>

${divider()}

${sectionLabel('Items Ordered')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${itemRows}
</table>

<div style="margin:16px 0 0;padding:14px 16px;background-color:#F9FAFB;border-radius:6px;border:1px solid #E5E7EB;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${sumRow('Subtotal', subtotal)}
${discount !== '$0.00' ? sumRow('Discount', `<span style="color:#059669;">${discount}</span>`) : ''}
${sumRow('Shipping', shipping)}
<tr><td colspan="2" style="padding:6px 0;"><div style="height:1px;background-color:#E5E7EB;"></div></td></tr>
${sumRow('Total (AUD)', total, true)}
</table>
</div>

${btcSection}

${divider()}

${sectionLabel('Shipping & Recipient')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('Recipient', to_name)}
${dataRow('Address', shipping_address)}
${dataRow('Packaging', 'Plain odour-proof vacuum satchel (discreet)')}
</table>
`;

  return emailWrapper({
    preheader: `Order ${order_ref} summary (${total}). ${!isBtc ? 'Contact on WhatsApp or Live Chat for bank details.' : 'Bitcoin payment details enclosed.'}`,
    badgeText: isBtc ? (isBtcConfirmed ? 'Payment Confirmed' : 'Awaiting Bitcoin Payment') : 'Action Required: Finalise Payment',
    heroTitle: isBtcConfirmed ? 'Payment Confirmed — Order Processing' : `Order Placed: ${order_ref}`,
    heroSub: isBtcConfirmed
      ? 'Your payment was confirmed on the blockchain. Your package is entering priority dispatch.'
      : 'Review your order summary and follow the payment instructions below.',
    bodyContent,
  });
}

// ── 2. Admin Order Notification ──────────────────────────────────────────────
function orderAdminHTML(data) {
  const to_name = escHtml(data.to_name);
  const order_ref = escHtml(data.order_ref);
  const order_date = escHtml(data.order_date);
  const subtotal = escHtml(data.subtotal);
  const discount = escHtml(data.discount);
  const shipping = escHtml(data.shipping);
  const total = escHtml(data.total);
  const payment_method = escHtml(data.payment_method);
  const payment_status = escHtml(data.payment_status);
  const shipping_address = escHtml(data.shipping_address);
  const delivery_method = escHtml(data.delivery_method);
  const customer_email = escHtml(data.customer_email);
  const customer_phone = escHtml(data.customer_phone);

  const items = String(data.items_list || '').split('\n').filter(l => l.trim()).map(l => escHtml(l));

  const itemRows = items.map((line, i) =>
    `<tr>
      <td style="padding:8px 0;font-size:13px;color:#1F2937;${i < items.length - 1 ? 'border-bottom:1px solid #F3F4F6;' : ''}">
        ${line}
      </td>
    </tr>`
  ).join('');

  const bodyContent = `
<!-- Highlight Card -->
<div style="background-color:#111827;padding:16px 20px;border-radius:6px;margin-bottom:24px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td>
  <span style="font-size:10px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Order Reference</span>
  <span style="font-size:15px;font-weight:700;color:#FFFFFF;font-family:'SF Mono',Consolas,monospace;">${order_ref}</span>
</td>
<td align="right">
  <span style="font-size:10px;font-weight:600;color:#9CA3AF;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:3px;">Order Total</span>
  <span style="font-size:18px;font-weight:700;color:#10B981;">${total}</span>
</td>
</tr>
</table>
</div>

${sectionLabel('Customer Details')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('Customer Name', `<strong style="color:#111827;">${to_name}</strong>`)}
${dataRow('Email Address', `<a href="mailto:${customer_email}" style="color:#1F4D3C;text-decoration:underline;">${customer_email}</a>`)}
${dataRow('Phone Number', customer_phone ? `<a href="tel:${customer_phone}" style="color:#1F4D3C;text-decoration:none;">${customer_phone}</a>` : 'Not provided')}
${dataRow('Payment Option', `<strong style="color:#111827;">${payment_method}</strong>`)}
${dataRow('Payment Status', payment_status || 'Pending')}
${dataRow('Order Date', order_date)}
</table>

${divider()}

${sectionLabel('Delivery Address')}
<div style="padding:12px 14px;background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;margin-bottom:12px;">
  <p style="margin:0 0 3px;font-size:13px;font-weight:600;color:#111827;">${shipping_address}</p>
  <p style="margin:0;font-size:12px;color:#6B7280;">Tier: ${delivery_method}</p>
</div>

${divider()}

${sectionLabel('Items to Pack')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${itemRows}
</table>

<div style="margin:16px 0 0;padding:14px 16px;background-color:#F9FAFB;border-radius:6px;border:1px solid #E5E7EB;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${sumRow('Subtotal', subtotal)}
${discount !== '$0.00' ? sumRow('Discount', discount) : ''}
${sumRow('Shipping', shipping)}
<tr><td colspan="2" style="padding:6px 0;"><div style="height:1px;background-color:#E5E7EB;"></div></td></tr>
${sumRow('Total Order Value', total, true)}
</table>
</div>
`;

  return emailWrapper({
    preheader: `New Order: ${order_ref} — ${total} via ${payment_method} from ${to_name}`,
    badgeText: 'New Order',
    heroTitle: `${total} via ${payment_method}`,
    heroSub: `Customer: ${to_name} (${customer_email}) &bull; Ref: ${order_ref}`,
    bodyContent,
  });
}

// ── 3. Contact Form Notification ─────────────────────────────────────────────
function contactAdminHTML(data) {
  const from_name = escHtml(data.from_name);
  const from_email = escHtml(data.from_email);
  const order_ref = escHtml(data.order_ref);
  const subject = escHtml(data.subject);
  const message = escHtml(data.message);
  const message_type = escHtml(data.message_type || 'general');
  const product_name = escHtml(data.product_name);
  const rating = escHtml(data.rating);

  const bodyContent = `
${sectionLabel('Sender Details')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('From', `<strong style="color:#111827;">${from_name}</strong>`)}
${dataRow('Email', `<a href="mailto:${from_email}" style="color:#1F4D3C;text-decoration:underline;">${from_email}</a>`)}
${dataRow('Inquiry Topic', message_type.toUpperCase())}
${order_ref ? dataRow('Order Reference', `<span style="font-family:'SF Mono',Consolas,monospace;font-weight:700;">${order_ref}</span>`) : ''}
${product_name ? dataRow('Product', product_name) : ''}
${rating ? dataRow('Review Rating', `${rating} of 5`) : ''}
${dataRow('Subject', subject)}
</table>

${divider()}

${sectionLabel('Message')}
<div style="padding:14px 16px;background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;margin-bottom:20px;">
  <p style="margin:0;font-size:13px;color:#1F2937;line-height:1.65;white-space:pre-wrap;">${message}</p>
</div>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td align="left">
  <a href="mailto:${from_email}?subject=Re: ${subject}" style="display:inline-block;background-color:#111827;color:#FFFFFF;text-decoration:none;font-size:13px;font-weight:600;padding:10px 20px;border-radius:6px;">
    Reply to Customer
  </a>
</td></tr>
</table>
`;

  return emailWrapper({
    preheader: `Enquiry [${message_type}]: ${subject} from ${from_name}`,
    badgeText: `Enquiry: ${message_type}`,
    heroTitle: 'New Contact Form Submission',
    heroSub: `From ${from_name} (${from_email})`,
    bodyContent,
  });
}

// ── Request Handler ──────────────────────────────────────────────────────────
export async function onRequestPost(context) {
  const { env, request } = context;
  const apiKey = env.RESEND_API_KEY;

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
  const fromAddress = env.RESEND_FROM || `${BRAND} <hello@mullawaysmedicalcannabis.store>`;

  try {
    if (type === 'order-customer') {
      const { data } = body;
      if (!data?.to_email) {
        return new Response(
          JSON.stringify({ error: 'Missing to_email' }),
          { status: 400, headers }
        );
      }

      const isBtc = data.payment_method === 'Bitcoin';
      const isBtcConfirmed = data.payment_status === 'Payment confirmed on blockchain';
      const custSubject = isBtc
        ? (isBtcConfirmed
            ? `Order Confirmed: ${data.order_ref} — Bitcoin Payment Verified`
            : `Order Confirmed: ${data.order_ref} — Complete Bitcoin Payment`)
        : `Order Confirmed: ${data.order_ref} — Contact on WhatsApp or Live Chat for Bank Details`;

      const result = await sendEmail(apiKey, {
        from: fromAddress,
        to: data.to_email,
        replyTo: ADMIN_EMAIL,
        subject: custSubject,
        html: orderCustomerHTML(data),
      });

      return new Response(JSON.stringify({ success: true, id: result.id }), { headers });

    } else if (type === 'order-admin') {
      const { data } = body;

      const result = await sendEmail(apiKey, {
        from: fromAddress,
        to: ADMIN_EMAIL,
        replyTo: data.customer_email || ADMIN_EMAIL,
        subject: `New Order ${data.order_ref} — ${data.total} via ${data.payment_method}`,
        html: orderAdminHTML(data),
      });

      return new Response(JSON.stringify({ success: true, id: result.id }), { headers });

    } else if (type === 'newsletter') {
      const { data } = body;
      if (!data?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        return new Response(
          JSON.stringify({ error: 'Invalid email address' }),
          { status: 400, headers }
        );
      }

      const sourceUrl = (data.source || '').toString().slice(0, 200);
      const newsletterHTML = emailWrapper({
        preheader: `Newsletter subscriber: ${data.email}`,
        badgeText: 'New Subscriber',
        heroTitle: 'New Newsletter Signup',
        heroSub: data.email,
        bodyContent: `
${sectionLabel('Subscriber Details')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('Email Address', `<a href="mailto:${data.email}" style="color:#1F4D3C;text-decoration:none;font-weight:600;">${data.email}</a>`)}
${sourceUrl ? dataRow('Signup Page', sourceUrl) : ''}
${dataRow('Timestamp', new Date().toISOString())}
</table>
`,
      });

      const result = await sendEmail(apiKey, {
        from: fromAddress,
        to: ADMIN_EMAIL,
        replyTo: data.email,
        subject: `Newsletter Signup: ${data.email}`,
        html: newsletterHTML,
      });

      return new Response(JSON.stringify({ success: true, id: result.id }), { headers });

    } else if (type === 'contact') {
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
        subject: `[Contact Form] ${data.subject}`,
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

// Cloudflare Pages Function — /api/send-email
// Handles all outbound emails via the Resend API
//
// SETUP:
//   1. Sign up at https://resend.com (free: 3,000 emails/month)
//   2. Verify your domain (DNS records) or use onboarding@resend.dev for testing
//   3. Create an API key at https://resend.com/api-keys
//   4. In Cloudflare Pages → Settings → Environment variables, add:
//        RESEND_API_KEY = re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//
// Accepts POST with JSON body:
//   { type: "order-customer" | "order-admin" | "contact" | "newsletter", ...data }

const ADMIN_EMAIL = 'hello@mullawaysmedicalcannabis.store';
const BRAND = 'Mullaways Medical Cannabis';
const SITE_URL = 'https://mullawaysmedicalcannabis.store';

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
  return `<p style="margin:0 0 12px;font-size:11px;font-weight:700;color:#527A66;text-transform:uppercase;letter-spacing:2px;">${text}</p>`;
}

function divider() {
  return '<div style="height:1px;background-color:#E5E7EB;margin:28px 0;"></div>';
}

function dataRow(label, value) {
  return `<tr>
<td style="padding:7px 0;font-size:13px;color:#6B7280;vertical-align:top;width:130px;font-weight:500;">${label}</td>
<td style="padding:7px 0;font-size:14px;color:#1F2937;font-weight:500;">${value}</td>
</tr>`;
}

function sumRow(label, value, isTotal) {
  return `<tr>
<td style="padding:${isTotal ? '12px 0 4px' : '5px 0'};font-size:${isTotal ? '17' : '14'}px;font-weight:${isTotal ? '700' : '500'};color:${isTotal ? '#111827' : '#4B5563'};">${label}</td>
<td style="padding:${isTotal ? '12px 0 4px' : '5px 0'};text-align:right;font-size:${isTotal ? '18' : '14'}px;font-weight:${isTotal ? '700' : '600'};color:${isTotal ? '#1F4D3C' : '#111827'};">${value}</td>
</tr>`;
}

function liveChatLink(orderRef) {
  return `${SITE_URL}/order-confirmation/?ref=${encodeURIComponent(orderRef || '')}`;
}

// ── Email Wrapper ────────────────────────────────────────────────────────────
// Modern, responsive email container with botanical branding, typography & email client fallbacks
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
  body{margin:0;padding:0;background-color:#F4F6F4}
  @media only screen and (max-width:620px){
    .outer{width:100%!important;padding:16px 8px!important}
    .card{width:100%!important;border-radius:12px!important}
    .inner{padding:24px 20px 32px!important}
    .hero-pad{padding:28px 20px 24px!important}
    .foot-pad{padding:24px 20px!important}
    .tracker-col{display:block!important;width:100%!important;margin-bottom:8px!important}
  }
</style>
</head>
<body style="margin:0;padding:0;background-color:#F4F6F4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<div style="display:none;font-size:1px;color:#F4F6F4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${preheader || ''}</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F4F6F4;">
<tr><td class="outer" align="center" style="padding:40px 16px;">

<table role="presentation" class="card" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(18,51,38,0.06);border:1px solid #E5E7EB;">

<!-- Top Accent Gradient Line -->
<tr><td style="height:4px;background:linear-gradient(90deg,#1F4D3C 0%,#2D6B53 50%,#C46D46 100%);background-color:#1F4D3C;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Header / Brand Bar -->
<tr><td style="padding:24px 40px 20px;border-bottom:1px solid #F3F4F6;background-color:#FAFAF8;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td valign="middle">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="width:34px;height:34px;background-color:#1F4D3C;border-radius:8px;text-align:center;vertical-align:middle;color:#8BA888;font-size:18px;line-height:34px;">&#x1F33F;</td>
    <td style="padding-left:12px;">
      <a href="${SITE_URL}" style="text-decoration:none;">
        <span style="font-size:16px;font-weight:700;color:#1F4D3C;letter-spacing:0.5px;display:block;line-height:1.2;">Mullaways</span>
        <span style="font-size:10px;font-weight:600;color:#527A66;text-transform:uppercase;letter-spacing:1.5px;display:block;">Medical Cannabis Australia</span>
      </a>
    </td>
  </tr></table>
</td>
<td align="right" valign="middle">
  <a href="mailto:${ADMIN_EMAIL}" style="display:inline-block;padding:6px 12px;background-color:#FFFFFF;border:1px solid #E5E7EB;border-radius:20px;font-size:11px;font-weight:600;color:#1F4D3C;text-decoration:none;">Support &amp; Orders</a>
</td>
</tr>
</table>
</td></tr>

<!-- Hero Banner -->
<tr><td class="hero-pad" style="padding:36px 40px 28px;background-color:#FFFFFF;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td>
${badgeText ? `<span style="display:inline-block;background-color:#EBF5F0;color:#1F4D3C;font-size:11px;font-weight:700;padding:5px 12px;border-radius:20px;text-transform:uppercase;letter-spacing:1px;margin-bottom:14px;">${badgeText}</span>` : ''}
<h1 style="margin:0 0 10px;font-size:28px;font-weight:700;color:#111827;line-height:1.25;letter-spacing:-0.5px;">${heroTitle}</h1>
${heroSub ? `<p style="margin:0;font-size:15px;color:#4B5563;font-weight:400;line-height:1.55;">${heroSub}</p>` : ''}
</td></tr>
</table>
</td></tr>

<!-- Divider -->
<tr><td style="padding:0 40px;"><div style="height:1px;background-color:#F3F4F6;"></div></td></tr>

<!-- Body Content -->
<tr><td class="inner" style="padding:32px 40px 40px;">
${bodyContent}
</td></tr>

<!-- Trust Indicators -->
<tr><td style="padding:20px 40px;background-color:#F9FAFB;border-top:1px solid #F3F4F6;border-bottom:1px solid #F3F4F6;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td width="33%" align="center" style="padding:4px 6px;">
  <span style="display:block;font-size:15px;line-height:1;">&#x1F512;</span>
  <span style="font-size:11px;font-weight:700;color:#374151;display:block;margin-top:4px;">100% Smell-Proof</span>
  <span style="font-size:10px;color:#6B7280;display:block;">Triple heat-sealed</span>
</td>
<td width="33%" align="center" style="padding:4px 6px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
  <span style="display:block;font-size:15px;line-height:1;">&#x1F4E6;</span>
  <span style="font-size:11px;font-weight:700;color:#374151;display:block;margin-top:4px;">Plain Packaging</span>
  <span style="font-size:10px;color:#6B7280;display:block;">Zero weed markings</span>
</td>
<td width="33%" align="center" style="padding:4px 6px;">
  <span style="display:block;font-size:15px;line-height:1;">&#x26A1;</span>
  <span style="font-size:11px;font-weight:700;color:#374151;display:block;margin-top:4px;">Tracked Express</span>
  <span style="font-size:10px;color:#6B7280;display:block;">Australia Post</span>
</td>
</tr>
</table>
</td></tr>

<!-- Footer -->
<tr><td class="foot-pad" style="padding:28px 40px 32px;background-color:#FFFFFF;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td>
<p style="margin:0 0 8px;font-size:13px;font-weight:700;color:#1F4D3C;">${BRAND}</p>
<p style="margin:0 0 14px;font-size:12px;color:#6B7280;line-height:1.6;">
  Official store: <a href="${SITE_URL}" style="color:#1F4D3C;text-decoration:underline;">mullawaysmedicalcannabis.store</a> &middot;
  Order &amp; Contact: <a href="mailto:${ADMIN_EMAIL}" style="color:#1F4D3C;text-decoration:none;font-weight:600;">${ADMIN_EMAIL}</a><br>
  Customer Support: Monday &ndash; Friday 9:00 AM &ndash; 6:00 PM AEST
</p>
<p style="margin:0 0 16px;font-size:11px;color:#9CA3AF;line-height:1.5;">
  You received this email regarding your order or communication with Mullaways Medical Cannabis. Products are intended strictly for adults aged 18+ in Australia.
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

<!-- Bottom Border Line -->
<tr><td style="height:3px;background-color:#1F4D3C;font-size:0;line-height:0;">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

// ── 3-Step Order Progress Tracker ────────────────────────────────────────────
function orderProgressTracker({ step2Active = true, step3Active = false }) {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px 16px;">
<tr>
<td class="tracker-col" width="33%" align="center" style="padding:4px;">
  <span style="display:inline-block;width:22px;height:22px;line-height:22px;border-radius:50%;background-color:#10B981;color:#FFFFFF;font-size:12px;font-weight:700;text-align:center;">&#x2713;</span>
  <span style="display:block;font-size:11px;font-weight:700;color:#111827;margin-top:5px;">1. Order Placed</span>
  <span style="display:block;font-size:10px;color:#059669;">Confirmed</span>
</td>
<td class="tracker-col" width="34%" align="center" style="padding:4px;border-left:1px solid #E5E7EB;border-right:1px solid #E5E7EB;">
  <span style="display:inline-block;width:22px;height:22px;line-height:22px;border-radius:50%;background-color:${step2Active ? '#1F4D3C' : '#E5E7EB'};color:${step2Active ? '#FFFFFF' : '#6B7280'};font-size:11px;font-weight:700;text-align:center;">2</span>
  <span style="display:block;font-size:11px;font-weight:700;color:${step2Active ? '#1F4D3C' : '#6B7280'};margin-top:5px;">2. Payment</span>
  <span style="display:block;font-size:10px;color:${step2Active ? '#D97706' : '#9CA3AF'};font-weight:600;">${step2Active ? 'Action Required' : 'Verified'}</span>
</td>
<td class="tracker-col" width="33%" align="center" style="padding:4px;">
  <span style="display:inline-block;width:22px;height:22px;line-height:22px;border-radius:50%;background-color:${step3Active ? '#10B981' : '#E5E7EB'};color:${step3Active ? '#FFFFFF' : '#6B7280'};font-size:11px;font-weight:700;text-align:center;">3</span>
  <span style="display:block;font-size:11px;font-weight:700;color:${step3Active ? '#111827' : '#9CA3AF'};margin-top:5px;">3. Tracked Dispatch</span>
  <span style="display:block;font-size:10px;color:#9CA3AF;">Express Post</span>
</td>
</tr>
</table>`;
}

// ── BOLD Live Chat Action Block ──────────────────────────────────────────────
function liveChatActionBlock({ orderRef, total, paymentMethod }) {
  const href = liveChatLink(orderRef);
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 30px;">
<tr><td style="background-color:#123326;background:linear-gradient(135deg,#123326 0%,#1F4D3C 60%,#2D6B53 100%);padding:28px 24px 26px;border-radius:14px;box-shadow:0 8px 20px rgba(18,51,38,0.25);">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td>
  <span style="display:inline-block;background-color:#F59E0B;color:#78350F;font-size:10px;font-weight:800;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:1.5px;margin-bottom:12px;">&#x26A0; Action Required</span>
  <h2 style="margin:0 0 10px;font-size:20px;font-weight:700;color:#FFFFFF;line-height:1.3;letter-spacing:-0.2px;">Open Live Chat to Receive Bank Details &amp; Finalise Payment</h2>
  <p style="margin:0 0 18px;font-size:14px;color:#E7F8EF;line-height:1.65;">
    Your order has been received and items are held. For your protection and privacy, <strong style="color:#FFFFFF;">we never transmit bank transfer or PayID account numbers over unencrypted email</strong>. Please click the button below to open our secure site and chat with our staff.
  </p>

  <!-- Outlook VML Fallback -->
  <!--[if mso]>
  <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${href}" style="height:48px;v-text-anchor:middle;width:300px;" arcsize="16%" stroke="f" fillcolor="#D4AF37">
  <w:anchorlock/>
  <center style="color:#123326;font-family:sans-serif;font-size:15px;font-weight:700;letter-spacing:0.3px;">&#x1F4AC; Open Live Chat to Pay</center>
  </v:roundrect>
  <![endif]-->
  <!--[if !mso]><!-- -->
  <a href="${href}" target="_blank" rel="noopener noreferrer" style="display:inline-block;background-color:#EFE8DE;background:linear-gradient(135deg,#FAF7F2 0%,#EFE8DE 100%);color:#123326;text-decoration:none;font-size:15px;font-weight:700;padding:14px 28px;border-radius:10px;letter-spacing:0.2px;box-shadow:0 4px 14px rgba(0,0,0,0.18);">
    &#x1F4AC;&nbsp;&nbsp;Open Live Chat &amp; Get Bank Details
  </a>
  <!--<![endif]-->

  <div style="margin-top:18px;padding-top:14px;border-top:1px solid rgba(255,255,255,0.15);font-size:13px;color:#C8E9D5;line-height:1.5;">
    Quote your order reference <strong style="color:#FFFFFF;font-family:'SF Mono',Consolas,monospace;background:rgba(0,0,0,0.25);padding:2px 6px;border-radius:4px;">${orderRef}</strong> when chat opens${paymentMethod ? ` &bull; Payment: <strong style="color:#FFFFFF;">${paymentMethod}</strong>` : ''}${total ? ` &bull; Amount: <strong style="color:#FFFFFF;">${total}</strong>` : ''}.
  </div>
</td></tr>
</table>
</td></tr>
</table>`;
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
  const payment_status = escHtml(data.payment_status);
  const payment_next_step = escHtml(data.payment_next_step);
  const shipping_address = escHtml(data.shipping_address);
  const delivery_method = escHtml(data.delivery_method);
  const btc_address = escHtml(data.btc_address);

  const firstName = to_name.split(' ')[0] || to_name;
  const items = String(data.items_list || '').split('\n').filter(l => l.trim()).map(l => escHtml(l));

  const isBtc = payment_method === 'Bitcoin';
  let payColor = '#1F4D3C';
  if (isBtc) payColor = '#D97706';

  const itemRows = items.map((line, i) =>
    `<tr>
      <td style="padding:10px 0;font-size:14px;color:#1F2937;line-height:1.5;${i < items.length - 1 ? 'border-bottom:1px solid #F3F4F6;' : ''}">
        ${line}
      </td>
    </tr>`
  ).join('');

  // BTC payment section
  const btcSection = btc_address ? `
${divider()}
${sectionLabel('Bitcoin Payment Details')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FFFBEB;border:1px solid #FDE68A;border-radius:12px;padding:20px;margin-bottom:20px;">
<tr><td align="center">
  <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=bitcoin%3A${btc_address}" alt="Bitcoin QR" width="140" height="140" style="display:block;margin:0 auto 14px;border:4px solid #FFFFFF;border-radius:8px;">
  <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#92400E;text-transform:uppercase;letter-spacing:1px;">Bitcoin Deposit Address</p>
  <p style="margin:0 0 10px;font-size:12px;color:#1F2937;word-break:break-all;font-family:'SF Mono',Consolas,monospace;background:#FFFFFF;padding:8px 12px;border:1px solid #FCD34D;border-radius:6px;max-width:340px;line-height:1.5;">${btc_address}</p>
  <p style="margin:0;font-size:12px;color:#B45309;font-weight:600;">10% Crypto Discount Applied &bull; Dispatch follows 2+ blockchain confirmations</p>
</td></tr>
</table>
` : '';

  const bodyContent = `
${orderProgressTracker({ step2Active: true, step3Active: false })}

<p style="margin:0 0 24px;font-size:15px;color:#4B5563;line-height:1.65;">
  Hi ${firstName}, we've received your order <strong style="color:#111827;">${order_ref}</strong>. ${isBtc
    ? 'Please transfer the Bitcoin amount to the wallet below to begin priority dispatch.'
    : 'To finalise payment and release your parcel for dispatch, please connect with us on Live Chat to receive current PayID or bank transfer details.'}
</p>

${!isBtc ? liveChatActionBlock({ orderRef: order_ref, total, paymentMethod: payment_method }) : ''}

${sectionLabel('Order Summary')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:14px;">
${dataRow('Order Reference', `<span style="font-family:'SF Mono',Consolas,monospace;font-size:14px;font-weight:700;color:#111827;">${order_ref}</span>`)}
${dataRow('Order Date', order_date)}
${dataRow('Delivery Method', delivery_method)}
${dataRow('Payment Option', `<span style="color:${payColor};font-weight:700;">${payment_method}</span>`)}
</table>

${divider()}

${sectionLabel('Items Ordered')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${itemRows}
</table>

<div style="margin:20px 0 0;padding:18px 20px;background-color:#F9FAFB;border-radius:10px;border:1px solid #E5E7EB;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${sumRow('Subtotal', subtotal)}
${discount !== '$0.00' ? sumRow('Discount', `<span style="color:#059669;">${discount}</span>`) : ''}
${sumRow('Shipping', shipping)}
<tr><td colspan="2" style="padding:8px 0;"><div style="height:1px;background-color:#E5E7EB;"></div></td></tr>
${sumRow('Total (AUD)', total, true)}
</table>
</div>

${btcSection}

${divider()}

<!-- Delivery & Customer Information -->
${sectionLabel('Shipping & Recipient')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('Deliver To', to_name)}
${dataRow('Address', shipping_address)}
${dataRow('Packaging', 'Double vacuum-sealed smell-proof Mylar in plain discreet satchel')}
</table>
`;

  return emailWrapper({
    preheader: `Order ${order_ref} received (${total}). Open Live Chat to receive bank transfer details.`,
    badgeText: isBtc ? 'Awaiting Bitcoin Payment' : 'Action Required: Finalise Payment',
    heroTitle: `Thank you, ${firstName}.`,
    heroSub: `Your order ${order_ref} has been logged. Follow the instructions below to complete payment.`,
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
      <td style="padding:9px 0;font-size:14px;color:#1F2937;${i < items.length - 1 ? 'border-bottom:1px solid #F3F4F6;' : ''}">
        ${line}
      </td>
    </tr>`
  ).join('');

  const bodyContent = `
<!-- Highlight Card -->
<div style="background-color:#111827;padding:20px 24px;border-radius:12px;margin-bottom:28px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td>
  <span style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:4px;">Reference</span>
  <span style="font-size:16px;font-weight:700;color:#FFFFFF;font-family:'SF Mono',Consolas,monospace;">${order_ref}</span>
</td>
<td align="right">
  <span style="font-size:10px;font-weight:700;color:#9CA3AF;text-transform:uppercase;letter-spacing:1.5px;display:block;margin-bottom:4px;">Total Value</span>
  <span style="font-size:22px;font-weight:700;color:#10B981;">${total}</span>
</td>
</tr>
</table>
</div>

${sectionLabel('Customer Contact')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${dataRow('Customer Name', `<strong style="color:#111827;">${to_name}</strong>`)}
${dataRow('Email Address', `<a href="mailto:${customer_email}" style="color:#1F4D3C;text-decoration:underline;">${customer_email}</a>`)}
${dataRow('Phone Number', customer_phone ? `<a href="tel:${customer_phone}" style="color:#1F4D3C;text-decoration:none;">${customer_phone}</a>` : 'Not provided')}
${dataRow('Payment Method', `<strong style="color:#1F4D3C;">${payment_method}</strong>`)}
${dataRow('Payment Status', payment_status || 'Pending')}
${dataRow('Order Date', order_date)}
</table>

${divider()}

${sectionLabel('Shipping Address')}
<div style="padding:14px 18px;background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;margin-bottom:16px;">
  <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;">${shipping_address}</p>
  <p style="margin:0;font-size:12px;color:#6B7280;">Method: ${delivery_method}</p>
</div>

${divider()}

${sectionLabel('Ordered Items')}
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
${itemRows}
</table>

<div style="margin:20px 0 0;padding:16px 20px;background-color:#F9FAFB;border-radius:10px;border:1px solid #E5E7EB;">
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
    badgeText: 'New Order Received',
    heroTitle: `${total} &mdash; ${payment_method}`,
    heroSub: `Incoming order from ${to_name} (${customer_email})`,
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
${dataRow('Topic / Type', message_type.toUpperCase())}
${order_ref ? dataRow('Order Reference', `<span style="font-family:'SF Mono',Consolas,monospace;font-weight:700;">${order_ref}</span>`) : ''}
${product_name ? dataRow('Product', product_name) : ''}
${rating ? dataRow('Review Rating', `${rating} ★★★★★`.slice(0, 4 + Number(rating))) : ''}
${dataRow('Subject', subject)}
</table>

${divider()}

${sectionLabel('Message Content')}
<div style="padding:18px 20px;background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;margin-bottom:24px;">
  <p style="margin:0;font-size:14px;color:#1F2937;line-height:1.75;white-space:pre-wrap;">${message}</p>
</div>

<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td align="center">
  <a href="mailto:${from_email}?subject=Re: ${subject}" style="display:inline-block;background-color:#1F4D3C;color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:700;padding:12px 28px;border-radius:8px;">
    Reply directly to ${from_name.split(' ')[0]}
  </a>
</td></tr>
</table>
`;

  return emailWrapper({
    preheader: `Contact Enquiry [${message_type}]: ${subject} from ${from_name}`,
    badgeText: `Enquiry: ${message_type}`,
    heroTitle: `New Customer Message`,
    heroSub: `From ${from_name} &bull; ${subject}`,
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
  const fromAddress = `${BRAND} <hello@mullawaysmedicalcannabis.store>`;

  try {
    if (type === 'order-customer') {
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
        subject: `Order Confirmed: ${data.order_ref} — Open Live Chat to finalise payment`,
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

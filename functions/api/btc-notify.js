// Cloudflare Pages Function  /api/btc-notify
//
// Server-side Bitcoin payment verification and admin notification.
//
// Called from the order-confirmation page when the client-side poll detects
// 2+ blockchain confirmations. This endpoint independently re-verifies the
// payment before sending the admin notification — so the admin email is:
//   • Never sent when the order is placed (no payment yet)
//   • Sent only after the server itself confirms 2+ blockchain confirmations
//   • Protected against false positives from old transactions on the shared address
//
// POST body:  { address, orderRef, orderDate, emailData }
// Response:   { confirmed, sent, confirmations, txid }

const MEMPOOL_API = 'https://mempool.space/api';
const ADMIN_EMAIL = 'hello@mullawaysmedicalcannabis.store';
const BRAND = 'Mullaways Medical Cannabis';

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
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), { status: 400, headers });
  }

  const { address, orderRef, orderDate, emailData } = body;

  if (!address || !orderRef || !emailData) {
    return new Response(
      JSON.stringify({ error: 'Missing required fields: address, orderRef, emailData' }),
      { status: 400, headers }
    );
  }

  // Convert order creation time to Unix seconds for transaction filtering
  const orderUnixTime = orderDate ? Math.floor(new Date(orderDate).getTime() / 1000) : 0;

  try {
    // ── Independent blockchain re-verification ──────────────────────────
    const [confirmedRes, mempoolRes] = await Promise.all([
      fetch(`${MEMPOOL_API}/address/${address}/txs`),
      fetch(`${MEMPOOL_API}/address/${address}/txs/mempool`),
    ]);

    let confirmations = 0;
    let txid = null;
    let txTime = null;

    if (confirmedRes.ok) {
      const confirmedTxs = await confirmedRes.json();

      if (confirmedTxs.length > 0) {
        // Find the most recent transaction that is NOT older than the order.
        // This protects against the shared address having old confirmed transactions
        // that would otherwise fire immediately for every new order.
        const relevantTx = confirmedTxs.find(tx => {
          const bt = tx.status?.block_time || 0;
          return bt === 0 || bt >= orderUnixTime;
        }) || null;

        if (relevantTx) {
          const txBlockTime = relevantTx.status?.block_time || null;

          // Double-check: if the block time is known and clearly predates the order, reject it
          if (txBlockTime && orderUnixTime && txBlockTime < orderUnixTime) {
            return new Response(
              JSON.stringify({
                confirmed: false,
                sent: false,
                status: 'old_transaction',
                message: 'Most recent transaction predates this order — no new payment found',
              }),
              { headers }
            );
          }

          const tipRes = await fetch(`${MEMPOOL_API}/blocks/tip/height`);
          if (tipRes.ok) {
            const currentHeight = parseInt(await tipRes.text(), 10);
            const txBlockHeight = relevantTx.status?.block_height;
            if (txBlockHeight) {
              confirmations = currentHeight - txBlockHeight + 1;
              txid = relevantTx.txid;
              txTime = txBlockTime;
            }
          }
        }
      }
    }

    // If there's an unconfirmed transaction but no confirmed one yet
    if (confirmations === 0 && mempoolRes.ok) {
      const mempoolTxs = await mempoolRes.json();
      if (mempoolTxs.length > 0) {
        return new Response(
          JSON.stringify({
            confirmed: false,
            sent: false,
            status: 'detected',
            confirmations: 0,
            txid: mempoolTxs[0].txid,
            message: 'Payment detected in mempool — awaiting confirmations',
          }),
          { headers }
        );
      }
    }

    if (confirmations < 2) {
      return new Response(
        JSON.stringify({
          confirmed: false,
          sent: false,
          status: confirmations > 0 ? 'detected' : 'pending',
          confirmations,
          txid,
          message: confirmations > 0
            ? `${confirmations} confirmation(s) so far — need 2 to notify`
            : 'No payment found for this order',
        }),
        { headers }
      );
    }

    // ── Payment confirmed — send admin notification email ───────────────
    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.RESEND_FROM || `${BRAND} <hello@mullawaysmedicalcannabis.store>`,
        to: [ADMIN_EMAIL],
        reply_to: emailData.customer_email || ADMIN_EMAIL,
        subject: `Bitcoin Payment Verified: Order ${orderRef} — ${emailData.total || ''}`,
        html: buildAdminEmail({ emailData, confirmations, txid, orderRef }),
      }),
    });

    if (!emailRes.ok) {
      const errText = await emailRes.text();
      throw new Error(`Resend API ${emailRes.status}: ${errText}`);
    }

    return new Response(
      JSON.stringify({
        confirmed: true,
        sent: true,
        confirmations,
        txid,
      }),
      { headers }
    );

  } catch (err) {
    console.error(`btc-notify error for order ${orderRef}:`, err);
    return new Response(
      JSON.stringify({
        error: err.message || 'Notification failed',
        confirmed: false,
        sent: false,
      }),
      { status: 500, headers }
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

// ── Admin email HTML ──────────────────────────────────────────────────────────

function escHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function buildAdminEmail({ emailData: rawData, confirmations, txid: rawTxid, orderRef: rawOrderRef }) {
  const d = {
    to_name: escHtml(rawData.to_name),
    customer_email: escHtml(rawData.customer_email),
    customer_phone: escHtml(rawData.customer_phone),
    shipping_address: escHtml(rawData.shipping_address),
    delivery_method: escHtml(rawData.delivery_method),
    subtotal: escHtml(rawData.subtotal),
    discount: escHtml(rawData.discount),
    shipping: escHtml(rawData.shipping),
    total: escHtml(rawData.total),
  };
  const orderRef = escHtml(rawOrderRef);
  const txid = escHtml(rawTxid);

  const items = (rawData.items_list || '').split('\n').filter(l => l.trim()).map(l => escHtml(l));
  const itemRows = items.map((line, i) =>
    `<tr><td style="padding:10px 0;font-size:14px;color:#1F2937;${i < items.length - 1 ? 'border-bottom:1px solid #F3F4F6;' : ''}">${line}</td></tr>`
  ).join('');

  const discountRow = d.discount && d.discount !== '$0.00'
    ? `<tr><td style="padding:5px 0;font-size:14px;color:#059669;font-weight:500;">10% BTC Discount</td><td style="text-align:right;font-size:14px;color:#059669;font-weight:600;">${d.discount}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F8F9FA;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;color:#111827;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F8F9FA;">
<tr><td align="center" style="padding:40px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:8px;border:1px solid #E5E7EB;overflow:hidden;">

<!-- Top Accent Line -->
<tr><td style="height:3px;background-color:#1F4D3C;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Header -->
<tr><td style="padding:24px 36px 20px;border-bottom:1px solid #E5E7EB;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td>
  <span style="font-size:14px;font-weight:700;color:#111827;display:block;letter-spacing:0.8px;">${BRAND}</span>
  <span style="font-size:10px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:1px;">Blockchain Settlement</span>
</td>
<td align="right">
  <span style="display:inline-block;padding:4px 10px;background-color:#ECFDF5;color:#065F46;font-size:11px;font-weight:700;border-radius:4px;text-transform:uppercase;letter-spacing:0.5px;">Verified Paid</span>
</td>
</tr>
</table>
</td></tr>

<!-- Hero Banner -->
<tr><td style="padding:32px 36px 24px;">
<h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#111827;">Bitcoin Payment Confirmed</h1>
<p style="margin:0;font-size:14px;color:#4B5563;">Order <strong style="font-family:'SF Mono',Consolas,monospace;color:#111827;">${orderRef}</strong> &mdash; 2+ blockchain confirmations verified by node</p>
</td></tr>

<tr><td style="padding:0 36px;"><div style="height:1px;background-color:#E5E7EB;"></div></td></tr>

<!-- Body -->
<tr><td style="padding:28px 36px 36px;">

<!-- Blockchain Verification Badge -->
<div style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:14px 18px;margin-bottom:24px;">
  <p style="margin:0 0 4px;font-size:13px;font-weight:700;color:#15803D;">${confirmations} Blockchain Confirmation${confirmations !== 1 ? 's' : ''} Received</p>
  ${txid ? `<p style="margin:0;font-size:11px;color:#6B7280;font-family:'SF Mono',Consolas,monospace;word-break:break-all;">TXID: ${txid}</p>` : ''}
</div>

<!-- Customer & Delivery -->
<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#527A66;text-transform:uppercase;letter-spacing:1.5px;">Customer &amp; Shipping</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
<tr><td style="padding:5px 0;font-size:13px;color:#6B7280;width:120px;">Name</td><td style="padding:5px 0;font-size:13px;font-weight:600;color:#111827;">${d.to_name || '—'}</td></tr>
<tr><td style="padding:5px 0;font-size:13px;color:#6B7280;">Email</td><td style="padding:5px 0;font-size:13px;"><a href="mailto:${d.customer_email}" style="color:#1F4D3C;text-decoration:underline;">${d.customer_email || '—'}</a></td></tr>
<tr><td style="padding:5px 0;font-size:13px;color:#6B7280;">Phone</td><td style="padding:5px 0;font-size:13px;color:#1F2937;">${d.customer_phone || 'N/A'}</td></tr>
<tr><td style="padding:5px 0;font-size:13px;color:#6B7280;">Address</td><td style="padding:5px 0;font-size:13px;color:#1F2937;font-weight:600;">${d.shipping_address || '—'}</td></tr>
<tr><td style="padding:5px 0;font-size:13px;color:#6B7280;">Tier</td><td style="padding:5px 0;font-size:13px;color:#1F2937;">${d.delivery_method || 'Standard Delivery'}</td></tr>
</table>

<div style="height:1px;background-color:#E5E7EB;margin:20px 0;"></div>

<!-- Items -->
<p style="margin:0 0 8px;font-size:11px;font-weight:700;color:#527A66;text-transform:uppercase;letter-spacing:1.5px;">Items to Pack</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:16px;">
${itemRows}
</table>

<!-- Totals -->
<div style="padding:14px 16px;background-color:#F9FAFB;border-radius:6px;border:1px solid #E5E7EB;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">Subtotal</td><td style="text-align:right;font-size:13px;color:#1F2937;">${d.subtotal || ''}</td></tr>
${discountRow}
<tr><td style="padding:4px 0;font-size:13px;color:#6B7280;">Shipping</td><td style="text-align:right;font-size:13px;color:#1F2937;">${d.shipping || ''}</td></tr>
<tr><td colspan="2" style="padding:6px 0;"><div style="height:1px;background-color:#E5E7EB;"></div></td></tr>
<tr><td style="padding:6px 0 2px;font-size:15px;font-weight:700;color:#111827;">Total Paid</td><td style="text-align:right;padding:6px 0 2px;font-size:16px;font-weight:700;color:#10B981;">${d.total || ''}</td></tr>
</table>
</div>

</td></tr>

<!-- Footer -->
<tr><td style="padding:18px 36px;background-color:#FFFFFF;border-top:1px solid #E5E7EB;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr>
<td><span style="font-size:11px;color:#6B7280;">${BRAND} automated fulfillment alert</span></td>
<td align="right"><a href="mailto:${ADMIN_EMAIL}" style="font-size:11px;color:#1F4D3C;text-decoration:none;">${ADMIN_EMAIL}</a></td>
</tr>
</table>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

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
const ADMIN_EMAIL = 'hello@mullawaysmedicalcannabis.com.au';
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
        from: `${BRAND} <hello@mullawaysmedicalcannabis.com.au>`,
        to: [ADMIN_EMAIL],
        reply_to: emailData.customer_email || ADMIN_EMAIL,
        subject: `✅ Bitcoin Paid — Order ${orderRef} — ${emailData.total || ''}`,
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

function buildAdminEmail({ emailData: d, confirmations, txid, orderRef }) {
  const items = (d.items_list || '').split('\n').filter(l => l.trim());
  const itemRows = items.map((line, i) =>
    `<tr><td style="padding:10px 0;font-size:14px;color:#333333;${i < items.length - 1 ? 'border-bottom:1px solid #F5F5F5;' : ''}">${line}</td></tr>`
  ).join('');

  const discountRow = d.discount && d.discount !== '$0.00'
    ? `<tr><td style="padding:3px 0;font-size:13px;color:#2D5A4A;">BTC Discount</td><td style="text-align:right;font-size:13px;color:#2D5A4A;">${d.discount}</td></tr>`
    : '';

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#F2F2F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#F2F2F2;">
<tr><td align="center" style="padding:48px 16px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="580" style="max-width:580px;width:100%;background-color:#FFFFFF;">

<tr><td style="height:2px;background-color:#2D5A4A;font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- Hero -->
<tr><td style="padding:48px 48px 40px;">
<p style="margin:0 0 20px;font-size:11px;font-weight:700;color:#2D5A4A;text-transform:uppercase;letter-spacing:3px;">${BRAND.toUpperCase()}</p>
<h1 style="margin:0 0 8px;font-size:28px;font-weight:200;color:#111111;line-height:1.25;">Bitcoin Payment Confirmed</h1>
<p style="margin:0;font-size:15px;color:#888888;">Order <span style="font-family:'SF Mono','Fira Code','Courier New',monospace;color:#111111;letter-spacing:0.5px;">${orderRef}</span> — payment verified on the blockchain</p>
</td></tr>

<tr><td style="padding:0 48px;"><div style="height:1px;background-color:#EEEEEE;"></div></td></tr>

<!-- Body -->
<tr><td style="padding:36px 48px 44px;">

<!-- Confirmation badge -->
<div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px 20px;margin-bottom:32px;">
<p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#15803D;">✅ ${confirmations} blockchain confirmation${confirmations !== 1 ? 's' : ''} received</p>
${txid ? `<p style="margin:0;font-size:11px;color:#888888;font-family:'SF Mono','Fira Code','Courier New',monospace;">TXID: ${txid}</p>` : ''}
</div>

<!-- Customer -->
<p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#BBBBBB;text-transform:uppercase;letter-spacing:2.5px;">Customer</p>
<p style="margin:0 0 4px;font-size:16px;font-weight:600;color:#111111;">${d.to_name || '—'}</p>
<p style="margin:0 0 4px;font-size:13px;color:#555555;"><a href="mailto:${d.customer_email}" style="color:#2D5A4A;text-decoration:none;">${d.customer_email || '—'}</a></p>
<p style="margin:0 0 28px;font-size:13px;color:#555555;">${d.customer_phone || ''}</p>

<!-- Delivery -->
<p style="margin:0 0 8px;font-size:10px;font-weight:700;color:#BBBBBB;text-transform:uppercase;letter-spacing:2.5px;">Delivery</p>
<p style="margin:0 0 4px;font-size:13px;color:#333333;">${d.shipping_address || '—'}</p>
<p style="margin:0 0 28px;font-size:13px;color:#888888;">${d.delivery_method || ''}</p>

<!-- Items -->
<p style="margin:0 0 12px;font-size:10px;font-weight:700;color:#BBBBBB;text-transform:uppercase;letter-spacing:2.5px;">Items Ordered</p>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:20px;">
${itemRows}
</table>

<!-- Totals -->
<div style="padding:16px 20px;background-color:#FAFAFA;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%">
<tr><td style="padding:3px 0;font-size:13px;color:#888888;">Subtotal</td><td style="text-align:right;font-size:13px;color:#333333;">${d.subtotal || ''}</td></tr>
${discountRow}
<tr><td style="padding:3px 0;font-size:13px;color:#888888;">Shipping</td><td style="text-align:right;font-size:13px;color:#333333;">${d.shipping || ''}</td></tr>
<tr><td colspan="2" style="padding:6px 0;"><div style="height:1px;background-color:#EEEEEE;"></div></td></tr>
<tr><td style="padding:6px 0 4px;font-size:16px;font-weight:600;color:#111111;">Total</td><td style="text-align:right;padding:6px 0 4px;font-size:16px;font-weight:600;color:#111111;">${d.total || ''}</td></tr>
</table>
</div>

</td></tr>

<tr><td style="padding:0 48px;"><div style="height:1px;background-color:#EEEEEE;"></div></td></tr>
<tr><td style="padding:24px 48px 28px;">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%"><tr>
<td><p style="margin:0;font-size:12px;color:#BBBBBB;line-height:1.6;">${BRAND}</p></td>
<td align="right"><a href="mailto:${d.customer_email || ADMIN_EMAIL}" style="font-size:12px;color:#BBBBBB;text-decoration:none;">${d.customer_email || ADMIN_EMAIL}</a></td>
</tr></table>
</td></tr>

<tr><td style="height:2px;background-color:#2D5A4A;font-size:0;line-height:0;">&nbsp;</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

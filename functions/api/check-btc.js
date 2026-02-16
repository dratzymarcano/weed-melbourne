// ══════════════════════════════════════════════════════════════════════
// Cloudflare Pages Function — /api/check-btc
// Checks blockchain for Bitcoin payment confirmations
//
// Uses mempool.space public API (no API key required)
//   Docs: https://mempool.space/docs/api
//
// Query params:
//   ?address=bc1q...  — Bitcoin address to check
//   ?order_ref=...    — Order reference (for logging)
//
// Returns JSON:
//   { status: 'pending'|'detected'|'confirmed', confirmations: N, txid: '...' }
// ══════════════════════════════════════════════════════════════════════

const MEMPOOL_API = 'https://mempool.space/api';

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const address = url.searchParams.get('address');
  const orderRef = url.searchParams.get('order_ref') || '';

  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    // Cache for 30 seconds to avoid hammering the API
    'Cache-Control': 'public, max-age=30',
  };

  if (!address) {
    return new Response(
      JSON.stringify({ error: 'Missing address parameter' }),
      { status: 400, headers }
    );
  }

  try {
    // Fetch confirmed transactions for the address
    const [confirmedRes, mempoolRes] = await Promise.all([
      fetch(`${MEMPOOL_API}/address/${address}/txs`),
      fetch(`${MEMPOOL_API}/address/${address}/txs/mempool`),
    ]);

    if (!confirmedRes.ok && !mempoolRes.ok) {
      return new Response(
        JSON.stringify({
          status: 'pending',
          confirmations: 0,
          txid: null,
          message: 'Unable to fetch blockchain data',
        }),
        { headers }
      );
    }

    // Check mempool (unconfirmed) transactions first
    if (mempoolRes.ok) {
      const mempoolTxs = await mempoolRes.json();
      if (mempoolTxs.length > 0) {
        // Found unconfirmed transaction — payment detected
        const latestTx = mempoolTxs[0];
        return new Response(
          JSON.stringify({
            status: 'detected',
            confirmations: 0,
            txid: latestTx.txid,
            message: 'Transaction found in mempool, awaiting confirmations',
          }),
          { headers }
        );
      }
    }

    // Check confirmed transactions
    if (confirmedRes.ok) {
      const confirmedTxs = await confirmedRes.json();
      if (confirmedTxs.length > 0) {
        // Get the most recent transaction
        const latestTx = confirmedTxs[0];

        // We need the current block height to calculate confirmations
        const tipRes = await fetch(`${MEMPOOL_API}/blocks/tip/height`);
        if (tipRes.ok) {
          const currentHeight = parseInt(await tipRes.text(), 10);
          const txBlockHeight = latestTx.status?.block_height;

          if (txBlockHeight) {
            const confirmations = currentHeight - txBlockHeight + 1;

            const status = confirmations >= 2 ? 'confirmed' : 'detected';

            return new Response(
              JSON.stringify({
                status,
                confirmations,
                txid: latestTx.txid,
                message: status === 'confirmed'
                  ? `Payment confirmed with ${confirmations} confirmations`
                  : `Payment detected, ${confirmations} confirmation(s) so far`,
              }),
              { headers }
            );
          }
        }

        // If we can't get block height, still report the transaction
        return new Response(
          JSON.stringify({
            status: 'detected',
            confirmations: 1,
            txid: latestTx.txid,
            message: 'Transaction confirmed but unable to determine exact confirmations',
          }),
          { headers }
        );
      }
    }

    // No transactions found
    return new Response(
      JSON.stringify({
        status: 'pending',
        confirmations: 0,
        txid: null,
        message: 'No transactions found for this address',
      }),
      { headers }
    );

  } catch (err) {
    console.error(`Blockchain check error for ${orderRef}:`, err);
    return new Response(
      JSON.stringify({
        status: 'pending',
        confirmations: 0,
        txid: null,
        error: 'Blockchain API unavailable',
      }),
      { headers }
    );
  }
}

// Handle preflight CORS
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

/**
 * FILE: functions/api/sync.js
 * Cloudflare Pages Function (Worker) acting as the high-speed Front Door API
 * Endpoint: https://jjb-systems.pages.dev/api/sync
 */

const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwBll5ZKuiBO0wX9WSXGRd-Tua4QpxbfKAcrnWhVmdkjkU_3mnwgI7bX-iiRgjHlkYa/exec";

// Edge isolate memory buffer for ultra-fast real-time polling between Outlet Portal & Main App
// (Automatically backed by Cloudflare D1 if env.DB is bound, and mirrored to Google Sheets via GAS)
let edgeTransactionsBuffer = [];

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Content-Type": "application/json"
};

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const since = Number(url.searchParams.get("since") || 0);

  try {
    // 1. If Cloudflare D1 Database (env.DB) is bound, read recent events from D1
    if (env && env.DB) {
      await env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS wms_events (
          queueId TEXT PRIMARY KEY,
          timestampMs INTEGER,
          actionType TEXT,
          actorName TEXT,
          actorRole TEXT,
          payloadJson TEXT
        )`
      ).run();

      const { results } = await env.DB.prepare(
        `SELECT * FROM wms_events WHERE timestampMs > ? ORDER BY timestampMs ASC LIMIT 100`
      ).bind(since).all();

      return new Response(JSON.stringify({
        status: "online",
        engine: "Cloudflare Worker + D1 + Google Sheets Dual-Write",
        events: results.map(r => ({
          queueId: r.queueId,
          timestampMs: r.timestampMs,
          actionType: r.actionType,
          actorName: r.actorName,
          actorRole: r.actorRole,
          payload: JSON.parse(r.payloadJson)
        })),
        serverTimeMs: Date.now()
      }), { status: 200, headers: CORS_HEADERS });
    }

    // 2. Default Edge Memory + GAS Status Polling
    const recentEvents = edgeTransactionsBuffer.filter(ev => ev.timestampMs > since);
    return new Response(JSON.stringify({
      status: "online",
      engine: "Cloudflare Worker Edge + Google Sheets Sync",
      events: recentEvents,
      serverTimeMs: Date.now()
    }), { status: 200, headers: CORS_HEADERS });

  } catch (err) {
    return new Response(JSON.stringify({
      status: "error",
      message: err.toString()
    }), { status: 500, headers: CORS_HEADERS });
  }
}

export async function onRequestPost(context) {
  const { request, env, waitUntil } = context;

  try {
    const body = await request.json();
    const nowMs = Date.now();
    const queueId = body.queueId || `CF-${nowMs}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    const normalizedEvent = {
      queueId,
      timestampMs: nowMs,
      timestamp: body.timestamp || new Date().toISOString(),
      terminalId: body.terminalId || "OUTLET-PORTAL",
      actorName: body.actorName || "Outlet Baker",
      actorRole: body.actorRole || "Outlet Requisitioner",
      actionType: body.actionType || "BATCH_REQUISITION",
      details: body.details || "",
      payload: body.payload || body
    };

    // 1. Store immediately in Edge Memory Buffer (keep last 250 events)
    edgeTransactionsBuffer.push(normalizedEvent);
    if (edgeTransactionsBuffer.length > 250) {
      edgeTransactionsBuffer = edgeTransactionsBuffer.slice(-250);
    }

    // 2. If Cloudflare D1 is bound, write synchronously in ~2ms
    if (env && env.DB) {
      waitUntil(
        env.DB.prepare(
          `INSERT OR REPLACE INTO wms_events (queueId, timestampMs, actionType, actorName, actorRole, payloadJson)
           VALUES (?, ?, ?, ?, ?, ?)`
        ).bind(
          queueId,
          nowMs,
          normalizedEvent.actionType,
          normalizedEvent.actorName,
          normalizedEvent.actorRole,
          JSON.stringify(normalizedEvent.payload)
        ).run().catch(e => console.error("D1 write error:", e))
      );
    }

    // 3. Non-Blocking Background Forward to Google Apps Script (Google Sheets Master Ledger)
    waitUntil(
      fetch(GAS_WEB_APP_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(normalizedEvent),
        redirect: "follow"
      }).catch(err => console.error("GAS background sync error:", err))
    );

    // Return instant <30ms response to Outlet Portal or Main App
    return new Response(JSON.stringify({
      status: "queued",
      queueId,
      timestampMs: nowMs,
      syncedTo: ["Cloudflare Edge", "Google Sheets (Async)"]
    }), { status: 200, headers: CORS_HEADERS });

  } catch (err) {
    return new Response(JSON.stringify({
      status: "error",
      message: err.toString()
    }), { status: 400, headers: CORS_HEADERS });
  }
}

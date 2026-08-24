import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

function pct(s) {
  return encodeURIComponent(String(s)).replace(/[!'()*]/g, (c) => '%' + c.charCodeAt(0).toString(16).toUpperCase());
}
async function hmacSha1B64(key, msg) {
  const enc = new TextEncoder();
  const k = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', k, enc.encode(msg));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}
function genNonce() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  let o = '';
  for (const b of arr) o += chars[b % chars.length];
  return o;
}
async function oauthHeader(method, url, oauth, consumerSecret, tokenSecret, extraBody = {}) {
  const all = { ...oauth, ...extraBody };
  const sorted = Object.keys(all).sort().map((k) => `${pct(k)}=${pct(all[k])}`).join('&');
  const base = `${method.toUpperCase()}&${pct(url)}&${pct(sorted)}`;
  const sig = await hmacSha1B64(`${pct(consumerSecret)}&${pct(tokenSecret)}`, base);
  const header =
    'OAuth ' + Object.keys(oauth).map((k) => `${pct(k)}="${pct(oauth[k])}"`).join(', ') + `,oauth_signature="${pct(sig)}"`;
  return header;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole.entities;
    const cfgs = await svc.IntegrationSetting.filter({ created_by_id: me.id });
    const cfg = cfgs[0];
    if (!cfg?.x_access_token)
      return Response.json({ error: 'Configura X (Twitter) in Impostazioni' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const text = (typeof body?.text === 'string' ? body.text : '').slice(0, 280);
    const imageUrl = body?.imageUrl;
    let mediaId = null;

    if (imageUrl) {
      const r = await fetch(imageUrl);
      const buf = await r.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      const oauth = {
        oauth_consumer_key: cfg.x_consumer_key,
        oauth_token: cfg.x_access_token,
        oauth_signature_method: 'HMAC-SHA1',
        oauth_timestamp: String(Math.floor(Date.now() / 1000)),
        oauth_nonce: genNonce(),
        oauth_version: '1.0'
      };
      const header = await oauthHeader('POST', 'https://upload.twitter.com/1.1/media/upload.json', oauth, cfg.x_consumer_secret, cfg.x_access_token_secret, { media: b64 });
      const up = await fetch('https://upload.twitter.com/1.1/media/upload.json', {
        method: 'POST',
        headers: { Authorization: header, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ media: b64 }).toString()
      });
      const ud = await up.json();
      mediaId = ud.media_id_string || null;
    }

    const oauth = {
      oauth_consumer_key: cfg.x_consumer_key,
      oauth_token: cfg.x_access_token,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: String(Math.floor(Date.now() / 1000)),
      oauth_nonce: genNonce(),
      oauth_version: '1.0'
    };
    const header = await oauthHeader('POST', 'https://api.twitter.com/2/tweets', oauth, cfg.x_consumer_secret, cfg.x_access_token_secret, {});
    const tweetBody = { text };
    if (mediaId) tweetBody.media = { media_ids: [mediaId] };
    const tw = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: { Authorization: header, 'Content-Type': 'application/json' },
      body: JSON.stringify(tweetBody)
    });
    const td = await tw.json();
    if (td.data?.id) return Response.json({ ok: true, url: `https://x.com/i/status/${td.data.id}` });
    return Response.json({ error: JSON.stringify(td) }, { status: 502 });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
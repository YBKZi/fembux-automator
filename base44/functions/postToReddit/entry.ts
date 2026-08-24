import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole.entities;
    const cfgs = await svc.IntegrationSetting.filter({ created_by_id: me.id });
    const cfg = cfgs[0];
    if (!cfg?.reddit_client_id || !cfg?.reddit_username)
      return Response.json({ error: 'Configura Reddit in Impostazioni' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const imageUrl = body?.imageUrl;
    const title = (typeof body?.title === 'string' ? body.title : 'New post').slice(0, 300);
    const subreddit = cfg.reddit_subreddit || 'u_' + cfg.reddit_username;

    const tokRes = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        Authorization: 'Basic ' + btoa(`${cfg.reddit_client_id}:${cfg.reddit_client_secret}`),
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'fembux/1.0 by ' + cfg.reddit_username
      },
      body: new URLSearchParams({
        grant_type: 'password',
        username: cfg.reddit_username,
        password: cfg.reddit_password
      }).toString()
    });
    const td = await tokRes.json();
    if (!td.access_token) return Response.json({ error: 'Reddit auth fallita: ' + JSON.stringify(td) }, { status: 502 });

    const params = new URLSearchParams({
      sr: subreddit,
      title,
      api_type: 'json',
      nsfw: 'true'
    });
    if (imageUrl) { params.set('kind', 'image'); params.set('url', imageUrl); }
    else { params.set('kind', 'self'); params.set('text', title); }

    const subRes = await fetch('https://oauth.reddit.com/api/submit', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${td.access_token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'fembux/1.0 by ' + cfg.reddit_username
      },
      body: params.toString()
    });
    const sd = await subRes.json();
    if (sd.json?.errors?.length) return Response.json({ error: JSON.stringify(sd.json.errors) }, { status: 502 });
    const link = sd.json?.data?.things?.[0]?.data?.url || null;
    return Response.json({ ok: true, url: link });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
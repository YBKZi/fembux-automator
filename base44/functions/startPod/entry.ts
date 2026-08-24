import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const RUNPOD_GQL = (key) => `https://api.runpod.io/graphql?api_key=${encodeURIComponent(key)}`;

async function gql(key, query) {
  const r = await fetch(RUNPOD_GQL(key), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const data = await r.json();
  if (data.errors) throw new Error(JSON.stringify(data.errors));
  return data.data;
}

async function podStatus(key, podId) {
  const data = await gql(key, `query { pod(input: {podId: "${podId}"}) { id desiredStatus status } }`);
  return data?.pod || null;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole.entities;
    const cfgs = await svc.IntegrationSetting.filter({ created_by_id: me.id });
    const cfg = cfgs[0];
    if (!cfg || !cfg.runpod_api_key || !cfg.runpod_pod_id)
      return Response.json({ error: 'Configura RunPod API key e Pod ID in Impostazioni' }, { status: 400 });

    const key = cfg.runpod_api_key;
    const podId = cfg.runpod_pod_id;

    // Already running? skip resume.
    let pod = await podStatus(key, podId);
    const cur = String(pod?.status || '').toUpperCase();
    if (cur !== 'RUNNING') {
      await gql(key, `mutation { podResume(input: {podId: "${podId}"}) { id desiredStatus status } }`);
    }

    // Poll until RUNNING (up to ~50s — keep within function timeout).
    const deadline = Date.now() + 50000;
    let lastStatus = cur;
    while (Date.now() < deadline) {
      await new Promise((res) => setTimeout(res, 5000));
      try { pod = await podStatus(key, podId); } catch {}
      lastStatus = String(pod?.status || '').toUpperCase();
      if (lastStatus === 'RUNNING') break;
    }

    return Response.json({ ok: true, pod, status: lastStatus || 'sconosciuto' });

    return Response.json({ ok: true, pod });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
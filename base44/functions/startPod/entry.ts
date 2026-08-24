import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

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

    const r = await fetch(`https://api.runpod.io/graphql?api_key=${encodeURIComponent(cfg.runpod_api_key)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `mutation { podResume(input: {podId: "${cfg.runpod_pod_id}"}) { id desiredStatus status } }`
      })
    });
    const data = await r.json();
    if (data.errors) return Response.json({ error: JSON.stringify(data.errors) }, { status: 502 });
    return Response.json({ ok: true, pod: data.data?.podResume || null });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
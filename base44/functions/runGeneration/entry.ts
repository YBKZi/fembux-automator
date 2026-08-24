import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const me = await base44.auth.me();
    if (!me) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const svc = base44.asServiceRole.entities;
    const cfgs = await svc.IntegrationSetting.filter({ created_by_id: me.id });
    const cfg = cfgs[0];
    if (!cfg?.a1111_base_url)
      return Response.json({ error: 'Configura A1111 URL in Impostazioni' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const prompts = Array.isArray(body?.prompts)
      ? body.prompts.filter((p) => typeof p === 'string' && p.trim()).slice(0, 3)
      : [];
    if (!prompts.length) return Response.json({ error: 'Nessun prompt' }, { status: 400 });

    const baseUrl = String(cfg.a1111_base_url).replace(/\/+$/, '');
    // Wait for A1111 to be reachable (pod may still be booting after resume).
    let a1111Ready = false;
    for (let i = 0; i < 24; i++) {
      try {
        const p = await fetch(`${baseUrl}/sdapi/v1/options`, { method: 'GET' });
        if (p.ok) { a1111Ready = true; break; }
      } catch {}
      await new Promise((res) => setTimeout(res, 5000));
    }
    if (!a1111Ready)
      return Response.json({ error: 'A1111 non raggiungibile dopo avvio pod. Riprova tra poco.' }, { status: 502 });

    const steps = cfg.a1111_steps || 30;
    const cfgScale = cfg.a1111_cfg || 7;
    const batchSize = Math.max(1, Math.min(cfg.a1111_batch_size || 1, 2));
    const negative = cfg.a1111_negative_prompt || '';
    const results = [];

    for (const prompt of prompts) {
      let r;
      try {
        r = await fetch(`${baseUrl}/sdapi/v1/txt2img`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt,
            negative_prompt: negative,
            steps,
            cfg_scale: cfgScale,
            batch_size: batchSize,
            width: 768,
            height: 1024,
            sampler_name: 'DPM++ 2M Karras'
          })
        });
      } catch (e) {
        results.push({ prompt, error: `A1111 non raggiungibile: ${e.message}` });
        continue;
      }
      if (!r.ok) { results.push({ prompt, error: `A1111 ${r.status}` }); continue; }
      const d = await r.json();
      const imgs = Array.isArray(d.images) ? d.images : [];
      for (let i = 0; i < imgs.length; i++) {
        try {
          const bin = atob(imgs[i]);
          const bytes = new Uint8Array(bin.length);
          for (let j = 0; j < bin.length; j++) bytes[j] = bin.charCodeAt(j);
          const file = new File([bytes], `gen_${Date.now()}_${i}.png`, { type: 'image/png' });
          const up = await base44.asServiceRole.integrations.Core.UploadFile({ file });
          results.push({ prompt, image_url: up.file_url });
        } catch (e) {
          results.push({ prompt, error: e.message });
        }
      }
    }
    return Response.json({ ok: true, images: results });
  } catch (e) {
    return Response.json({ error: e.message }, { status: 500 });
  }
}
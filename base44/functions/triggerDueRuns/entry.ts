import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { generateBrief } from '../../shared/grokBrief.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities;

    const pending = await svc.AutomationRun.filter({ status: 'pending' });
    const now = Date.now();
    let triggered = 0;

    for (const run of pending) {
      const due = run.scheduled_for ? Date.parse(run.scheduled_for) : NaN;
      if (!isFinite(due) || due > now) continue;
      await svc.AutomationRun.update(run.id, { status: 'running' });
      let brief = {};
      try { brief = await generateBrief(secrets.get('XAI_API_KEY'), ''); } catch (e) { brief = { error: e.message }; }
      await svc.AutomationRun.update(run.id, {
        status: 'done',
        triggered_at: new Date().toISOString(),
        brief
      });
      triggered++;
    }

    return Response.json({ ok: true, triggered });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
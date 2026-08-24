import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { generateOptimalTimes, romeTodayAtUtc } from '../../shared/grokBrief.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const svc = base44.asServiceRole.entities;

    const semiConfigs = await svc.AutomationConfig.filter({ mode: 'semi', enabled: true });
    const autoConfigs = await svc.AutomationConfig.filter({ mode: 'auto', enabled: true });

    let created = 0;

    async function ensureRun(ownerId, mode, source, hhmm) {
      const when = romeTodayAtUtc(hhmm);
      const iso = when.toISOString();
      if (when.getTime() <= Date.now()) return;
      const existing = await svc.AutomationRun.filter({ owner_id: ownerId, scheduled_for: iso });
      if (existing.length) return;
      await svc.AutomationRun.create({
        owner_id: ownerId,
        mode,
        source,
        status: 'pending',
        scheduled_for: iso,
        triggered_at: '',
        brief: {}
      });
      created++;
    }

    for (const c of semiConfigs) {
      const times = Array.isArray(c.semi_times) ? c.semi_times : [];
      for (const t of times) {
        if (/^\d{2}:\d{2}$/.test(t)) await ensureRun(c.created_by_id, 'semi', 'semi', t);
      }
    }

    let optimal = [];
    if (autoConfigs.length) {
      try { optimal = await generateOptimalTimes(secrets.get('XAI_API_KEY')); } catch (_) {}
    }
    for (const c of autoConfigs) {
      for (const t of optimal) await ensureRun(c.created_by_id, 'auto', 'auto', t);
    }

    return Response.json({ ok: true, semi: semiConfigs.length, auto: autoConfigs.length, created });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
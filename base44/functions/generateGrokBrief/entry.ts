import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';
import { generateBrief } from '../../shared/grokBrief.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json().catch(() => ({}));
    const hint = typeof body?.hint === 'string' && body.hint.trim() ? body.hint.trim().slice(0, 200) : '';
    const apiKey = secrets.get('XAI_API_KEY');
    const brief = await generateBrief(apiKey, hint);
    return Response.json(brief);
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
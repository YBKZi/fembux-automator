import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

const XAI_URL = 'https://api.x.ai/v1/chat/completions';
const MODEL = 'grok-4.6';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const apiKey = secrets.get('XAI_API_KEY');
    if (!apiKey) return Response.json({ error: 'XAI_API_KEY non configurata' }, { status: 500 });

    const body = await req.json().catch(() => ({}));
    const hint = typeof body?.hint === 'string' && body.hint.trim() ? body.hint.trim().slice(0, 200) : '';

    const systemPrompt =
      'Sei un creative director esperto di contenuti NSFW per adulti. ' +
      'Analizzi i trend del momento e produci brief creativi pronti per la generazione di immagini su Stable Diffusion. ' +
      'Rispondi SEMPRE in JSON valido.';

    const userPrompt =
      'Genera un brief per la prossima sessione di generazione immagini. ' +
      'Scegli un personaggio coerente con i trend attuali, una mood/vibe, 3 prompt creativi dettagliati e descrittivi ' +
      '(in inglese, ottimizzati per Stable Diffusion, stile fotorealistico) e 12 hashtag di tendenza (senza #). ' +
      (hint ? `Consdiera questo suggerimento: "${hint}". ` : '') +
      'Schema JSON richiesto: {"character": string, "vibe": string, "prompts": string[3], "hashtags": string[12]}.';

    const resp = await fetch(XAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: 0.9,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ]
      })
    });

    if (!resp.ok) {
      const txt = await resp.text();
      return Response.json({ error: `Grok API ${resp.status}`, details: txt.slice(0, 500) }, { status: 502 });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '{}';
    let parsed;
    try { parsed = JSON.parse(content); }
    catch { parsed = {}; }

    return Response.json({
      character: typeof parsed.character === 'string' ? parsed.character : '',
      vibe: typeof parsed.vibe === 'string' ? parsed.vibe : '',
      prompts: Array.isArray(parsed.prompts) ? parsed.prompts.filter((p) => typeof p === 'string').slice(0, 3) : [],
      hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.filter((h) => typeof h === 'string').slice(0, 12) : []
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
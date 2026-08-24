const XAI_URL = 'https://api.x.ai/v1/responses';
const MODEL = 'grok-4.6';

function extractJson(text) {
  if (!text) return {};
  try { return JSON.parse(text); } catch {}
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) {
    try { return JSON.parse(text.slice(start, end + 1)); } catch {}
  }
  return {};
}

async function callGrok(apiKey, messages, temperature) {
  if (!apiKey) throw new Error('XAI_API_KEY non configurata');
  const resp = await fetch(XAI_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({ model: MODEL, input: messages.map((m) => m.content).join('\n\n') })
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`Grok API ${resp.status}: ${txt.slice(0, 300)}`);
  }
  const data = await resp.json();
  let content = '';
  const out = Array.isArray(data?.output) ? data.output : [];
  for (const item of out) {
    if (Array.isArray(item?.content)) {
      for (const c of item.content) {
        if (typeof c?.text === 'string') content += c.text;
      }
    }
  }
  return extractJson(content);
}

export async function generateBrief(apiKey, hint = '') {
  const systemPrompt =
    'Sei un creative director esperto di contenuti NSFW per adulti con soggetti MASCULINI nelle nicchie twink, femboy, yiff e anthro (uomini adulti snelli/eleganti, femboy, personaggi furry/anthro antropomorfi). ' +
    'Mai contenuti bara o muscolosi. I protagonisti sono SEMPRE di queste nicchie (twink, femboy, yiff, anthro). ' +
    'Analizzi i trend del momento e produci brief creativi pronti per la generazione di immagini su Stable Diffusion. ' +
    'Rispondi SEMPRE in JSON valido.';
  const userPrompt =
    'Genera un brief per la prossima sessione di generazione immagini scegliendo un soggetto tra le nicchie twink, femboy, yiff o anthro ' +
    '(NON bara, NON muscoloso, NON donna). Definisci personaggio coerente con i trend, mood/vibe, 3 prompt creativi dettagliati e descrittivi ' +
    '(in inglese, ottimizzati per Stable Diffusion, stile fotorealistico o semi-realistico a seconda della nicchia) e 12 hashtag di tendenza (senza #). ' +
    (hint ? `Considera questo suggerimento: "${hint}". ` : '') +
    'Schema JSON richiesto: {"character": string, "vibe": string, "prompts": string[3], "hashtags": string[12]}.';
  const parsed = await callGrok(
    apiKey,
    [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
    0.9
  );
  return {
    character: typeof parsed.character === 'string' ? parsed.character : '',
    vibe: typeof parsed.vibe === 'string' ? parsed.vibe : '',
    prompts: Array.isArray(parsed.prompts) ? parsed.prompts.filter((p) => typeof p === 'string').slice(0, 3) : [],
    hashtags: Array.isArray(parsed.hashtags) ? parsed.hashtags.filter((h) => typeof h === 'string').slice(0, 12) : []
  };
}

export async function generateOptimalTimes(apiKey) {
  const parsed = await callGrok(
    apiKey,
    [
      { role: 'system', content: 'Sei un analista di social media NSFW. Rispondi in JSON valido.' },
      {
        role: 'user',
        content:
          'Indica i 2 orari ottimali di pubblicazione per contenuti NSFW oggi (timezone Europe/Rome), ' +
          'basandoti sui pattern di engagement serali/notturni (tra le 19:00 e le 23:30). ' +
          'Schema: {"times":["HH:mm","HH:mm"]}. Esattamente 2 orari.'
      }
    ],
    0.4
  );
  const times = Array.isArray(parsed.times)
    ? parsed.times.filter((t) => typeof t === 'string' && /^\d{2}:\d{2}$/.test(t)).slice(0, 2)
    : [];
  return times.length ? times : ['21:00', '22:30'];
}

export function romeTodayAtUtc(hhmm) {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Rome', hour12: false, year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(now);
  const get = (t) => (parts.find((p) => p.type === t) || {}).value;
  const dateStr = `${get('year')}-${get('month')}-${get('day')}`;
  const guess = Date.parse(`${dateStr}T${hhmm}:00Z`);
  if (!isFinite(guess)) return new Date(Date.now() + 3600000);
  const offParts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Europe/Rome', timeZoneName: 'shortOffset'
  }).formatToParts(new Date(guess));
  const offStr = (offParts.find((p) => p.type === 'timeZoneName') || {}).value || 'GMT+0';
  const m = offStr.match(/GMT([+-])(\d{1,2})(?::(\d{2}))?/);
  let offMin = m ? parseInt(m[2], 10) * 60 + (m[3] ? parseInt(m[3], 10) : 0) : 0;
  if (m && m[1] === '-') offMin = -offMin;
  return new Date(guess - offMin * 60000);
}
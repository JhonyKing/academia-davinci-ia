// ──────────────────────────────────────────────────────────────────────────
//  api/feedback.js  —  Vercel Serverless Function
//  Feedback de entregas con Claude Haiku (Academia Da Vinci IA)
//
//  ACTIVAR:
//    1. ir a Vercel Dashboard → Settings → Environment Variables
//    2. agregar:  ANTHROPIC_API_KEY = sk-ant-...
//    3. re-deploy
//
//  Hasta que esté configurada la variable, el endpoint responde 404
//  y el cliente (feedback.js) cae automáticamente al mensaje predefinido.
//  No se necesita ningún otro cambio de código.
// ──────────────────────────────────────────────────────────────────────────

export default async function handler(req, res) {
  // Solo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Si no hay API key configurada, retornar 404 → cliente usa predefinido
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(404).json({ error: 'AI feedback not configured' })
  }

  const { claseNum, tipo, payload } = req.body || {}

  // ── Prompt de sistema: voz de Robotsin ──────────────────────────────────
  const systemPrompt = `Eres D-IA Vinci Robotsin, el maestro robot de la Academia Da Vinci IA.
Acabas de revisar la entrega de un alumno de 8 a 13 años.
Responde en exactamente 2-3 oraciones. En español mexicano. Con entusiasmo genuino, nunca condescendiente.
Habla directamente al alumno usando "tú".
Menciona de forma específica lo que lograron — no des un elogio genérico.
NUNCA digas "muy bien", "eres muy talentoso" o "qué inteligente" — premia el esfuerzo y la creación, no el talento innato.
Termina siempre con algo que los motive a continuar.`

  // ── Descripción de la entrega por clase ─────────────────────────────────
  const CONTEXTOS = {
    2:  'El alumno escribió la historia de origen de su personaje: poderes, personalidad, historia personal.',
    3:  'El alumno generó y subió el retrato oficial de su personaje usando IA.',
    4:  'El alumno creó la Tarjeta Oficial de su personaje (ficha de identidad completa).',
    5:  `El alumno eligió el arquetipo "${payload?.arquetipo_nombre || payload?.arquetipo_id}" para su personaje según los 12 arquetipos de Jung.`,
    7:  'El alumno subió retratos de sus personajes secundarios (aliados y villanos).',
    10: 'El alumno entregó el guion completo de su episodio, estructurado en 3 actos.',
    11: 'El alumno escribió y entregó los diálogos de los personajes de su historia.',
    14: 'El alumno subió a YouTube su primera animación — el personaje cobró vida por primera vez.',
    18: 'El alumno subió a YouTube el tráiler de su proyecto de cine digital.',
    23: 'El alumno subió a YouTube su proyecto final completo — el episodio terminado después de todo el curso.',
  }

  const contexto = CONTEXTOS[claseNum] ||
    `El alumno entregó trabajo para la clase ${claseNum} (tipo: ${tipo}).`

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'x-api-key':         apiKey,
        'anthropic-version': '2023-06-01',
        'content-type':      'application/json',
      },
      body: JSON.stringify({
        model:      'claude-haiku-4-5-20251001',
        max_tokens: 220,
        system:     systemPrompt,
        messages:   [{ role: 'user', content: contexto }],
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[DaVinci/feedback] Anthropic error:', err)
      return res.status(500).json({ error: 'API error' })
    }

    const data    = await response.json()
    const message = data.content?.[0]?.text?.trim()

    if (!message) return res.status(500).json({ error: 'Empty AI response' })

    return res.status(200).json({ message })

  } catch (err) {
    console.error('[DaVinci/feedback] Fetch error:', err)
    return res.status(500).json({ error: 'Internal error' })
  }
}

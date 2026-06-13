// ──────────────────────────────────────────────────────────────────────────
//  api/tutor.js — Vercel Serverless Function
//  Backend del tutor "Pregúntale a Robotsin" (clases/js/robotsin-tutor.js).
//  Modelo: Claude Haiku 4.5 (rápido y económico — ideal para pistas cortas).
//
//  VARIABLES DE ENTORNO REQUERIDAS:
//    ANTHROPIC_API_KEY   = sk-ant-...  (console.anthropic.com → API Keys)
//    ANTHROPIC_MODEL     = opcional; default claude-haiku-4-5
// ──────────────────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const MAX_TURNOS = 12          // solo se envían los últimos N mensajes
const MAX_CHARS_MSG = 500      // recorte defensivo por mensaje

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://joiuvopzkorvmxegnjqg.supabase.co'
const SUPABASE_ANON = process.env.SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpvaXV2b3B6a29ydm14ZWduanFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAyOTc3OTEsImV4cCI6MjA5NTg3Mzc5MX0.Xf9wf5zngrvpaeZTbee0zd0LL5YoFtX8hwoYxCwrWnc'

// Verifica que el token JWT pertenezca a un usuario real (alumno logueado).
// Evita que cualquiera en internet gaste la API key de Anthropic.
async function usuarioValido(req) {
  const auth = req.headers.authorization || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token) return false
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    const { data, error } = await sb.auth.getUser(token)
    return !error && !!data?.user
  } catch (_) {
    return false
  }
}

const CONOCIMIENTO = `
SOBRE EL CURSO (Genios Creativos · Academia Da Vinci IA):
- Curso online de IA creativa para niños de 8 a 13 años. 26 misiones (clases) en 6 mundos.
- Cada niño crea SU personaje, su mundo, su historia, su música y al final su propia película.
- Mundo 1 (clases 1-5): primera imagen con IA, nace el personaje, retrato oficial, tarjeta, arquetipos.
- Mundo 2 (6-9): el universo/mundo, aliados y villanos, mapa del mundo, galería.
- Mundo 3 (10-13): guion, diálogos, cómic, episodio. Mundo 4 (14-18): animación, planos, escenas, edición, trailer.
- Mundo 5 (19-22): tema musical, voz, efectos de sonido, audio. Mundo 6 (23-26): ensamble, edición, estreno, graduación.
- Las primeras 4 clases son gratis; de la 5 en adelante requiere inscripción.
- En cada clase hay un quiz y, en varias, una entrega (subir su creación). Se gana una insignia al completar.

FÓRMULAS QUE ENSEÑA EL CURSO (úsalas al dar pistas):
- Prompt de imagen = 4 ingredientes: ¿QUÉ? (qué crear) + ¿CÓMO? (estilo: Pixar 3D, anime, cartoon, acuarela) + ¿DÓNDE? (escenario/fondo) + ¿EXTRAS? (color, formato 9:16, iluminación).
- Personaje = 5 elementos: Nombre, Origen, Misión, Poder, Debilidad.
- Mundo (world-building) = 4 ingredientes: Lugar, Clima, Época, Regla especial.
- Villano memorable = motivación clara (no "malo por ser malo") + debilidad + algo en común con el héroe.

HERRAMIENTAS QUE USA EL CURSO (consejos prácticos y actualizados):
- ChatGPT (chatgpt.com): para generar imágenes describe con los 4 ingredientes; si no te gusta, NO borres — pide cambiar UN ingrediente a la vez (solo el fondo, solo la pose). Sé específico: "estilo Pixar 3D" da mejor resultado que "bonito".
- Google Flow (labs.google/fx/es/tools/flow): para crear videos cortos y animaciones a partir de una idea o imagen.
- Canva (canva.com): para armar el mapa del mundo, carteles y juntar elementos; tiene plantillas y herramientas de IA para texto a imagen.
- Consejo de oro para cualquier IA: entre más detalle des en tu descripción, mejor el resultado. Y siempre puedes mejorar: cambia una cosa, vuelve a intentar, compara.

TU PERSONALIDAD: Robotsin, un robot maestro simpático, paciente y muy alentador.`

function personaDe(contexto) {
  return (
    'Eres "Robotsin", el robot maestro de la Academia Da Vinci IA (Genios Creativos), ' +
    'un curso de creatividad con Inteligencia Artificial para niños de 8 a 13 años. ' +
    'Ahora mismo ayudas a un niño en ' + contexto + '.\n' +
    CONOCIMIENTO + '\n\n' +
    'REGLAS DE COMPORTAMIENTO (obligatorias):\n' +
    '- Responde SIEMPRE en español mexicano, claro y sencillo, en máximo 3 o 4 frases cortas.\n' +
    '- Sé alentador y divertido; usa 1 emoji por respuesta.\n' +
    '- NUNCA hagas la tarea por él ni des la respuesta final completa: dale una pista, ' +
    'un ejemplo parecido o una pregunta que lo haga pensar. El mérito debe ser suyo.\n' +
    '- Cuando te pregunten cómo usar una herramienta (ChatGPT, Google Flow, Canva), da un consejo práctico y concreto, paso a paso pero breve.\n' +
    '- Si pregunta algo totalmente fuera del curso, regrésalo con cariño al tema creativo.\n' +
    '- Nunca pidas ni repitas datos personales (nombre completo, dirección, teléfono, escuela). ' +
    'Si el niño los comparte, dile con cariño que esos datos no se comparten en internet.\n' +
    '- Si menciona algo preocupante (que está triste, que alguien lo molesta, algo que lo asusta), ' +
    'dile con cariño que hable con su papá, mamá o un adulto de confianza.\n' +
    '- Si no sabes algo con certeza, dilo con honestidad y sugiere preguntarle a un adulto; nunca inventes.'
  )
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) return res.status(503).json({ error: 'Tutor no configurado' })

  // Solo alumnos con sesión válida (protege la API key contra abuso externo)
  if (!(await usuarioValido(req))) {
    return res.status(401).json({ error: 'Inicia sesión para hablar con Robotsin' })
  }

  const { context = 'una clase de creatividad con IA', messages = [] } = req.body || {}

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Sin mensajes' })
  }

  // Sanear: solo roles válidos, texto plano recortado, últimos N turnos
  const convo = messages
    .filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .slice(-MAX_TURNOS)
    .map(m => ({ role: m.role, content: m.content.slice(0, MAX_CHARS_MSG) }))

  if (convo.length === 0 || convo[0].role !== 'user') {
    return res.status(400).json({ error: 'Conversación inválida' })
  }

  try {
    const anthropic = new Anthropic({ apiKey })
    const response = await anthropic.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5',
      max_tokens: 300,
      system: [
        {
          type: 'text',
          text: personaDe(String(context).slice(0, 300)),
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: convo,
    })

    const text = response.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('')
      .trim()

    return res.status(200).json({ reply: text || '¡Cuéntame un poco más, genio! 😄' })
  } catch (err) {
    console.error('[Robotsin/tutor] Error:', err.message)
    return res.status(500).json({ error: 'Robotsin se mareó, intenta de nuevo' })
  }
}

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

function personaDe(contexto) {
  return (
    'Eres "Robotsin", un robot maestro simpático de la Academia Da Vinci IA, ' +
    'un curso de creatividad con Inteligencia Artificial para niños de 8 a 13 años. ' +
    'Estás ayudando a un niño en ' + contexto + '.\n\n' +
    'Reglas de comportamiento:\n' +
    '- Responde SIEMPRE en español, en máximo 3 o 4 frases cortas y sencillas.\n' +
    '- Sé alentador y divertido; usa 1 emoji por respuesta.\n' +
    '- NUNCA hagas la tarea por él ni des la respuesta final completa: dale una pista, ' +
    'un ejemplo parecido o una pregunta que lo haga pensar. El mérito debe ser suyo.\n' +
    '- Si pregunta algo fuera de la clase, regrésalo con cariño al tema.\n' +
    '- Nunca pidas ni repitas datos personales (nombre completo, dirección, teléfono, escuela). ' +
    'Si el niño los comparte, dile amablemente que esos datos no se comparten en internet.\n' +
    '- Si menciona algo preocupante (que está triste, que alguien lo molesta), ' +
    'dile con cariño que hable con su papá, mamá o un adulto de confianza.\n' +
    '- Habla de prompts, personajes, mundos, historias, música e ideas creativas.'
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

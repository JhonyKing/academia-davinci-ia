// ──────────────────────────────────────────────────────────────────────────
//  api/registro.js — Vercel Serverless Function
//  Registro GRATUITO self-service: crea la cuenta del alumno (clases 1-4
//  gratis; el paywall de la clase 5+ ya lo controla profile.activo=false)
//  y envía el correo de invitación para elegir contraseña.
//
//  VARIABLES DE ENTORNO: SUPABASE_SERVICE_ROLE_KEY, SITE_URL
// ──────────────────────────────────────────────────────────────────────────

import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const supabaseUrl = process.env.SUPABASE_URL || 'https://joiuvopzkorvmxegnjqg.supabase.co'
  const siteUrl = process.env.SITE_URL || 'https://genioscreativos.com'

  if (!serviceKey) return res.status(503).json({ error: 'Registro no disponible' })

  const { email = '', nombre_alumno = '', edad_alumno = '' } = req.body || {}
  const mail = String(email).trim().toLowerCase()

  if (!mail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
    return res.status(400).json({ error: 'Correo inválido' })
  }
  if (!nombre_alumno || String(nombre_alumno).trim().length < 2) {
    return res.status(400).json({ error: 'Falta el nombre del alumno' })
  }

  const sb = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  // Invitar: crea la cuenta Y envía el correo para elegir contraseña
  const { data, error } = await sb.auth.admin.inviteUserByEmail(mail, {
    redirectTo: `${siteUrl}/login.html`,
    data: {
      nombre: String(nombre_alumno).trim().slice(0, 60),
      edad: String(edad_alumno).slice(0, 3),
      rol: 'alumno',
      origen: 'registro_gratis',
    },
  })

  if (error) {
    const msg = (error.message || '').toLowerCase()
    if (msg.includes('already') || msg.includes('registered') || error.status === 422) {
      return res.status(409).json({ error: 'ya_existe' })
    }
    console.error('[DaVinci/registro] Error:', error.message)
    return res.status(500).json({ error: 'No se pudo crear la cuenta, intenta de nuevo' })
  }

  // Asegurar el perfil (el trigger lo crea; reforzamos nombre y email).
  // activo=false → acceso gratis a clases 1-4; el paywall existente cubre 5+.
  const userId = data?.user?.id
  if (userId) {
    await sb.from('profiles').upsert(
      {
        id: userId,
        nombre: String(nombre_alumno).trim().slice(0, 60),
        email: mail,
        rol: 'alumno',
        activo: false,
      },
      { onConflict: 'id' }
    )
  }

  return res.status(200).json({ ok: true })
}

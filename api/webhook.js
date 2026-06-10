// ──────────────────────────────────────────────────────────────────────────
//  api/webhook.js — Vercel Serverless Function
//  Recibe eventos de Stripe. Al confirmarse un pago:
//    1. Crea cuenta del alumno en Supabase Auth
//    2. Crea perfil en tabla profiles
//    3. Registra la suscripción
//
//  VARIABLES DE ENTORNO REQUERIDAS:
//    STRIPE_SECRET_KEY          = sk_live_...
//    STRIPE_WEBHOOK_SECRET      = whsec_...  (Stripe Dashboard → Webhooks → Signing secret)
//    SUPABASE_URL               = https://joiuvopzkorvmxegnjqg.supabase.co
//    SUPABASE_SERVICE_ROLE_KEY  = eyJ...  (Supabase Dashboard → Settings → API → service_role)
//
//  CONFIGURAR WEBHOOK EN STRIPE:
//    Stripe Dashboard → Developers → Webhooks → Add endpoint
//    URL: https://academia-davinci-ia.vercel.app/api/webhook
//    Eventos: checkout.session.completed, customer.subscription.deleted
// ──────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

// Necesario para que Stripe pueda verificar la firma del webhook
export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end',  () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const stripeKey    = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  const supabaseUrl  = process.env.SUPABASE_URL  || 'https://joiuvopzkorvmxegnjqg.supabase.co'
  const serviceKey   = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!stripeKey || !webhookSecret) {
    console.warn('[DaVinci/webhook] Stripe not configured')
    return res.status(503).end()
  }

  const stripe    = new Stripe(stripeKey, { apiVersion: '2024-12-18.acacia' })
  const rawBody   = await getRawBody(req)
  const signature = req.headers['stripe-signature']

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    console.error('[DaVinci/webhook] Firma inválida:', err.message)
    return res.status(400).json({ error: 'Invalid signature' })
  }

  // ── Pago completado ───────────────────────────────────────────────────────
  if (event.type === 'checkout.session.completed') {
    const session       = event.data.object
    const email         = session.customer_email || session.metadata?.email
    const nombre_alumno = session.metadata?.nombre_alumno || ''
    const subscription_id = session.subscription || session.payment_intent

    if (!email) {
      console.error('[DaVinci/webhook] Sin email en session')
      return res.status(200).end() // 200 para que Stripe no reintente
    }

    if (!serviceKey) {
      console.warn('[DaVinci/webhook] SUPABASE_SERVICE_ROLE_KEY no configurada')
      return res.status(200).end()
    }

    const sb = createClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    const siteUrl = process.env.SITE_URL || 'https://academia-davinci-ia.vercel.app'

    // Verificar si el usuario ya existe
    const { data: existingList } = await sb.auth.admin.listUsers()
    const existingUser = existingList?.users?.find(u => u.email === email)

    let userId

    if (existingUser) {
      // Ya existe — actualizar metadata y activar
      userId = existingUser.id
      await sb.auth.admin.updateUserById(userId, {
        user_metadata: {
          ...existingUser.user_metadata,
          nombre: nombre_alumno || existingUser.user_metadata?.nombre,
          stripe_subscription_id: subscription_id,
        }
      })
      console.log('[DaVinci/webhook] Usuario ya existía, actualizado:', email)
    } else {
      // Usuario nuevo — invitar (crea cuenta Y manda correo para elegir contraseña)
      const { data: inviteData, error: inviteError } = await sb.auth.admin.inviteUserByEmail(email, {
        redirectTo: `${siteUrl}/login.html`,
        data: {
          nombre:    nombre_alumno,
          rol:       'alumno',
          stripe_subscription_id: subscription_id,
        },
      })

      if (inviteError) {
        console.error('[DaVinci/webhook] Error invitando usuario:', inviteError.message)
        return res.status(200).end()
      }

      userId = inviteData?.user?.id
      console.log('[DaVinci/webhook] Alumno invitado (correo enviado):', email, userId)
    }

    if (!userId) {
      console.error('[DaVinci/webhook] No se pudo obtener userId para:', email)
      return res.status(200).end()
    }

    // Crear/actualizar perfil en tabla profiles
    await sb.from('profiles').upsert({
      id:                    userId,
      nombre:                nombre_alumno || email.split('@')[0],
      rol:                   'alumno',
      stripe_subscription_id: subscription_id,
      activo:                true,
    }, { onConflict: 'id' })
  }

  // ── Suscripción cancelada ─────────────────────────────────────────────────
  if (event.type === 'customer.subscription.deleted') {
    const sub   = event.data.object
    const email = sub.metadata?.email

    if (email && serviceKey) {
      const sb = createClient(supabaseUrl, serviceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
      })
      // Marcar alumno como inactivo (no borrarlo — conserva su portafolio)
      const { data: existing } = await sb.auth.admin.listUsers()
      const user = existing?.users?.find(u => u.email === email)
      if (user) {
        await sb.from('profiles').update({ activo: false }).eq('id', user.id)
        console.log('[DaVinci/webhook] Suscripción cancelada para:', email)
      }
    }
  }

  return res.status(200).json({ received: true })
}

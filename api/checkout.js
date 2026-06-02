// ──────────────────────────────────────────────────────────────────────────
//  api/checkout.js — Vercel Serverless Function
//  Crea una sesión de pago en Stripe para inscripción a Academia Da Vinci IA
//
//  VARIABLES DE ENTORNO REQUERIDAS (Vercel Dashboard → Settings → Env Vars):
//    STRIPE_SECRET_KEY   = sk_live_...  (o sk_test_... para pruebas)
//    STRIPE_PRICE_ID     = price_...    (ID del precio mensual en Stripe)
//    SITE_URL            = https://academia-davinci-ia.vercel.app
// ──────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe'

export default async function handler(req, res) {
  // CORS para peticiones desde el mismo dominio
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secretKey = process.env.STRIPE_SECRET_KEY
  const priceId   = process.env.STRIPE_PRICE_ID
  const siteUrl   = process.env.SITE_URL || 'https://academia-davinci-ia.vercel.app'

  if (!secretKey || !priceId) {
    return res.status(503).json({ error: 'Stripe not configured', hint: 'Agrega STRIPE_SECRET_KEY y STRIPE_PRICE_ID en Vercel env vars' })
  }

  const { email, nombre_alumno = '', edad_alumno = '' } = req.body || {}

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' })
  }

  try {
    const stripe  = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode:                 'subscription',
      line_items:           [{ price: priceId, quantity: 1 }],
      customer_email:       email,
      metadata: {
        nombre_alumno,
        edad_alumno,
        source: 'academia-davinci-ia',
      },
      subscription_data: {
        metadata: { nombre_alumno, email },
      },
      success_url: `${siteUrl}/bienvenida.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/pago.html?cancelado=1`,
      locale:      'es',
      allow_promotion_codes: true,
    })

    return res.status(200).json({ url: session.url })

  } catch (err) {
    console.error('[DaVinci/checkout] Stripe error:', err.message)
    return res.status(500).json({ error: 'Error al crear sesión de pago', detail: err.message })
  }
}

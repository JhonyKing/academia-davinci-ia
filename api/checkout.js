// ──────────────────────────────────────────────────────────────────────────
//  api/checkout.js — Vercel Serverless Function
//  Soporta dos planes:
//    plan=lifetime  → $147 pago único  (STRIPE_PRICE_ID)
//    plan=monthly   → $30/mes          (STRIPE_PRICE_ID_MONTHLY)
// ──────────────────────────────────────────────────────────────────────────

import Stripe from 'stripe'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', process.env.SITE_URL || '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secretKey      = process.env.STRIPE_SECRET_KEY
  const priceLifetime  = process.env.STRIPE_PRICE_ID
  const priceMonthly   = process.env.STRIPE_PRICE_ID_MONTHLY
  const siteUrl        = process.env.SITE_URL || 'https://academia-davinci-ia.vercel.app'

  if (!secretKey || !priceLifetime || !priceMonthly) {
    return res.status(503).json({ error: 'Stripe not configured' })
  }

  const { email, nombre_alumno = '', edad_alumno = '', plan = 'lifetime' } = req.body || {}

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Email inválido' })
  }

  const isMonthly = plan === 'monthly'
  const priceId   = isMonthly ? priceMonthly : priceLifetime
  const mode      = isMonthly ? 'subscription' : 'payment'

  try {
    const stripe  = new Stripe(secretKey, { apiVersion: '2024-12-18.acacia' })

    const sessionParams = {
      payment_method_types: ['card'],
      mode,
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      metadata: { nombre_alumno, edad_alumno, email, plan, source: 'academia-davinci-ia' },
      success_url: `${siteUrl}/bienvenida.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${siteUrl}/pago.html?cancelado=1`,
      locale: 'es',
      allow_promotion_codes: true,
    }

    if (isMonthly) {
      sessionParams.subscription_data = { metadata: { nombre_alumno, email } }
    }

    const session = await stripe.checkout.sessions.create(sessionParams)
    return res.status(200).json({ url: session.url })

  } catch (err) {
    console.error('[DaVinci/checkout] Stripe error:', err.message)
    return res.status(500).json({ error: 'Error al crear sesión de pago', detail: err.message })
  }
}

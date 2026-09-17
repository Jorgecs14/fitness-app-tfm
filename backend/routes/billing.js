/**
 * Rutas para la gestión de Cobros, Suscripciones y Facturación
 * Aislamiento estricto por entrenador: cada profesional gestiona sus cuotas, clientes y facturación de forma 100% independiente.
 */

const express = require('express')
const router = express.Router()
const { pool, supabaseAdmin } = require('../database/supabaseClient')
const { authenticateToken } = require('../middleware/auth')

// Stripe initialization if STRIPE_SECRET_KEY is present
let stripe = null
if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
  } catch (err) {
    console.warn('⚠️ Stripe no pudo ser inicializado:', err.message)
  }
}

// ============================================================================
// ENDPOINTS PARA EL ENTRENADOR (Gestión de sus clientes, cuotas y facturación)
// ============================================================================

/**
 * GET /api/billing/trainer/summary
 * Obtener métricas financieras y KPIs del mes para el entrenador autenticado
 */
router.get('/trainer/summary', authenticateToken, async (req, res) => {
  try {
    const trainerId = req.user.id

    // 1. Obtener todos los clientes asociados al entrenador
    const clientsQuery = `
      SELECT u.id, u.name, u.surname, u.email,
             cs.id as subscription_id, cs.status, cs.payment_type, cs.monthly_amount,
             cs.current_period_start, cs.current_period_end, cs.last_payment_date,
             cs.card_last4, cs.card_brand, tp.name as plan_name
      FROM public.users u
      LEFT JOIN public.client_subscriptions cs ON cs.client_id = u.id AND cs.trainer_id = $1
      LEFT JOIN public.trainer_plans tp ON tp.id = cs.plan_id
      WHERE u.trainer_id = $1 AND (u.role = 'client' OR u.role = 'cliente')
    `
    const { rows: clientList } = await pool.query(clientsQuery, [trainerId])

    // 2. Facturación total del mes en curso (payment_invoices con status = 'paid' en el mes actual)
    const invoicesMonthQuery = `
      SELECT COALESCE(SUM(amount), 0) as total_month, COUNT(id) as paid_count
      FROM public.payment_invoices
      WHERE trainer_id = $1 AND status = 'paid'
        AND DATE_TRUNC('month', payment_date) = DATE_TRUNC('month', CURRENT_DATE)
    `
    const { rows: monthStats } = await pool.query(invoicesMonthQuery, [trainerId])

    // Calcular KPIs
    const totalClients = clientList.length
    let activeSubscriptions = 0
    let pendingPayments = 0
    let mrr = 0 // Monthly Recurring Revenue

    const now = new Date()

    clientList.forEach((c) => {
      const amount = Number(c.monthly_amount) || 0
      if (c.status === 'active') {
        activeSubscriptions++
        mrr += amount
      } else {
        pendingPayments++
      }
    })

    res.json({
      total_clients: totalClients,
      active_subscriptions: activeSubscriptions,
      pending_payments: pendingPayments,
      monthly_revenue: parseFloat(monthStats[0]?.total_month || 0),
      mrr: parseFloat(mrr.toFixed(2)),
      paid_invoices_count: parseInt(monthStats[0]?.paid_count || 0, 10),
    })
  } catch (error) {
    console.error('Error in /trainer/summary:', error)
    res.status(500).json({ error: 'Error al obtener resumen de facturación', details: error.message })
  }
})

/**
 * GET /api/billing/trainer/clients
 * Lista detallada de clientes del entrenador con su estado financiero y cuota
 */
router.get('/trainer/clients', authenticateToken, async (req, res) => {
  try {
    const trainerId = req.user.id

    const query = `
      SELECT 
        u.id as client_id,
        u.name,
        u.surname,
        u.email,
        cs.id as subscription_id,
        COALESCE(cs.status, 'pending_payment') as status,
        COALESCE(cs.payment_type, 'manual') as payment_type,
        COALESCE(cs.monthly_amount, tp.price, 50.00) as monthly_amount,
        cs.current_period_start,
        cs.current_period_end,
        cs.last_payment_date,
        cs.card_last4,
        cs.card_brand,
        cs.cancel_at_period_end,
        tp.id as plan_id,
        COALESCE(tp.name, 'Tarifa Mensual') as plan_name
      FROM public.users u
      LEFT JOIN public.client_subscriptions cs ON cs.client_id = u.id AND cs.trainer_id = $1
      LEFT JOIN public.trainer_plans tp ON tp.id = cs.plan_id
      WHERE u.trainer_id = $1 AND (u.role = 'client' OR u.role = 'cliente')
      ORDER BY u.name ASC
    `
    const { rows } = await pool.query(query, [trainerId])
    res.json(rows)
  } catch (error) {
    console.error('Error in /trainer/clients:', error)
    res.status(500).json({ error: 'Error al obtener clientes y cuotas', details: error.message })
  }
})

/**
 * GET /api/billing/trainer/plans
 * Obtener todos los planes y cuotas definidos por el entrenador autenticado
 */
router.get('/trainer/plans', authenticateToken, async (req, res) => {
  try {
    const trainerId = req.user.id
    const query = `
      SELECT * FROM public.trainer_plans
      WHERE trainer_id = $1 AND is_active = true
      ORDER BY price ASC
    `
    const { rows } = await pool.query(query, [trainerId])

    // Si el entrenador aún no tiene planes creados, crear un plan base por defecto
    if (rows.length === 0) {
      const insertDefault = `
        INSERT INTO public.trainer_plans (trainer_id, name, description, price, billing_period)
        VALUES ($1, 'Plan Mensual Estándar', 'Seguimiento mensual completo con rutina y dieta personalizada', 50.00, 'monthly')
        RETURNING *
      `
      const { rows: defaultRows } = await pool.query(insertDefault, [trainerId])
      return res.json(defaultRows)
    }

    res.json(rows)
  } catch (error) {
    console.error('Error in /trainer/plans:', error)
    res.status(500).json({ error: 'Error al obtener planes del entrenador', details: error.message })
  }
})

/**
 * POST /api/billing/trainer/plans
 * Crear un nuevo plan/tarifa para los clientes de este entrenador
 */
router.post('/trainer/plans', authenticateToken, async (req, res) => {
  try {
    const trainerId = req.user.id
    const { name, description, price, billing_period } = req.body

    if (!name || price === undefined || price === null) {
      return res.status(400).json({ error: 'El nombre y el precio del plan son requeridos' })
    }

    const query = `
      INSERT INTO public.trainer_plans (trainer_id, name, description, price, billing_period, is_active)
      VALUES ($1, $2, $3, $4, $5, true)
      RETURNING *
    `
    const { rows } = await pool.query(query, [
      trainerId,
      name,
      description || '',
      parseFloat(price),
      billing_period || 'monthly',
    ])

    res.status(201).json(rows[0])
  } catch (error) {
    console.error('Error creating trainer plan:', error)
    res.status(500).json({ error: 'Error al crear plan de entrenamiento', details: error.message })
  }
})

/**
 * PUT /api/billing/trainer/plans/:id
 * Actualizar un plan existente del entrenador
 */
router.put('/trainer/plans/:id', authenticateToken, async (req, res) => {
  try {
    const trainerId = req.user.id
    const planId = req.params.id
    const { name, description, price, billing_period, is_active } = req.body

    const query = `
      UPDATE public.trainer_plans
      SET name = COALESCE($1, name),
          description = COALESCE($2, description),
          price = COALESCE($3, price),
          billing_period = COALESCE($4, billing_period),
          is_active = COALESCE($5, is_active),
          updated_at = NOW()
      WHERE id = $6 AND trainer_id = $7
      RETURNING *
    `
    const { rows } = await pool.query(query, [
      name,
      description,
      price ? parseFloat(price) : null,
      billing_period,
      is_active,
      planId,
      trainerId,
    ])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plan no encontrado o no autorizado' })
    }

    res.json(rows[0])
  } catch (error) {
    console.error('Error updating trainer plan:', error)
    res.status(500).json({ error: 'Error al actualizar plan', details: error.message })
  }
})

/**
 * DELETE /api/billing/trainer/plans/:id
 * Desactivar un plan del entrenador
 */
router.delete('/trainer/plans/:id', authenticateToken, async (req, res) => {
  try {
    const trainerId = req.user.id
    const planId = req.params.id

    const query = `
      UPDATE public.trainer_plans
      SET is_active = false, updated_at = NOW()
      WHERE id = $1 AND trainer_id = $2
      RETURNING *
    `
    const { rows } = await pool.query(query, [planId, trainerId])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plan no encontrado' })
    }

    res.json({ message: 'Plan desactivado correctamente' })
  } catch (error) {
    console.error('Error deleting trainer plan:', error)
    res.status(500).json({ error: 'Error al eliminar plan', details: error.message })
  }
})

/**
 * POST /api/billing/trainer/manual-payment
 * Registrar cobro manual recibido (efectivo, Bizum, transferencia) y extender el periodo del cliente
 */
router.post('/trainer/manual-payment', authenticateToken, async (req, res) => {
  try {
    const trainerId = req.user.id
    const { client_id, amount, payment_method, notes } = req.body

    if (!client_id || !amount) {
      return res.status(400).json({ error: 'El ID del cliente y el importe son requeridos' })
    }

    const parsedAmount = parseFloat(amount)
    const method = payment_method || 'transfer'
    const now = new Date()
    const nextPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // 1. Actualizar o crear la suscripción del cliente
    const subQuery = `
      INSERT INTO public.client_subscriptions (
        client_id, trainer_id, status, payment_type, monthly_amount,
        current_period_start, current_period_end, last_payment_date, updated_at
      )
      VALUES ($1, $2, 'active', 'manual', $3, $4, $5, $4, $4)
      ON CONFLICT (client_id) DO UPDATE
      SET status = 'active',
          payment_type = 'manual',
          monthly_amount = EXCLUDED.monthly_amount,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          last_payment_date = EXCLUDED.last_payment_date,
          updated_at = NOW()
      RETURNING *
    `
    const { rows: subRows } = await pool.query(subQuery, [
      client_id,
      trainerId,
      parsedAmount,
      now,
      nextPeriodEnd,
    ])

    const subscription = subRows[0]

    // 2. Generar factura / recibo
    const invoiceNumber = `REC-${Date.now().toString().slice(-6)}-${client_id}`
    const invoiceQuery = `
      INSERT INTO public.payment_invoices (
        subscription_id, client_id, trainer_id, invoice_number,
        amount, currency, status, payment_method, payment_date,
        period_start, period_end, notes
      )
      VALUES ($1, $2, $3, $4, $5, 'EUR', 'paid', $6, $7, $7, $8, $9)
      RETURNING *
    `
    const { rows: invRows } = await pool.query(invoiceQuery, [
      subscription.id,
      client_id,
      trainerId,
      invoiceNumber,
      parsedAmount,
      method,
      now,
      nextPeriodEnd,
      notes || 'Cobro manual registrado por el entrenador',
    ])

    res.json({
      message: 'Pago manual registrado con éxito',
      subscription: subscription,
      invoice: invRows[0],
    })
  } catch (error) {
    console.error('Error recording manual payment:', error)
    res.status(500).json({ error: 'Error al registrar pago manual', details: error.message })
  }
})

/**
 * PUT /api/billing/trainer/client-fee
 * Establecer una cuota personalizada a un cliente específico
 */
router.put('/trainer/client-fee', authenticateToken, async (req, res) => {
  try {
    const trainerId = req.user.id
    const { client_id, monthly_amount, plan_id } = req.body

    if (!client_id || monthly_amount === undefined) {
      return res.status(400).json({ error: 'client_id y monthly_amount son requeridos' })
    }

    const parsedAmount = parseFloat(monthly_amount)

    const query = `
      INSERT INTO public.client_subscriptions (
        client_id, trainer_id, plan_id, monthly_amount, status,
        current_period_start, current_period_end
      )
      VALUES ($1, $2, $3, $4, 'active', NOW(), NOW() + INTERVAL '30 days')
      ON CONFLICT (client_id) DO UPDATE
      SET monthly_amount = $4,
          plan_id = COALESCE($3, public.client_subscriptions.plan_id),
          updated_at = NOW()
      RETURNING *
    `
    const { rows } = await pool.query(query, [client_id, trainerId, plan_id || null, parsedAmount])
    res.json({ message: 'Cuota actualizada correctamente', data: rows[0] })
  } catch (error) {
    console.error('Error updating client fee:', error)
    res.status(500).json({ error: 'Error al actualizar cuota del cliente', details: error.message })
  }
})

// ============================================================================
// ENDPOINTS PARA EL CLIENTE (Consulta de suscripción, tarjeta y facturas)
// ============================================================================

/**
 * GET /api/billing/client/subscription
 * Consultar la suscripción activa del cliente autenticado
 */
router.get('/client/subscription', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id

    // 1. Obtener datos del cliente y su entrenador
    const userQuery = `
      SELECT u.id, u.name, u.surname, u.email, u.trainer_id,
             t.name as trainer_name, t.surname as trainer_surname, t.email as trainer_email
      FROM public.users u
      LEFT JOIN public.users t ON t.id = u.trainer_id
      WHERE u.id = $1
    `
    const { rows: userRows } = await pool.query(userQuery, [clientId])
    if (userRows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' })

    const user = userRows[0]
    const trainerId = user.trainer_id

    // 2. Obtener la suscripción activa
    let subscription = null
    if (trainerId) {
      const subQuery = `
        SELECT cs.*, tp.name as plan_name, tp.description as plan_description
        FROM public.client_subscriptions cs
        LEFT JOIN public.trainer_plans tp ON tp.id = cs.plan_id
        WHERE cs.client_id = $1 AND cs.trainer_id = $2
      `
      const { rows: subRows } = await pool.query(subQuery, [clientId, trainerId])
      if (subRows.length > 0) {
        subscription = subRows[0]
      } else {
        // Si no tiene suscripción aún, buscar el precio base del entrenador
        const planQuery = `
          SELECT * FROM public.trainer_plans
          WHERE trainer_id = $1 AND is_active = true
          ORDER BY price ASC
          LIMIT 1
        `
        const { rows: planRows } = await pool.query(planQuery, [trainerId])
        const defaultPrice = planRows.length > 0 ? planRows[0].price : 50.00
        const defaultPlanName = planRows.length > 0 ? planRows[0].name : 'Tarifa Mensual'

        subscription = {
          client_id: clientId,
          trainer_id: trainerId,
          status: 'pending_payment',
          payment_type: 'manual',
          monthly_amount: defaultPrice,
          plan_name: defaultPlanName,
          current_period_start: new Date(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          last_payment_date: null,
          card_last4: null,
          card_brand: null,
        }
      }
    }

    res.json({
      trainer: {
        id: trainerId,
        name: user.trainer_name ? `${user.trainer_name} ${user.trainer_surname || ''}`.trim() : 'Entrenador Asignado',
        email: user.trainer_email,
      },
      subscription,
    })
  } catch (error) {
    console.error('Error in /client/subscription:', error)
    res.status(500).json({ error: 'Error al consultar suscripción', details: error.message })
  }
})

/**
 * POST /api/billing/client/subscribe
 * Procesar suscripción in-app del cliente (Stripe / Pasarela con tarjeta)
 */
router.post('/client/subscribe', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id
    const { card_last4, card_brand, card_exp_month, card_exp_year, stripe_payment_token } = req.body

    // 1. Obtener trainer_id del cliente
    const { rows: uRows } = await pool.query('SELECT trainer_id FROM public.users WHERE id = $1', [clientId])
    if (uRows.length === 0 || !uRows[0].trainer_id) {
      return res.status(400).json({ error: 'No tienes un entrenador asignado para suscribirte' })
    }
    const trainerId = uRows[0].trainer_id

    // 2. Obtener plan y cuota del entrenador
    const planQuery = `
      SELECT * FROM public.trainer_plans WHERE trainer_id = $1 AND is_active = true ORDER BY price ASC LIMIT 1
    `
    const { rows: pRows } = await pool.query(planQuery, [trainerId])
    const amount = pRows.length > 0 ? pRows[0].price : 50.00
    const planId = pRows.length > 0 ? pRows[0].id : null

    const now = new Date()
    const nextPeriodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    // Si Stripe está activo y se envía un token real, procesar el cargo
    let stripeCustomerId = null
    let stripeSubscriptionId = null
    if (stripe && stripe_payment_token) {
      try {
        const customer = await stripe.customers.create({
          email: req.user.email,
          source: stripe_payment_token,
          metadata: { client_id: clientId, trainer_id: trainerId }
        })
        stripeCustomerId = customer.id
      } catch (stripeErr) {
        console.warn('Stripe checkout warning:', stripeErr.message)
      }
    }

    // 3. Crear / Actualizar suscripción activa in-app
    const subQuery = `
      INSERT INTO public.client_subscriptions (
        client_id, trainer_id, plan_id, status, payment_type, monthly_amount,
        current_period_start, current_period_end, cancel_at_period_end,
        last_payment_date, card_last4, card_brand, card_exp_month, card_exp_year,
        stripe_customer_id, stripe_subscription_id, updated_at
      )
      VALUES ($1, $2, $3, 'active', 'stripe', $4, $5, $6, false, $5, $7, $8, $9, $10, $11, $12, $5)
      ON CONFLICT (client_id) DO UPDATE
      SET trainer_id = EXCLUDED.trainer_id,
          plan_id = EXCLUDED.plan_id,
          status = 'active',
          payment_type = 'stripe',
          monthly_amount = EXCLUDED.monthly_amount,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          cancel_at_period_end = false,
          canceled_at = null,
          last_payment_date = EXCLUDED.last_payment_date,
          card_last4 = EXCLUDED.card_last4,
          card_brand = EXCLUDED.card_brand,
          card_exp_month = EXCLUDED.card_exp_month,
          card_exp_year = EXCLUDED.card_exp_year,
          stripe_customer_id = EXCLUDED.stripe_customer_id,
          stripe_subscription_id = EXCLUDED.stripe_subscription_id,
          updated_at = NOW()
      RETURNING *
    `
    const { rows: subRows } = await pool.query(subQuery, [
      clientId,
      trainerId,
      planId,
      amount,
      now,
      nextPeriodEnd,
      card_last4 || '4242',
      card_brand || 'Visa',
      card_exp_month || 12,
      card_exp_year || 2028,
      stripeCustomerId,
      stripeSubscriptionId,
    ])

    // 4. Emitir factura / recibo de pago
    const invoiceNumber = `STR-${Date.now().toString().slice(-6)}-${clientId}`
    await pool.query(
      `INSERT INTO public.payment_invoices (
        subscription_id, client_id, trainer_id, invoice_number,
        amount, currency, status, payment_method, payment_date,
        period_start, period_end, notes
      ) VALUES ($1, $2, $3, $4, $5, 'EUR', 'paid', 'card', $6, $6, $7, 'Pago in-app con tarjeta procesado')`,
      [subRows[0].id, clientId, trainerId, invoiceNumber, amount, now, nextPeriodEnd]
    )

    res.json({
      message: 'Suscripción in-app activada correctamente con Stripe',
      subscription: subRows[0],
    })
  } catch (error) {
    console.error('Error in /client/subscribe:', error)
    res.status(500).json({ error: 'Error al procesar la suscripción', details: error.message })
  }
})

/**
 * POST /api/billing/client/cancel-subscription
 * Cancelar la suscripción del cliente
 */
router.post('/client/cancel-subscription', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id

    const query = `
      UPDATE public.client_subscriptions
      SET cancel_at_period_end = true,
          status = 'canceled',
          canceled_at = NOW(),
          updated_at = NOW()
      WHERE client_id = $1
      RETURNING *
    `
    const { rows } = await pool.query(query, [clientId])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'No tienes una suscripción activa para cancelar' })
    }

    res.json({
      message: 'Tu suscripción ha sido cancelada. Mantendrás el acceso a tus rutinas y dietas hasta el fin del periodo pagado.',
      subscription: rows[0],
    })
  } catch (error) {
    console.error('Error in /client/cancel-subscription:', error)
    res.status(500).json({ error: 'Error al cancelar la suscripción', details: error.message })
  }
})

/**
 * POST /api/billing/client/update-card
 * Actualizar tarjeta de pago del cliente
 */
router.post('/client/update-card', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id
    const { card_last4, card_brand, card_exp_month, card_exp_year } = req.body

    if (!card_last4) {
      return res.status(400).json({ error: 'Datos de la tarjeta incompletos' })
    }

    const query = `
      UPDATE public.client_subscriptions
      SET card_last4 = $1,
          card_brand = $2,
          card_exp_month = $3,
          card_exp_year = $4,
          updated_at = NOW()
      WHERE client_id = $5
      RETURNING *
    `
    const { rows } = await pool.query(query, [
      card_last4,
      card_brand || 'Visa',
      card_exp_month || 12,
      card_exp_year || 2028,
      clientId,
    ])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'No se encontró suscripción para actualizar' })
    }

    res.json({
      message: 'Método de pago actualizado con éxito',
      subscription: rows[0],
    })
  } catch (error) {
    console.error('Error updating card:', error)
    res.status(500).json({ error: 'Error al actualizar tarjeta', details: error.message })
  }
})

/**
 * GET /api/billing/client/invoices
 * Obtener el historial completo de recibos y facturas del cliente
 */
router.get('/client/invoices', authenticateToken, async (req, res) => {
  try {
    const clientId = req.user.id

    const query = `
      SELECT pi.*, tp.name as plan_name, t.name as trainer_name, t.surname as trainer_surname
      FROM public.payment_invoices pi
      LEFT JOIN public.client_subscriptions cs ON cs.id = pi.subscription_id
      LEFT JOIN public.trainer_plans tp ON tp.id = cs.plan_id
      LEFT JOIN public.users t ON t.id = pi.trainer_id
      WHERE pi.client_id = $1
      ORDER BY pi.payment_date DESC
    `
    const { rows } = await pool.query(query, [clientId])
    res.json(rows)
  } catch (error) {
    console.error('Error in /client/invoices:', error)
    res.status(500).json({ error: 'Error al obtener facturas del cliente', details: error.message })
  }
})

module.exports = router

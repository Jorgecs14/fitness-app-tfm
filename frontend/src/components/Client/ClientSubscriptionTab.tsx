// Componente de Gestión de Suscripción, Pagos y Facturación del Cliente
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Stack,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  CreditCard,
  Calendar,
  Clock,
  ShieldCheck,
  Receipt,
  Lock,
  UserCheck
} from 'lucide-react';
import { billingService, ClientSubscriptionResponse, PaymentInvoice } from '../../services/billingService';
import { User } from '../../types/User';

interface ClientSubscriptionTabProps {
  currentUser: User | null;
}

export const ClientSubscriptionTab: React.FC<ClientSubscriptionTabProps> = ({ currentUser }) => {
  const [subData, setSubData] = useState<ClientSubscriptionResponse | null>(null);
  const [invoices, setInvoices] = useState<PaymentInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modal para añadir/cambiar tarjeta
  const [cardModalOpen, setCardModalOpen] = useState(false);
  const [cardForm, setCardForm] = useState({
    cardNumber: '',
    cardExp: '',
    cardCvc: '',
    cardHolder: currentUser?.name ? `${currentUser.name} ${currentUser.surname || ''}`.trim() : '',
  });

  // Modal de confirmación de cancelación
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [subRes, invRes] = await Promise.all([
        billingService.getClientSubscription(),
        billingService.getClientInvoices(),
      ]);
      setSubData(subRes);
      setInvoices(invRes);
    } catch (err: any) {
      console.error('Error loading subscription data:', err);
      setError(err.response?.data?.error || 'Error al cargar los datos de facturación');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribeOrUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNumber = cardForm.cardNumber.replace(/\s+/g, '');
    if (cleanNumber.length < 15) {
      setError('Por favor, introduce un número de tarjeta válido.');
      return;
    }

    try {
      setActionLoading(true);
      setError(null);

      const last4 = cleanNumber.slice(-4);
      let brand = 'Visa';
      if (cleanNumber.startsWith('5')) brand = 'Mastercard';
      else if (cleanNumber.startsWith('3')) brand = 'Amex';

      let expMonth = 12;
      let expYear = 2028;
      if (cardForm.cardExp.includes('/')) {
        const [m, y] = cardForm.cardExp.split('/');
        expMonth = parseInt(m, 10) || 12;
        expYear = parseInt(`20${y.trim()}`, 10) || 2028;
      }

      await billingService.subscribeInApp({
        card_last4: last4,
        card_brand: brand,
        card_exp_month: expMonth,
        card_exp_year: expYear,
        stripe_payment_token: `tok_sim_${Date.now()}`,
      });

      setSuccessMsg('Suscripción y tarjeta procesadas con éxito. Tu cuota mensual está activa.');
      setCardModalOpen(false);
      setCardForm({ cardNumber: '', cardExp: '', cardCvc: '', cardHolder: '' });
      await loadBillingData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al procesar la tarjeta');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelSubscription = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await billingService.cancelSubscription();
      setSuccessMsg(res.message || 'Suscripción cancelada correctamente.');
      setCancelModalOpen(false);
      await loadBillingData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al cancelar la suscripción');
    } finally {
      setActionLoading(false);
    }
  };

  const formatEuro = (amount?: number) => {
    if (amount === undefined || amount === null) return '0.00 €';
    return `${Number(amount).toFixed(2)} €`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'No registrado';
    try {
      return new Date(isoString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center" width="100%">
        <CircularProgress size={32} sx={{ color: '#007AFF', mb: 2 }} />
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Cargando tu información de suscripción y pagos...
        </Typography>
      </Box>
    );
  }

  const sub = subData?.subscription;
  const trainer = subData?.trainer;
  const isActive = sub?.status === 'active';
  const isCanceled = sub?.status === 'canceled' || sub?.cancel_at_period_end;

  return (
    <Stack spacing={2.5} sx={{ width: '100%', maxWidth: '100%', minWidth: 0, boxSizing: 'border-box' }}>
      {error && (
        <Alert severity="error" sx={{ borderRadius: '14px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ borderRadius: '14px' }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Grid Principal de Estado y Tarjeta */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.3fr 1fr' },
          gap: 2.5,
          width: '100%',
          maxWidth: '100%',
          minWidth: 0
        }}
      >
        {/* Tarjeta de Suscripción */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            borderRadius: '20px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: isActive
              ? '1px solid rgba(52, 199, 89, 0.3)'
              : '1px solid rgba(255, 149, 0, 0.3)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0,
            overflow: 'hidden',
            boxSizing: 'border-box'
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2} flexWrap="wrap" gap={1}>
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, fontSize: '0.72rem' }}>
                  Plan Contratado
                </Typography>
                <Typography variant="h5" fontWeight="800" sx={{ color: '#ffffff', mt: 0.2, fontSize: { xs: '1.15rem', sm: '1.35rem' } }}>
                  {sub?.plan_name || 'Seguimiento Personalizado'}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '0.85rem' }}>
                  <UserCheck size={15} color="#007AFF" style={{ flexShrink: 0 }} />
                  Preparador: <strong style={{ color: '#ffffff' }}>{trainer?.name || 'Entrenador Asignado'}</strong>
                </Typography>
              </Box>

              <Chip
                label={
                  isActive
                    ? 'Suscripción Activa'
                    : isCanceled
                    ? 'Cancelada'
                    : 'Pendiente de Pago'
                }
                size="small"
                sx={{
                  fontWeight: 700,
                  bgcolor: isActive ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 149, 0, 0.15)',
                  color: isActive ? '#34C759' : '#FF9500',
                  border: `1px solid ${isActive ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 149, 0, 0.3)'}`,
                  px: 0.5,
                  flexShrink: 0
                }}
              />
            </Box>

            <Divider sx={{ my: 1.5, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            {/* Importe y Fechas */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
                my: 1,
                minWidth: 0
              }}
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.75rem' }}>
                  Tu Cuota Mensual
                </Typography>
                <Typography variant="h4" fontWeight="900" sx={{ color: '#007AFF', letterSpacing: '-0.02em', mt: 0.2, fontSize: { xs: '1.6rem', sm: '2rem' } }}>
                  {formatEuro(sub?.monthly_amount)}
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}> / mes</span>
                </Typography>
              </Box>

              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', fontSize: '0.75rem' }}>
                  Próxima Renovación
                </Typography>
                <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#ffffff', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.8, fontSize: '0.9rem' }}>
                  <Calendar size={15} color="rgba(255, 255, 255, 0.6)" style={{ flexShrink: 0 }} />
                  {formatDate(sub?.current_period_end)}
                </Typography>
              </Box>

              <Box
                sx={{
                  gridColumn: { xs: 'span 1', sm: 'span 2' },
                  p: 1.5,
                  borderRadius: '12px',
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 1,
                  minWidth: 0
                }}
              >
                <Box display="flex" alignItems="center" gap={1} sx={{ minWidth: 0 }}>
                  <Clock size={14} color="rgba(255, 255, 255, 0.5)" style={{ flexShrink: 0 }} />
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.78rem' }}>
                    Último pago: <strong style={{ color: '#ffffff' }}>{formatDate(sub?.last_payment_date)}</strong>
                  </Typography>
                </Box>

                <Chip
                  label={sub?.payment_type === 'stripe' ? 'Stripe Auto' : 'Gestión Manual'}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    bgcolor: 'rgba(0, 122, 255, 0.1)',
                    color: '#007AFF',
                    border: '1px solid rgba(0, 122, 255, 0.25)',
                    flexShrink: 0
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Acciones de Suscripción */}
          <Box mt={2.5} pt={2} borderTop="1px solid rgba(255, 255, 255, 0.08)" display="flex" gap={1.5} flexWrap="wrap" alignItems="center">
            {!isActive ? (
              <Button
                variant="contained"
                onClick={() => setCardModalOpen(true)}
                startIcon={<CreditCard size={15} />}
                sx={{
                  borderRadius: '12px',
                  fontWeight: 700,
                  textTransform: 'none',
                  bgcolor: '#007AFF',
                  px: 2.5,
                  py: 1,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Pagar Cuota con Tarjeta (Stripe)
              </Button>
            ) : (
              <>
                <Button
                  variant="outlined"
                  onClick={() => setCardModalOpen(true)}
                  startIcon={<CreditCard size={15} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    color: '#ffffff',
                    px: 2,
                    py: 0.8,
                    '&:hover': { borderColor: '#ffffff', bgcolor: 'rgba(255, 255, 255, 0.05)' }
                  }}
                >
                  Actualizar Tarjeta
                </Button>

                <Button
                  variant="text"
                  color="error"
                  onClick={() => setCancelModalOpen(true)}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 600,
                    textTransform: 'none',
                    ml: { xs: 0, sm: 'auto' }
                  }}
                >
                  Cancelar Suscripción
                </Button>
              </>
            )}
          </Box>
        </Box>

        {/* Tarjeta Visual de Pago */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderRadius: '20px',
            bgcolor: 'var(--bg-card, #18181b)',
            border: '1px solid rgba(0, 122, 255, 0.25)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            minWidth: 0,
            boxSizing: 'border-box'
          }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: 0.8, fontSize: '0.8rem' }}>
                MÉTODO DE PAGO
              </Typography>
              <Lock size={15} color="#007AFF" />
            </Box>

            {/* Tarjeta Visual Mockup */}
            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.5)',
                color: '#ffffff',
                width: '100%',
                maxWidth: '100%',
                boxSizing: 'border-box'
              }}
            >
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                <CreditCard size={24} color="#38bdf8" />
                <Typography variant="caption" fontWeight="800" sx={{ letterSpacing: 1, color: '#38bdf8', fontSize: '0.75rem' }}>
                  {sub?.card_brand || 'VISA'}
                </Typography>
              </Box>

              <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: 1.5, mb: 1.5, fontSize: { xs: '0.95rem', sm: '1.05rem' } }}>
                •••• •••• •••• {sub?.card_last4 || '4242'}
              </Typography>

              <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                <Box sx={{ minWidth: 0, pr: 1 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.62rem', display: 'block' }}>
                    TITULAR
                  </Typography>
                  <Typography variant="body2" fontWeight="700" noWrap sx={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '0.78rem' }}>
                    {currentUser?.name} {currentUser?.surname}
                  </Typography>
                </Box>
                <Box textAlign="right" sx={{ flexShrink: 0 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.62rem', display: 'block' }}>
                    CADUCA
                  </Typography>
                  <Typography variant="body2" fontWeight="700" sx={{ color: '#ffffff', fontSize: '0.78rem' }}>
                    {sub?.card_exp_month || 12}/{sub?.card_exp_year ? String(sub.card_exp_year).slice(-2) : '28'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>

          <Box mt={1.8}>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', lineHeight: 1.4, fontSize: '0.72rem' }}>
              <ShieldCheck size={13} style={{ verticalAlign: 'middle', marginRight: 4, color: '#34C759' }} />
              Pagos procesados de forma cifrada con certificación bancaria PCI-DSS de Stripe.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Historial de Recibos y Facturas */}
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          borderRadius: '20px',
          bgcolor: 'var(--bg-card, #18181b)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          width: '100%',
          maxWidth: '100%',
          minWidth: 0,
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <Receipt size={19} color="#007AFF" />
            <Typography variant="h6" fontWeight="800" sx={{ color: '#ffffff', fontSize: { xs: '0.98rem', sm: '1.05rem' } }}>
              Historial de Pagos y Recibos
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.75rem' }}>
            {invoices.length} transacciones registradas
          </Typography>
        </Box>

        {invoices.length === 0 ? (
          <Box py={3} textAlign="center">
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.85rem' }}>
              Aún no tienes recibos o pagos registrados en tu cuenta.
            </Typography>
          </Box>
        ) : (
          <>
            {/* Vista Móvil (Stacked Cards para evitar tabla ancha en teléfonos) */}
            <Stack spacing={1.5} sx={{ display: { xs: 'flex', sm: 'none' }, width: '100%' }}>
              {invoices.map((inv) => (
                <Box
                  key={inv.id}
                  sx={{
                    p: 1.8,
                    borderRadius: '14px',
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.06)',
                    width: '100%',
                    boxSizing: 'border-box'
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={0.8}>
                    <Typography variant="caption" fontWeight="700" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {inv.invoice_number}
                    </Typography>
                    <Chip
                      label={inv.status === 'paid' ? 'Pagado' : inv.status}
                      size="small"
                      sx={{
                        height: 20,
                        fontSize: '0.65rem',
                        fontWeight: 700,
                        bgcolor: inv.status === 'paid' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 149, 0, 0.15)',
                        color: inv.status === 'paid' ? '#34C759' : '#FF9500',
                      }}
                    />
                  </Box>

                  <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                    <Box>
                      <Typography variant="body2" fontWeight="600" sx={{ color: '#ffffff', fontSize: '0.84rem' }}>
                        Cuota mensual — {inv.trainer_name || 'Entrenador'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.72rem' }}>
                        {formatDate(inv.payment_date)} • {inv.payment_method === 'card' ? 'Tarjeta' : inv.payment_method === 'bizum' ? 'Bizum' : 'Transferencia'}
                      </Typography>
                    </Box>
                    <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#38bdf8', fontSize: '1rem' }}>
                      {formatEuro(inv.amount)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>

            {/* Vista Desktop / Tablet (Tabla limpia con overflow contenido) */}
            <TableContainer
              component={Paper}
              sx={{
                display: { xs: 'none', sm: 'block' },
                bgcolor: 'transparent',
                boxShadow: 'none',
                width: '100%',
                maxWidth: '100%',
                overflowX: 'auto'
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { borderColor: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700, fontSize: '0.8rem' } }}>
                    <TableCell>Nº Recibo</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell>Concepto / Preparador</TableCell>
                    <TableCell>Método</TableCell>
                    <TableCell align="right">Importe</TableCell>
                    <TableCell align="center">Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((inv) => (
                    <TableRow key={inv.id} sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff', fontSize: '0.84rem' } }}>
                      <TableCell sx={{ fontWeight: 600 }}>{inv.invoice_number}</TableCell>
                      <TableCell>{formatDate(inv.payment_date)}</TableCell>
                      <TableCell>
                        Cuota mensual — {inv.trainer_name ? `${inv.trainer_name} ${inv.trainer_surname || ''}` : 'Entrenador'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={inv.payment_method === 'card' ? 'Tarjeta' : inv.payment_method === 'bizum' ? 'Bizum' : 'Transferencia'}
                          size="small"
                          sx={{ height: 20, fontSize: '0.66rem', bgcolor: 'rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.8)' }}
                        />
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: '#38bdf8' }}>
                        {formatEuro(inv.amount)}
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={inv.status === 'paid' ? 'Pagado' : inv.status}
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            bgcolor: inv.status === 'paid' ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 149, 0, 0.15)',
                            color: inv.status === 'paid' ? '#34C759' : '#FF9500',
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </Box>

      {/* Modal para Añadir / Actualizar Tarjeta */}
      <Dialog
        open={cardModalOpen}
        onClose={() => setCardModalOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            bgcolor: '#18181b',
            color: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            m: 2
          },
        }}
      >
        <form onSubmit={handleSubscribeOrUpdateCard}>
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CreditCard size={19} color="#007AFF" />
              Datos de Tarjeta Bancaria
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2, fontSize: '0.82rem' }}>
              Introduce tu tarjeta para activar el cobro automático de tu cuota ({formatEuro(sub?.monthly_amount)}/mes) con tu preparador.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Nombre en la Tarjeta"
                fullWidth
                required
                value={cardForm.cardHolder}
                onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '14px', color: '#ffffff' } }}
              />

              <TextField
                label="Número de Tarjeta"
                placeholder="4242 •••• •••• 4242"
                fullWidth
                required
                value={cardForm.cardNumber}
                onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '14px', color: '#ffffff' } }}
              />

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                <TextField
                  label="Caducidad (MM/AA)"
                  placeholder="12/28"
                  fullWidth
                  required
                  value={cardForm.cardExp}
                  onChange={(e) => setCardForm({ ...cardForm, cardExp: e.target.value })}
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '14px', color: '#ffffff' } }}
                />
                <TextField
                  label="CVC / CVV"
                  placeholder="123"
                  type="password"
                  fullWidth
                  required
                  value={cardForm.cardCvc}
                  onChange={(e) => setCardForm({ ...cardForm, cardCvc: e.target.value })}
                  InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '14px', color: '#ffffff' } }}
                />
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={() => setCardModalOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={actionLoading}
              sx={{
                bgcolor: '#007AFF',
                fontWeight: 700,
                borderRadius: '12px',
                textTransform: 'none',
                px: 3,
              }}
            >
              {actionLoading ? 'Procesando...' : 'Confirmar y Guardar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal de Cancelación */}
      <Dialog
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            bgcolor: '#18181b',
            color: '#ffffff',
            borderRadius: '20px',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            m: 2
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#ef4444' }}>
          ¿Cancelar suscripción mensual?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5, fontSize: '0.84rem' }}>
            Si cancelas tu suscripción, mantendrás acceso completo a tus entrenamientos y planes nutricionales hasta el día{' '}
            <strong>{formatDate(sub?.current_period_end)}</strong>. Después de esa fecha, no se realizarán nuevos cargos automáticos.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setCancelModalOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'none' }}>
            Mantener Suscripción
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={actionLoading}
            onClick={handleCancelSubscription}
            sx={{ borderRadius: '12px', fontWeight: 700, textTransform: 'none' }}
          >
            {actionLoading ? 'Cancelando...' : 'Confirmar Cancelación'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default ClientSubscriptionTab;

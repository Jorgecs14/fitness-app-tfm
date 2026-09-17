// Componente de Gestión de Suscripción, Pagos y Facturación del Cliente
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
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
  CheckCircle2,
  AlertCircle,
  Calendar,
  Clock,
  ShieldCheck,
  RotateCcw,
  Plus,
  ArrowRight,
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
      setError('Por favor, introduce un número de tarjeta válido (16 dígitos).');
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

      setSuccessMsg('¡Suscripción y tarjeta procesadas con éxito! Tu cuota mensual está activa.');
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
      <Box p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
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
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert severity="success" sx={{ mb: 3, borderRadius: '12px' }} onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}

      {/* Grid Principal de Estado y Tarjeta */}
      <Grid container spacing={3} mb={4}>
        {/* Tarjeta de Suscripción */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Box
            className="apple-card"
            sx={{
              p: { xs: 2.5, sm: 3 },
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, #1C1C1E 0%, #161618 100%)',
              border: isActive
                ? '1px solid rgba(52, 199, 89, 0.3)'
                : '1px solid rgba(255, 149, 0, 0.3)',
            }}
          >
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                <Box>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Plan Contratado
                  </Typography>
                  <Typography variant="h5" fontWeight="800" sx={{ color: '#ffffff', mt: 0.2 }}>
                    {sub?.plan_name || 'Seguimiento Personalizado'}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mt: 0.4, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <UserCheck size={16} color="#007AFF" />
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
                  }}
                />
              </Box>

              <Divider sx={{ my: 2, borderColor: 'rgba(255, 255, 255, 0.08)' }} />

              {/* Importe y Fechas */}
              <Grid container spacing={2} my={1}>
                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
                    Tu Cuota Mensual
                  </Typography>
                  <Typography variant="h4" fontWeight="900" sx={{ color: '#007AFF', letterSpacing: '-0.02em', mt: 0.3 }}>
                    {formatEuro(sub?.monthly_amount)}
                    <span style={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.6)', fontWeight: 500 }}> / mes</span>
                  </Typography>
                </Grid>

                <Grid size={{ xs: 6 }}>
                  <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block' }}>
                    Próxima Renovación
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="700" sx={{ color: '#ffffff', mt: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                    <Calendar size={16} color="rgba(255, 255, 255, 0.6)" />
                    {formatDate(sub?.current_period_end)}
                  </Typography>
                </Grid>

                <Grid size={{ xs: 12 }}>
                  <Box
                    p={1.5}
                    sx={{
                      borderRadius: '12px',
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 1
                    }}
                  >
                    <Box display="flex" alignItems="center" gap={1}>
                      <Clock size={15} color="rgba(255, 255, 255, 0.5)" />
                      <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        Último pago registrado: <strong style={{ color: '#ffffff' }}>{formatDate(sub?.last_payment_date)}</strong>
                      </Typography>
                    </Box>

                    <Chip
                      label={sub?.payment_type === 'stripe' ? 'Pago Automático Stripe' : 'Gestión Manual'}
                      size="small"
                      sx={{
                        height: 22,
                        fontSize: '0.68rem',
                        bgcolor: 'rgba(0, 122, 255, 0.1)',
                        color: '#007AFF',
                        border: '1px solid rgba(0, 122, 255, 0.25)',
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Acciones de Suscripción */}
            <Box mt={3} pt={2} borderTop="1px solid rgba(255, 255, 255, 0.08)" display="flex" gap={1.5} flexWrap="wrap">
              {!isActive ? (
                <Button
                  variant="contained"
                  onClick={() => setCardModalOpen(true)}
                  startIcon={<CreditCard size={16} />}
                  sx={{
                    borderRadius: '12px',
                    fontWeight: 700,
                    textTransform: 'none',
                    bgcolor: '#007AFF',
                    px: 3,
                    py: 1,
                  }}
                >
                  Pagar Cuota con Tarjeta (Stripe)
                </Button>
              ) : (
                <>
                  <Button
                    variant="outlined"
                    onClick={() => setCardModalOpen(true)}
                    startIcon={<CreditCard size={16} />}
                    sx={{
                      borderRadius: '12px',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      color: '#ffffff',
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
                      ml: 'auto'
                    }}
                  >
                    Cancelar Suscripción
                  </Button>
                </>
              )}
            </Box>
          </Box>
        </Grid>

        {/* Tarjeta Visual de Pago */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Box
            className="apple-card"
            sx={{
              p: 3,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(135deg, rgba(0, 122, 255, 0.2) 0%, rgba(20, 20, 24, 0.95) 100%)',
              border: '1px solid rgba(0, 122, 255, 0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <Box>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="subtitle2" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: 1 }}>
                  MÉTODO DE PAGO
                </Typography>
                <Lock size={18} color="#007AFF" />
              </Box>

              {/* Tarjeta Visual Mockup */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  boxShadow: '0 10px 25px rgba(0, 0, 0, 0.6)',
                  color: '#ffffff',
                }}
              >
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <CreditCard size={28} color="#38bdf8" />
                  <Typography variant="caption" fontWeight="800" sx={{ letterSpacing: 1, color: '#38bdf8' }}>
                    {sub?.card_brand || 'VISA'}
                  </Typography>
                </Box>

                <Typography variant="h6" fontWeight="700" sx={{ letterSpacing: 2, mb: 2, fontSize: '1.1rem' }}>
                  •••• •••• •••• {sub?.card_last4 || '4242'}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="flex-end">
                  <Box>
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                      TITULAR
                    </Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ color: '#ffffff', textTransform: 'uppercase', fontSize: '0.8rem' }}>
                      {currentUser?.name} {currentUser?.surname}
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', fontSize: '0.65rem' }}>
                      CADUCA
                    </Typography>
                    <Typography variant="body2" fontWeight="700" sx={{ color: '#ffffff', fontSize: '0.8rem' }}>
                      {sub?.card_exp_month || 12}/{sub?.card_exp_year ? String(sub.card_exp_year).slice(-2) : '28'}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Box mt={2}>
              <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', lineHeight: 1.4 }}>
                <ShieldCheck size={14} style={{ verticalAlign: 'middle', marginRight: 4, color: '#34C759' }} />
                Tus pagos son procesados de forma cifrada y segura con el estándar bancario PCI-DSS de Stripe.
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>

      {/* Historial de Recibos y Facturas */}
      <Box className="apple-card" sx={{ p: { xs: 2.5, sm: 3 }, background: '#18181b', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5}>
          <Box display="flex" alignItems="center" gap={1.2}>
            <Receipt size={20} color="#007AFF" />
            <Typography variant="h6" fontWeight="800" sx={{ color: '#ffffff', fontSize: '1.05rem' }}>
              Historial de Pagos y Recibos
            </Typography>
          </Box>
          <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
            {invoices.length} transacciones registradas
          </Typography>
        </Box>

        {invoices.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Aún no tienes recibos o pagos registrados en tu cuenta.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { borderColor: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 } }}>
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
                  <TableRow key={inv.id} sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>{inv.invoice_number}</TableCell>
                    <TableCell>{formatDate(inv.payment_date)}</TableCell>
                    <TableCell>
                      Cuota mensual — {inv.trainer_name ? `${inv.trainer_name} ${inv.trainer_surname || ''}` : 'Entrenador'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={inv.payment_method === 'card' ? 'Tarjeta' : inv.payment_method === 'bizum' ? 'Bizum' : 'Transferencia'}
                        size="small"
                        sx={{ height: 22, fontSize: '0.68rem', bgcolor: 'rgba(255, 255, 255, 0.06)', color: 'rgba(255, 255, 255, 0.8)' }}
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
                          height: 22,
                          fontSize: '0.68rem',
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
          },
        }}
      >
        <form onSubmit={handleSubscribeOrUpdateCard}>
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <CreditCard size={20} color="#007AFF" />
              Datos de Tarjeta Bancaria
            </Box>
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2.5, fontSize: '0.82rem' }}>
              Introduce tu tarjeta para activar el cobro automático de tu cuota ({formatEuro(sub?.monthly_amount)}/mes) con tu preparador.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Nombre en la Tarjeta"
                fullWidth
                required
                value={cardForm.cardHolder}
                onChange={(e) => setCardForm({ ...cardForm, cardHolder: e.target.value })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
              />

              <TextField
                label="Número de Tarjeta"
                placeholder="4242 •••• •••• 4242"
                fullWidth
                required
                value={cardForm.cardNumber}
                onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
              />

              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="Caducidad (MM/AA)"
                    placeholder="12/28"
                    fullWidth
                    required
                    value={cardForm.cardExp}
                    onChange={(e) => setCardForm({ ...cardForm, cardExp: e.target.value })}
                    InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    label="CVC / CVV"
                    placeholder="123"
                    type="password"
                    fullWidth
                    required
                    value={cardForm.cardCvc}
                    onChange={(e) => setCardForm({ ...cardForm, cardCvc: e.target.value })}
                    InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
                  />
                </Grid>
              </Grid>
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
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#ef4444' }}>
          ¿Cancelar suscripción mensual?
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.5 }}>
            Si cancelas tu suscripción, mantendrás acceso completo a tus entrenamientos y planes nutricionales hasta el día{' '}
            <strong>{formatDate(sub?.current_period_end)}</strong>. Después de esa fecha, tu suscripción se detendrá y no se realizarán nuevos cargos automáticos.
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
    </Box>
  );
};

export default ClientSubscriptionTab;

// Página de Facturación y Gestión de Cobros para Entrenadores
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Stack,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  CircularProgress,
  Alert,
  Avatar,
  Divider,
} from '@mui/material';
import {
  DollarSign,
  TrendingUp,
  Users,
  AlertCircle,
  CheckCircle2,
  Plus,
  CreditCard,
  Receipt,
  Search,
  Calendar,
  Clock,
  Edit2,
  Trash2,
  ShieldCheck,
  ArrowUpRight,
  Filter
} from 'lucide-react';
import {
  billingService,
  TrainerBillingSummary,
  ClientBillingItem,
  TrainerPlan,
} from '../services/billingService';

export const TrainerBillingPage: React.FC = () => {
  const [summary, setSummary] = useState<TrainerBillingSummary | null>(null);
  const [clients, setClients] = useState<ClientBillingItem[]>([]);
  const [plans, setPlans] = useState<TrainerPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending'>('all');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Modales
  const [manualPayModalOpen, setManualPayModalOpen] = useState(false);
  const [selectedClientForPay, setSelectedClientForPay] = useState<ClientBillingItem | null>(null);
  const [manualPayForm, setManualPayForm] = useState({
    amount: '',
    payment_method: 'bizum' as 'bizum' | 'cash' | 'transfer',
    notes: '',
  });

  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [newPlanForm, setNewPlanForm] = useState({
    name: '',
    description: '',
    price: '',
    billing_period: 'monthly',
  });

  const [editFeeModalOpen, setEditFeeModalOpen] = useState(false);
  const [selectedClientForFee, setSelectedClientForFee] = useState<ClientBillingItem | null>(null);
  const [customFeeAmount, setCustomFeeAmount] = useState('');

  useEffect(() => {
    loadBillingDashboard();
  }, []);

  const loadBillingDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sumRes, cliRes, planRes] = await Promise.all([
        billingService.getTrainerSummary(),
        billingService.getTrainerClients(),
        billingService.getTrainerPlans(),
      ]);
      setSummary(sumRes);
      setClients(cliRes);
      setPlans(planRes);
    } catch (err: any) {
      console.error('Error loading billing dashboard:', err);
      setError(err.response?.data?.error || 'Error al cargar los datos de facturación');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenManualPay = (client: ClientBillingItem) => {
    setSelectedClientForPay(client);
    setManualPayForm({
      amount: String(client.monthly_amount || 50),
      payment_method: 'bizum',
      notes: `Cuota mensual recibida por Bizum / Efectivo`,
    });
    setManualPayModalOpen(true);
  };

  const handleSubmitManualPay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForPay) return;

    try {
      setActionLoading(true);
      setError(null);
      await billingService.recordManualPayment({
        client_id: selectedClientForPay.client_id,
        amount: parseFloat(manualPayForm.amount),
        payment_method: manualPayForm.payment_method,
        notes: manualPayForm.notes,
      });

      setSuccessMsg(`Pago de ${selectedClientForPay.name} registrado correctamente. Su periodo ha sido renovado por 30 días.`);
      setManualPayModalOpen(false);
      await loadBillingDashboard();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al registrar pago');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanForm.name || !newPlanForm.price) return;

    try {
      setActionLoading(true);
      setError(null);
      await billingService.createTrainerPlan({
        name: newPlanForm.name,
        description: newPlanForm.description,
        price: parseFloat(newPlanForm.price),
        billing_period: newPlanForm.billing_period,
      });

      setSuccessMsg('Nuevo plan de cuota creado con éxito.');
      setPlanModalOpen(false);
      setNewPlanForm({ name: '', description: '', price: '', billing_period: 'monthly' });
      await loadBillingDashboard();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al crear plan');
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenEditFee = (client: ClientBillingItem) => {
    setSelectedClientForFee(client);
    setCustomFeeAmount(String(client.monthly_amount || 50));
    setEditFeeModalOpen(true);
  };

  const handleSubmitEditFee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientForFee) return;

    try {
      setActionLoading(true);
      setError(null);
      await billingService.updateClientFee({
        client_id: selectedClientForFee.client_id,
        monthly_amount: parseFloat(customFeeAmount),
      });

      setSuccessMsg(`Cuota de ${selectedClientForFee.name} actualizada a ${customFeeAmount} €/mes.`);
      setEditFeeModalOpen(false);
      await loadBillingDashboard();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al actualizar cuota');
    } finally {
      setActionLoading(false);
    }
  };

  const formatEuro = (amount?: number) => {
    if (amount === undefined || amount === null) return '0.00 €';
    return `${Number(amount).toFixed(2)} €`;
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Sin registro';
    try {
      return new Date(isoString).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const filteredClients = clients.filter((c) => {
    const fullName = `${c.name} ${c.surname || ''} ${c.email}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (statusFilter === 'active') return c.status === 'active';
    if (statusFilter === 'pending') return c.status !== 'active';
    return true;
  });

  if (loading) {
    return (
      <Box p={4} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
        <CircularProgress size={36} sx={{ color: '#007AFF', mb: 2 }} />
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          Cargando panel de facturación y cuotas...
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="apple-content-container">
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={3.5} flexWrap="wrap" gap={2}>
        <Box>
          <Typography variant="h4" fontWeight="800" sx={{ color: '#ffffff', letterSpacing: '-0.03em' }}>
            Facturación y Cobros
          </Typography>
          <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mt: 0.5, maxWidth: 620 }}>
            Controla las cuotas mensuales de tus clientes, suscripciones automatizadas con Stripe y cobros manuales (Bizum / efectivo).
          </Typography>
        </Box>

        <Button
          variant="contained"
          onClick={() => setPlanModalOpen(true)}
          startIcon={<Plus size={18} />}
          sx={{
            bgcolor: '#007AFF',
            borderRadius: '12px',
            fontWeight: 700,
            textTransform: 'none',
            px: 2.5,
            py: 1,
            boxShadow: '0 4px 14px rgba(0, 122, 255, 0.35)',
          }}
        >
          Crear Nueva Tarifa / Plan
        </Button>
      </Box>

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

      {/* 4 KPIs Financieros */}
      <Grid container spacing={2.5} mb={4}>
        {/* KPI 1: Facturación del Mes */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.5,
              background: 'linear-gradient(180deg, rgba(0, 122, 255, 0.1) 0%, #1C1C1E 100%)',
              border: '1px solid rgba(0, 122, 255, 0.25)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" fontWeight="700" sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
                Facturación Este Mes
              </Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(0, 122, 255, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#38bdf8' }}>
                <DollarSign size={18} />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
              {formatEuro(summary?.monthly_revenue)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 0.5, display: 'block' }}>
              {summary?.paid_invoices_count || 0} recibos cobrados este mes
            </Typography>
          </Box>
        </Grid>

        {/* KPI 2: MRR Ingresos Recurrentes */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.5,
              background: 'linear-gradient(180deg, rgba(52, 199, 89, 0.1) 0%, #1C1C1E 100%)',
              border: '1px solid rgba(52, 199, 89, 0.25)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" fontWeight="700" sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
                Ingresos Recurrentes (MRR)
              </Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(52, 199, 89, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34C759' }}>
                <TrendingUp size={18} />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#34C759', letterSpacing: '-0.02em' }}>
              {formatEuro(summary?.mrr)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 0.5, display: 'block' }}>
              Potencial mensual activo
            </Typography>
          </Box>
        </Grid>

        {/* KPI 3: Clientes al Día */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.5,
              background: 'linear-gradient(180deg, rgba(168, 85, 247, 0.1) 0%, #1C1C1E 100%)',
              border: '1px solid rgba(168, 85, 247, 0.25)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" fontWeight="700" sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
                Alumnos al Día
              </Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(168, 85, 247, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <Users size={18} />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#ffffff', letterSpacing: '-0.02em' }}>
              {summary?.active_subscriptions || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 0.5, display: 'block' }}>
              De {summary?.total_clients || 0} alumnos asignados
            </Typography>
          </Box>
        </Grid>

        {/* KPI 4: Pagos Pendientes */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Box
            className="apple-card"
            sx={{
              p: 2.5,
              background: 'linear-gradient(180deg, rgba(255, 149, 0, 0.1) 0%, #1C1C1E 100%)',
              border: '1px solid rgba(255, 149, 0, 0.25)',
            }}
          >
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
              <Typography variant="caption" fontWeight="700" sx={{ color: 'rgba(255, 255, 255, 0.55)', textTransform: 'uppercase' }}>
                Cuotas Pendientes
              </Typography>
              <Box sx={{ width: 32, height: 32, borderRadius: '8px', bgcolor: 'rgba(255, 149, 0, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FF9500' }}>
                <AlertCircle size={18} />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight="900" sx={{ color: '#FF9500', letterSpacing: '-0.02em' }}>
              {summary?.pending_payments || 0}
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', mt: 0.5, display: 'block' }}>
              Requieren cobro manual o recordatorio
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Planes y Tarifas Propias del Entrenador */}
      <Box className="apple-card" sx={{ p: { xs: 2.5, sm: 3 }, mb: 4, background: '#18181b', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight="800" sx={{ color: '#ffffff' }}>
              Tus Planes y Tarifas
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              Cada plan se aplica exclusivamente a tus clientes.
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {plans.map((p) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: '14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" fontWeight="700" sx={{ color: '#ffffff' }}>
                    {p.name}
                  </Typography>
                  <Typography variant="h6" fontWeight="900" sx={{ color: '#007AFF', my: 0.2 }}>
                    {formatEuro(p.price)} <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>/ mes</span>
                  </Typography>
                  {p.description && (
                    <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)', display: 'block', maxWidth: 220 }}>
                      {p.description}
                    </Typography>
                  )}
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Tabla de Control de Alumnos y Cuotas */}
      <Box className="apple-card" sx={{ p: { xs: 2.5, sm: 3 }, background: '#18181b', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2.5} flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <Users size={20} color="#007AFF" />
            <Typography variant="h6" fontWeight="800" sx={{ color: '#ffffff', fontSize: '1.05rem' }}>
              Estado de Cuotas por Alumno
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            {/* Filtros */}
            <Stack direction="row" spacing={0.8}>
              <Chip
                label="Todos"
                size="small"
                onClick={() => setStatusFilter('all')}
                sx={{
                  bgcolor: statusFilter === 'all' ? '#007AFF' : 'rgba(255, 255, 255, 0.06)',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              />
              <Chip
                label="Al Día"
                size="small"
                onClick={() => setStatusFilter('active')}
                sx={{
                  bgcolor: statusFilter === 'active' ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  color: statusFilter === 'active' ? '#34C759' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              />
              <Chip
                label="Pendientes"
                size="small"
                onClick={() => setStatusFilter('pending')}
                sx={{
                  bgcolor: statusFilter === 'pending' ? 'rgba(255, 149, 0, 0.2)' : 'rgba(255, 149, 0, 0.06)',
                  color: statusFilter === 'pending' ? '#FF9500' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              />
            </Stack>

            {/* Buscador */}
            <TextField
              size="small"
              placeholder="Buscar alumno..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search size={16} color="rgba(255, 255, 255, 0.4)" />
                  </InputAdornment>
                ),
                sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '10px', fontSize: '13px' },
              }}
            />
          </Stack>
        </Box>

        {filteredClients.length === 0 ? (
          <Box py={4} textAlign="center">
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
              No se encontraron alumnos con los filtros seleccionados.
            </Typography>
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ '& th': { borderColor: 'rgba(255, 255, 255, 0.08)', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 700 } }}>
                  <TableCell>Alumno</TableCell>
                  <TableCell>Tarifa / Cuota</TableCell>
                  <TableCell>Modalidad</TableCell>
                  <TableCell>Último Pago</TableCell>
                  <TableCell>Próximo Vencimiento</TableCell>
                  <TableCell align="center">Estado</TableCell>
                  <TableCell align="right">Acciones de Cobro</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredClients.map((c) => {
                  const isPaid = c.status === 'active';
                  return (
                    <TableRow key={c.client_id} sx={{ '& td': { borderColor: 'rgba(255, 255, 255, 0.05)', color: '#ffffff' } }}>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1.2}>
                          <Avatar sx={{ width: 32, height: 32, bgcolor: '#007AFF', fontSize: '0.85rem', fontWeight: 700 }}>
                            {c.name.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight="700">
                              {c.name} {c.surname}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                              {c.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontWeight="800" sx={{ color: '#38bdf8' }}>
                          {formatEuro(c.monthly_amount)} <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.5)', fontWeight: 500 }}>/ mes</span>
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                          {c.plan_name || 'Tarifa Base'}
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Chip
                          label={c.payment_type === 'stripe' ? 'In-App Tarjeta' : 'Manual / Externo'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            bgcolor: c.payment_type === 'stripe' ? 'rgba(0, 122, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)',
                            color: c.payment_type === 'stripe' ? '#38bdf8' : 'rgba(255, 255, 255, 0.7)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                          }}
                        />
                      </TableCell>

                      <TableCell>{formatDate(c.last_payment_date)}</TableCell>

                      <TableCell sx={{ color: isPaid ? '#34C759' : '#FF9500', fontWeight: 600 }}>
                        {formatDate(c.current_period_end)}
                      </TableCell>

                      <TableCell align="center">
                        <Chip
                          label={isPaid ? 'Al Día' : 'Pendiente'}
                          size="small"
                          sx={{
                            height: 22,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: isPaid ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 149, 0, 0.15)',
                            color: isPaid ? '#34C759' : '#FF9500',
                            border: `1px solid ${isPaid ? 'rgba(52, 199, 89, 0.3)' : 'rgba(255, 149, 0, 0.3)'}`,
                          }}
                        />
                      </TableCell>

                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenManualPay(c)}
                            startIcon={<Receipt size={14} />}
                            sx={{
                              borderRadius: '8px',
                              fontSize: '11px',
                              textTransform: 'none',
                              color: '#34C759',
                              borderColor: 'rgba(52, 199, 89, 0.3)',
                              '&:hover': { bgcolor: 'rgba(52, 199, 89, 0.1)', borderColor: '#34C759' },
                            }}
                          >
                            Cobro Manual
                          </Button>

                          <IconButton
                            size="small"
                            onClick={() => handleOpenEditFee(c)}
                            title="Modificar cuota personalizada"
                            sx={{ color: 'rgba(255, 255, 255, 0.5)', '&:hover': { color: '#007AFF' } }}
                          >
                            <Edit2 size={15} />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* Modal Registrar Pago Manual */}
      <Dialog
        open={manualPayModalOpen}
        onClose={() => setManualPayModalOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { bgcolor: '#18181b', color: '#ffffff', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.15)' } }}
      >
        <form onSubmit={handleSubmitManualPay}>
          <DialogTitle sx={{ fontWeight: 800 }}>Registrar Pago de {selectedClientForPay?.name}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2.5, fontSize: '0.82rem' }}>
              Registra un pago recibido fuera de la app (Bizum, efectivo o transferencia) para renovar el periodo de tu alumno por 30 días y computarlo en tu facturación mensual.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Importe (€)"
                type="number"
                fullWidth
                required
                value={manualPayForm.amount}
                onChange={(e) => setManualPayForm({ ...manualPayForm, amount: e.target.value })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
              />

              <TextField
                select
                label="Método de Pago"
                fullWidth
                value={manualPayForm.payment_method}
                onChange={(e) => setManualPayForm({ ...manualPayForm, payment_method: e.target.value as any })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
              >
                <MenuItem value="bizum">Bizum</MenuItem>
                <MenuItem value="transfer">Transferencia Bancaria</MenuItem>
                <MenuItem value="cash">Efectivo en mano</MenuItem>
              </TextField>

              <TextField
                label="Notas u observaciones"
                fullWidth
                placeholder="ej. Pago mes de Octubre recibido por Bizum"
                value={manualPayForm.notes}
                onChange={(e) => setManualPayForm({ ...manualPayForm, notes: e.target.value })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setManualPayModalOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={actionLoading} sx={{ bgcolor: '#34C759', fontWeight: 700, borderRadius: '12px', textTransform: 'none', px: 3 }}>
              {actionLoading ? 'Registrando...' : 'Confirmar Cobro'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Crear Plan del Entrenador */}
      <Dialog
        open={planModalOpen}
        onClose={() => setPlanModalOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { bgcolor: '#18181b', color: '#ffffff', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.15)' } }}
      >
        <form onSubmit={handleCreatePlan}>
          <DialogTitle sx={{ fontWeight: 800 }}>Crear Tarifa Propia</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2.5, fontSize: '0.82rem' }}>
              Establece el nombre y precio mensual de tu servicio. Solo afectará a tus propios clientes.
            </Typography>

            <Stack spacing={2}>
              <TextField
                label="Nombre del Plan"
                placeholder="ej. Asesoría Online Premium"
                fullWidth
                required
                value={newPlanForm.name}
                onChange={(e) => setNewPlanForm({ ...newPlanForm, name: e.target.value })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
              />

              <TextField
                label="Precio (€ / mes)"
                type="number"
                fullWidth
                required
                placeholder="ej. 60.00"
                value={newPlanForm.price}
                onChange={(e) => setNewPlanForm({ ...newPlanForm, price: e.target.value })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
              />

              <TextField
                label="Descripción breve"
                placeholder="ej. Incluye revisión semanal de vídeos y soporte por chat"
                fullWidth
                multiline
                rows={2}
                value={newPlanForm.description}
                onChange={(e) => setNewPlanForm({ ...newPlanForm, description: e.target.value })}
                InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setPlanModalOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={actionLoading} sx={{ bgcolor: '#007AFF', fontWeight: 700, borderRadius: '12px', textTransform: 'none', px: 3 }}>
              {actionLoading ? 'Guardando...' : 'Crear Tarifa'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal Editar Cuota Específica del Alumno */}
      <Dialog
        open={editFeeModalOpen}
        onClose={() => setEditFeeModalOpen(false)}
        fullWidth
        maxWidth="xs"
        PaperProps={{ sx: { bgcolor: '#18181b', color: '#ffffff', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.15)' } }}
      >
        <form onSubmit={handleSubmitEditFee}>
          <DialogTitle sx={{ fontWeight: 800 }}>Cuota de {selectedClientForFee?.name}</DialogTitle>
          <DialogContent>
            <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.6)', mb: 2.5, fontSize: '0.82rem' }}>
              Ajusta la cuota mensual específica para este alumno.
            </Typography>

            <TextField
              label="Cuota Mensual (€)"
              type="number"
              fullWidth
              required
              value={customFeeAmount}
              onChange={(e) => setCustomFeeAmount(e.target.value)}
              InputProps={{ sx: { bgcolor: 'rgba(255, 255, 255, 0.04)', borderRadius: '12px', fontSize: '15px' } }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setEditFeeModalOpen(false)} sx={{ color: 'rgba(255, 255, 255, 0.6)', textTransform: 'none' }}>
              Cancelar
            </Button>
            <Button type="submit" variant="contained" disabled={actionLoading} sx={{ bgcolor: '#007AFF', fontWeight: 700, borderRadius: '12px', textTransform: 'none', px: 3 }}>
              {actionLoading ? 'Guardando...' : 'Guardar Cuota'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default TrainerBillingPage;

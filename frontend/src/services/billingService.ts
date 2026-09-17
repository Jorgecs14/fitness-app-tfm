import { axiosInstance } from '../lib/axios';

export interface TrainerPlan {
  id: number;
  trainer_id: number;
  name: string;
  description: string;
  price: number;
  billing_period: 'monthly' | 'quarterly' | 'annual';
  is_active: boolean;
  stripe_price_id?: string;
  created_at: string;
}

export interface ClientBillingItem {
  client_id: number;
  name: string;
  surname?: string;
  email: string;
  subscription_id?: number;
  status: 'active' | 'pending_payment' | 'past_due' | 'canceled' | 'paused';
  payment_type: 'stripe' | 'manual';
  monthly_amount: number;
  current_period_start?: string;
  current_period_end?: string;
  last_payment_date?: string;
  card_last4?: string;
  card_brand?: string;
  cancel_at_period_end?: boolean;
  plan_id?: number;
  plan_name?: string;
}

export interface TrainerBillingSummary {
  total_clients: number;
  active_subscriptions: number;
  pending_payments: number;
  monthly_revenue: number;
  mrr: number;
  paid_invoices_count: number;
}

export interface PaymentInvoice {
  id: number;
  subscription_id?: number;
  client_id: number;
  trainer_id: number;
  invoice_number: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  payment_method: 'card' | 'transfer' | 'cash' | 'bizum';
  payment_date: string;
  period_start?: string;
  period_end?: string;
  notes?: string;
  plan_name?: string;
  trainer_name?: string;
  trainer_surname?: string;
}

export interface ClientSubscriptionResponse {
  trainer: {
    id: number;
    name: string;
    email: string;
  };
  subscription: {
    id?: number;
    client_id: number;
    trainer_id: number;
    plan_id?: number;
    status: 'active' | 'pending_payment' | 'past_due' | 'canceled' | 'paused';
    payment_type: 'stripe' | 'manual';
    monthly_amount: number;
    plan_name?: string;
    plan_description?: string;
    current_period_start: string;
    current_period_end: string;
    last_payment_date?: string;
    card_last4?: string;
    card_brand?: string;
    card_exp_month?: number;
    card_exp_year?: number;
    cancel_at_period_end?: boolean;
  } | null;
}

export const billingService = {
  // ==========================================
  // MÉTODOS PARA ENTRENADORES
  // ==========================================
  getTrainerSummary: async (): Promise<TrainerBillingSummary> => {
    const res = await axiosInstance.get('/billing/trainer/summary');
    return res.data;
  },

  getTrainerClients: async (): Promise<ClientBillingItem[]> => {
    const res = await axiosInstance.get('/billing/trainer/clients');
    return res.data;
  },

  getTrainerPlans: async (): Promise<TrainerPlan[]> => {
    const res = await axiosInstance.get('/billing/trainer/plans');
    return res.data;
  },

  createTrainerPlan: async (data: {
    name: string;
    description?: string;
    price: number;
    billing_period?: string;
  }): Promise<TrainerPlan> => {
    const res = await axiosInstance.post('/billing/trainer/plans', data);
    return res.data;
  },

  updateTrainerPlan: async (id: number, data: Partial<TrainerPlan>): Promise<TrainerPlan> => {
    const res = await axiosInstance.put(`/billing/trainer/plans/${id}`, data);
    return res.data;
  },

  deleteTrainerPlan: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/billing/trainer/plans/${id}`);
  },

  recordManualPayment: async (data: {
    client_id: number;
    amount: number;
    payment_method?: 'bizum' | 'cash' | 'transfer';
    notes?: string;
  }): Promise<{ message: string; invoice: PaymentInvoice }> => {
    const res = await axiosInstance.post('/billing/trainer/manual-payment', data);
    return res.data;
  },

  updateClientFee: async (data: {
    client_id: number;
    monthly_amount: number;
    plan_id?: number;
  }): Promise<any> => {
    const res = await axiosInstance.put('/billing/trainer/client-fee', data);
    return res.data;
  },

  // ==========================================
  // MÉTODOS PARA CLIENTES
  // ==========================================
  getClientSubscription: async (): Promise<ClientSubscriptionResponse> => {
    const res = await axiosInstance.get('/billing/client/subscription');
    return res.data;
  },

  subscribeInApp: async (data: {
    card_last4?: string;
    card_brand?: string;
    card_exp_month?: number;
    card_exp_year?: number;
    stripe_payment_token?: string;
  }): Promise<{ message: string; subscription: any }> => {
    const res = await axiosInstance.post('/billing/client/subscribe', data);
    return res.data;
  },

  cancelSubscription: async (): Promise<{ message: string; subscription: any }> => {
    const res = await axiosInstance.post('/billing/client/cancel-subscription');
    return res.data;
  },

  updateCard: async (data: {
    card_last4: string;
    card_brand?: string;
    card_exp_month?: number;
    card_exp_year?: number;
  }): Promise<{ message: string; subscription: any }> => {
    const res = await axiosInstance.post('/billing/client/update-card', data);
    return res.data;
  },

  getClientInvoices: async (): Promise<PaymentInvoice[]> => {
    const res = await axiosInstance.get('/billing/client/invoices');
    return res.data;
  },
};

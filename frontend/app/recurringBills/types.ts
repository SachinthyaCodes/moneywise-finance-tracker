export interface RecurringBill {
    id: number;
    name: string;
    amount: number;
    billingCycle: string;
    startDate: string;
    dueDate: string;
    paymentMethod: string;
    autoPay: boolean;
    userId: number;
    stripeSubscriptionId?: string | null;
    stripePaymentMethodId?: string;
    lastPaymentDate?: string;
    paymentStatus?: 'PENDING' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
}
  
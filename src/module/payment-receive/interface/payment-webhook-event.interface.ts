import { PaymentWebhookEventEnum } from "../enum/payment-webhook-event.enum";

export interface IPaymentWebhookEventData {
  error?: {
    code: string;
    message: string;
    source: string;
  };
  orderItems: {
    reference: string;
    name: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    taxRate: number;
    taxAmount: number;
    netTotalAmount: number;
    grossTotalAmount: number;
  }[];
  amount: {
    amount: number;
    currency: string;
  };
  order: {
    amount: {
      amount: number;
      currency: string;
    };
  };
  paymentId: string;
  chargeId?: string;
  paymentMethod?: string;
  paymentType?: string;
  reservationId?: string;
  merchantNumber?: number;
}

export interface IPaymentWebhookEvent {
  id: string;
  timestamp: string;
  merchantId?: number;
  event: PaymentWebhookEventEnum;
  data: IPaymentWebhookEventData;
}

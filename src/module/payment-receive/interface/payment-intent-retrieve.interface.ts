export interface IPaymentIntentRetrieveDto {
  payment: {
    paymentId: string;
    summary: {
      reservedAmount: number;
      chargedAmount: number;
    };
    paymentDetails: {
      paymentType: string;
      paymentMethod: string;
      cardDetails: {
        maskedPan: string;
        expiryDate: string;
      };
    };
    orderDetails: {
      amount: number;
      currency: string;
      reference: string;
    };
    checkout: {
      url: string;
    };
    created: string;
    charges: {
      chargeId: string;
      amount: number;
      created: string;
      orderItems: {
        reference: string;
        name: string;
        quantity: number;
        unit: string;
        unitPrice: number;
        taxRate: number;
        taxAmount: number;
        grossTotalAmount: number;
        netTotalAmount: number;
      }[];
    }[];
  };
}

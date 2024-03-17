export interface IPaymentIntentCreateDto {
  order: {
    items: {
      reference: string;
      name: string;
      quantity: number;
      unit: string;
      unitPrice: number;
      netTotalAmount: number;
      grossTotalAmount: number;
    }[];
    amount: number;
    currency: string;
    reference: string;
  };
  checkout: {
    integrationType: string;
    returnUrl: string;
    termsUrl: string;
    charge: boolean;
    publicDevice: boolean;
    merchantHandlesConsumerData: boolean;
    appearance: {
      displayOptions: {
        showMerchantName: boolean;
        showOrderSummary: boolean;
      };
      textOptions: {
        completePaymentButtonText: string;
      };
    };
  };
  notifications: {
    webHooks: {
      eventName: string;
      url: string;
      authorization: string;
    }[];
  };
}

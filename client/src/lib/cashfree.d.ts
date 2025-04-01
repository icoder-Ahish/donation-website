interface CashfreePaymentOptions {
  appId: string;
  orderId: string;
  orderAmount: number;
  orderCurrency: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  returnUrl: string;
  notifyUrl: string;
  token: string;
  onSuccess: (data: any) => void;
  onFailure: (data: any) => void;
  components: string[];
}

interface CashfreeSDK {
  new(): {
    initialiseDropin: (container: HTMLElement | null, options: CashfreePaymentOptions) => void;
  }
}

declare global {
  interface Window {
    Cashfree: CashfreeSDK;
  }
}

export {};
export type PayPalMoney = {
  currency_code: string;
  value: string;
};

export type PayPalCapture = {
  id: string;
  status: string;
  amount?: PayPalMoney;
};

export type PayPalPurchaseUnit = {
  amount?: PayPalMoney;
  payments?: {
    captures?: PayPalCapture[];
  };
};

export type PayPalOrder = {
  id: string;
  status: string;
  purchase_units?: PayPalPurchaseUnit[];
};

export type PayPalApiErrorBody = {
  name?: string;
  message?: string;
  details?: { issue?: string; description?: string }[];
};

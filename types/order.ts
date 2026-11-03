export type OrderStatusValue = "PENDING" | "PAID" | "FULFILLED" | "CANCELLED" | "REFUNDED";

export type OrderItemData = {
  id: string;
  name: string;
  color: string;
  size: string;
  priceCents: number;
  quantity: number;
  lineTotalCents: number;
};

export type ShippingAddressSnapshot = {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  postcode: string;
  country: string;
  phone?: string;
};

export type OrderSummaryData = {
  id: string;
  orderNumber: string; // last 8 chars of the id, uppercased — display only, never used for lookups
  status: OrderStatusValue;
  totalCents: number;
  itemCount: number;
  createdAt: string;
};

export type OrderDetailData = OrderSummaryData & {
  items: OrderItemData[];
  subtotalCents: number;
  shippingCents: number;
  taxCents: number;
  discountCents: number;
  shippingAddress: ShippingAddressSnapshot;
};

export type CartItemData = {
  id: string; // CartItem.id — used for quantity/remove actions
  variantId: string;
  productSlug: string;
  productName: string;
  color: string;
  size: string;
  imageUrl: string;
  imageAlt: string;
  priceCents: number;
  quantity: number;
  stock: number;
  lineTotalCents: number;
};

export type CartData = {
  id: string | null; // null when no cart has ever been created for this visitor
  items: CartItemData[];
  itemCount: number; // sum of quantities — what the Navbar badge shows
  couponCode: string | null;
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  taxCents: number;
  totalCents: number;
};

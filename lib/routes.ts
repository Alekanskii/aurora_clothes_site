/**
 * Central route table. Import this instead of hardcoding path strings —
 * when a route moves, this is the only file that needs to change.
 */
export const routes = {
  home: "/",
  shop: "/shop",
  product: (slug: string) => `/product/${slug}`,
  cart: "/cart",
  checkout: "/checkout",
  wishlist: "/wishlist",
  account: "/account",
  accountAddresses: "/account/addresses",
  accountOrders: "/account/orders",
  accountOrder: (id: string) => `/account/orders/${id}`,
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  verifyEmail: "/verify-email",
  about: "/about",
  contact: "/contact",
  admin: "/admin",
  adminProducts: "/admin/products",
  adminProductNew: "/admin/products/new",
  adminProduct: (id: string) => `/admin/products/${id}`,
  adminOrders: "/admin/orders",
  adminOrder: (id: string) => `/admin/orders/${id}`,
} as const;

export type NavLink = {
  label: string;
  href: string;
};

// Primary nav — kept short on purpose (Home/Shop/About/Contact). Anything
// else (Wishlist, Account, Cart) lives in the icon cluster, not here.
export const primaryNavLinks: NavLink[] = [
  { label: "Home", href: routes.home },
  { label: "Shop", href: routes.shop },
  { label: "About", href: routes.about },
  { label: "Contact", href: routes.contact },
];

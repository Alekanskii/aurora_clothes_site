import { prisma } from "@/lib/prisma";

const LOW_STOCK_THRESHOLD = 5;

export type AdminDashboardStats = {
  totalOrders: number;
  totalRevenueCents: number;
  totalProducts: number;
  lowStockVariants: { id: string; productName: string; color: string; size: string; stock: number }[];
  recentOrders: { id: string; orderNumber: string; customerEmail: string; totalCents: number; status: string; createdAt: string }[];
};

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [paidOrders, totalOrders, totalProducts, lowStockVariants, recentOrdersRaw] = await Promise.all([
    prisma.order.findMany({ where: { status: { in: ["PAID", "FULFILLED"] } }, select: { totalCents: true } }),
    prisma.order.count(),
    prisma.product.count(),
    prisma.variant.findMany({
      where: { stock: { lte: LOW_STOCK_THRESHOLD } },
      include: { product: true },
      orderBy: { stock: "asc" },
      take: 10,
    }),
    prisma.order.findMany({
      include: { user: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    totalOrders,
    totalRevenueCents: paidOrders.reduce((sum, o) => sum + o.totalCents, 0),
    totalProducts,
    lowStockVariants: lowStockVariants.map((v) => ({
      id: v.id,
      productName: v.product.name,
      color: v.color,
      size: v.size,
      stock: v.stock,
    })),
    recentOrders: recentOrdersRaw.map((o) => ({
      id: o.id,
      orderNumber: o.id.slice(-8).toUpperCase(),
      customerEmail: o.user.email,
      totalCents: o.totalCents,
      status: o.status,
      createdAt: o.createdAt.toISOString(),
    })),
  };
}

export type AdminProductListItem = {
  id: string;
  slug: string;
  name: string;
  categoryName: string;
  isPublished: boolean;
  totalStock: number;
  variantCount: number;
};

export async function getAllProductsAdmin(): Promise<AdminProductListItem[]> {
  const products = await prisma.product.findMany({
    include: { category: true, variants: true },
    orderBy: { createdAt: "desc" },
  });

  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    categoryName: p.category.name,
    isPublished: p.isPublished,
    totalStock: p.variants.reduce((sum, v) => sum + v.stock, 0),
    variantCount: p.variants.length,
  }));
}

export type AdminVariant = {
  id: string;
  color: string;
  size: string;
  sku: string;
  priceCents: number;
  stock: number;
};

export type AdminImage = {
  id: string;
  url: string;
  alt: string;
  position: number;
};

export type AdminProductDetail = {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  isPublished: boolean;
  variants: AdminVariant[];
  images: AdminImage[];
};

export async function getAdminProductById(id: string): Promise<AdminProductDetail | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      variants: { orderBy: [{ color: "asc" }, { size: "asc" }] },
      images: { orderBy: { position: "asc" } },
    },
  });
  if (!product) return null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    categoryId: product.categoryId,
    isPublished: product.isPublished,
    images: product.images.map((img) => ({
      id: img.id,
      url: img.url,
      alt: img.alt,
      position: img.position,
    })),
    variants: product.variants.map((v) => ({
      id: v.id,
      color: v.color,
      size: v.size,
      sku: v.sku,
      priceCents: v.priceCents,
      stock: v.stock,
    })),
  };
}

export async function getAllCategoriesAdmin() {
  return prisma.category.findMany({ orderBy: { name: "asc" } });
}

export type AdminOrderListItem = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  status: string;
  totalCents: number;
  itemCount: number;
  createdAt: string;
};

const VALID_ORDER_STATUSES = ["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"] as const;
type OrderStatusFilter = (typeof VALID_ORDER_STATUSES)[number];

function isValidOrderStatus(value: string): value is OrderStatusFilter {
  return (VALID_ORDER_STATUSES as readonly string[]).includes(value);
}

export async function getAllOrdersAdmin(statusFilter?: string): Promise<AdminOrderListItem[]> {
  const validStatus = statusFilter && isValidOrderStatus(statusFilter) ? statusFilter : undefined;
  const orders = await prisma.order.findMany({
    where: validStatus ? { status: validStatus } : undefined,
    include: { user: true, items: true },
    orderBy: { createdAt: "desc" },
  });

  return orders.map((o) => ({
    id: o.id,
    orderNumber: o.id.slice(-8).toUpperCase(),
    customerEmail: o.user.email,
    status: o.status,
    totalCents: o.totalCents,
    itemCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
    createdAt: o.createdAt.toISOString(),
  }));
}

export async function getAdminOrderById(id: string) {
  // Not scoped by userId here (unlike getOrderForUser) — an admin is
  // expected to view any customer's order. Access to this function at all
  // is gated by requireAdmin() in the calling page/action, not by a
  // per-row ownership check like the customer-facing equivalent.
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, user: true },
  });
  if (!order) return null;

  return {
    id: order.id,
    orderNumber: order.id.slice(-8).toUpperCase(),
    status: order.status,
    customerEmail: order.user.email,
    customerName: order.user.name,
    totalCents: order.totalCents,
    subtotalCents: order.subtotalCents,
    shippingCents: order.shippingCents,
    taxCents: order.taxCents,
    discountCents: order.discountCents,
    shippingAddress: order.shippingAddress as unknown as {
      fullName: string;
      line1: string;
      line2?: string;
      city: string;
      postcode: string;
      country: string;
    },
    stripePaymentIntentId: order.stripePaymentIntentId,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map((i) => ({
      id: i.id,
      name: i.nameSnapshot,
      color: i.colorSnapshot,
      size: i.sizeSnapshot,
      priceCents: i.priceCentsSnapshot,
      quantity: i.quantity,
    })),
  };
}

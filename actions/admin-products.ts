"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/require-admin";
import { productFormSchema, variantFormSchema, type ProductFormInput, type VariantFormInput } from "@/lib/validation/admin";
import { isCloudinaryConfigured, uploadProductImage, deleteCloudinaryImage } from "@/lib/cloudinary";
import { detectImageType } from "@/lib/file-validation";

type ActionResult = { success: true } | { success: false; error: string };
type ActionResultWithId = { success: true; id: string } | { success: false; error: string };

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function createProductAction(input: ProductFormInput): Promise<ActionResultWithId> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Admin access required." };

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (existing) {
    return { success: false, error: "A product with that slug already exists." };
  }

  const product = await prisma.product.create({ data: parsed.data });

  await prisma.auditLog.create({
    data: { actorId: admin.user.id, action: "product.create", targetId: product.id },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true, id: product.id };
}

export async function updateProductAction(productId: string, input: ProductFormInput): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Admin access required." };

  const parsed = productFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const conflict = await prisma.product.findFirst({
    where: { slug: parsed.data.slug, id: { not: productId } },
  });
  if (conflict) {
    return { success: false, error: "Another product already uses that slug." };
  }

  await prisma.product.update({ where: { id: productId }, data: parsed.data });

  await prisma.auditLog.create({
    data: { actorId: admin.user.id, action: "product.update", targetId: productId },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  revalidatePath(`/product/${parsed.data.slug}`);
  return { success: true };
}

/**
 * Products aren't hard-deleted — `OrderItem` references `Variant`, which
 * references `Product`; deleting a product that's ever been ordered would
 * either cascade-delete real order history or require a schema change to
 * prevent it. Unpublishing is the safe, reversible equivalent: it
 * disappears from the storefront without touching anything historical.
 */
export async function toggleProductPublishedAction(productId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Admin access required." };

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { success: false, error: "Product not found." };

  await prisma.product.update({
    where: { id: productId },
    data: { isPublished: !product.isPublished },
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.user.id,
      action: product.isPublished ? "product.unpublish" : "product.publish",
      targetId: productId,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath("/shop");
  return { success: true };
}

export async function createVariantAction(productId: string, input: VariantFormInput): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Admin access required." };

  const parsed = variantFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const existing = await prisma.variant.findFirst({
    where: { productId, color: parsed.data.color, size: parsed.data.size },
  });
  if (existing) {
    return { success: false, error: "A variant with that color/size already exists for this product." };
  }

  const sku = `${productId}-${parsed.data.color}-${parsed.data.size}`.toLowerCase().replace(/\s+/g, "-");
  await prisma.variant.create({ data: { productId, sku, ...parsed.data } });

  await prisma.auditLog.create({
    data: { actorId: admin.user.id, action: "variant.create", targetId: productId },
  });

  revalidatePath(`/admin/products/${productId}`);
  return { success: true };
}

export async function updateVariantAction(variantId: string, input: VariantFormInput): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Admin access required." };

  const parsed = variantFormSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const variant = await prisma.variant.update({
    where: { id: variantId },
    data: { priceCents: parsed.data.priceCents, stock: parsed.data.stock },
  });

  await prisma.auditLog.create({
    data: { actorId: admin.user.id, action: "variant.update", targetId: variantId },
  });

  revalidatePath(`/admin/products/${variant.productId}`);
  revalidatePath("/shop");
  return { success: true };
}

export async function uploadProductImageAction(
  productId: string,
  formData: FormData
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Admin access required." };

  if (!isCloudinaryConfigured) {
    return {
      success: false,
      error:
        "Cloudinary isn't configured in this environment — add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to .env to enable real photo uploads.",
    };
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file was provided." };
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return { success: false, error: "Image must be 5MB or smaller." };
  }
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return { success: false, error: "Only JPEG, PNG, and WEBP images are allowed." };
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // The real check: what the file's actual bytes say it is, not what the
  // browser claimed in `file.type` above (which is easy to spoof by
  // just renaming a file before selecting it).
  const detectedType = detectImageType(buffer);
  if (!detectedType || !ALLOWED_IMAGE_TYPES.has(detectedType)) {
    return { success: false, error: "This file doesn't look like a valid JPEG, PNG, or WEBP image." };
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return { success: false, error: "Product not found." };

  const { url } = await uploadProductImage(buffer, detectedType, productId);

  const maxPosition = await prisma.productImage.aggregate({
    where: { productId },
    _max: { position: true },
  });

  await prisma.productImage.create({
    data: {
      productId,
      url,
      alt: product.name,
      position: (maxPosition._max.position ?? -1) + 1,
    },
  });

  await prisma.auditLog.create({
    data: { actorId: admin.user.id, action: "product.image_upload", targetId: productId },
  });

  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/shop");
  revalidatePath(`/product/${product.slug}`);
  return { success: true };
}

export async function deleteProductImageAction(imageId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { success: false, error: "Admin access required." };

  const image = await prisma.productImage.findUnique({
    where: { id: imageId },
    include: { product: true },
  });
  if (!image) return { success: false, error: "Image not found." };

  // Best-effort: if this fails (Cloudinary down, not configured, etc.),
  // the local record is still removed rather than leaving the admin
  // stuck unable to remove a broken/unwanted image from the product.
  if (isCloudinaryConfigured) {
    await deleteCloudinaryImage(image.url).catch((err) => {
      console.error("Cloudinary delete failed (continuing anyway):", err);
    });
  }

  await prisma.productImage.delete({ where: { id: imageId } });

  await prisma.auditLog.create({
    data: { actorId: admin.user.id, action: "product.image_delete", targetId: image.productId },
  });

  revalidatePath(`/admin/products/${image.productId}`);
  revalidatePath("/shop");
  revalidatePath(`/product/${image.product.slug}`);
  return { success: true };
}

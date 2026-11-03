import { z } from "zod";

export const productFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(200)
    .regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().trim().min(1, "Description is required").max(2000),
  categoryId: z.string().trim().min(1, "Category is required"),
  isPublished: z.boolean().default(true),
});
export type ProductFormInput = z.infer<typeof productFormSchema>;

export const variantFormSchema = z.object({
  color: z.string().trim().min(1, "Color is required").max(50),
  size: z.string().trim().min(1, "Size is required").max(20),
  priceCents: z.coerce.number().int().positive("Price must be a positive number of cents"),
  stock: z.coerce.number().int().min(0, "Stock can't be negative"),
});
export type VariantFormInput = z.infer<typeof variantFormSchema>;

export const orderStatusSchema = z.enum(["PENDING", "PAID", "FULFILLED", "CANCELLED", "REFUNDED"]);

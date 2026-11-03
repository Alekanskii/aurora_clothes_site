import { z } from "zod";

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  line1: z.string().trim().min(1, "Address is required").max(200),
  line2: z.string().trim().max(200).optional().or(z.literal("")),
  city: z.string().trim().min(1, "City is required").max(100),
  postcode: z.string().trim().min(1, "Postal code is required").max(20),
  country: z.string().trim().min(1, "Country is required").max(100),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  saveAddress: z.boolean().default(false),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

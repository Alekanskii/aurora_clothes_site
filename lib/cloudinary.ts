import { v2 as cloudinary } from "cloudinary";

export const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET
);

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export { cloudinary };

/**
 * Uploads a single file buffer to Cloudinary under a per-product folder.
 * Cloudinary's Node SDK doesn't accept a raw Buffer directly for `upload`
 * (it wants a path or data URI) — the simplest reliable way from a
 * Server Action, which already has the file in memory, is a base64 data
 * URI rather than writing a temp file to disk.
 */
export async function uploadProductImage(
  buffer: Buffer,
  mimeType: string,
  productId: string
): Promise<{ url: string }> {
  const dataUri = `data:${mimeType};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: `aurora/products/${productId}`,
    resource_type: "image",
  });
  return { url: result.secure_url };
}

export async function deleteCloudinaryImage(url: string): Promise<void> {
  // Cloudinary deletes by public_id, not URL — derive it from the URL
  // path rather than storing a separate column just for this, since the
  // URL already fully determines it (everything between the upload
  // version segment and the file extension).
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
  const publicId = match?.[1];
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

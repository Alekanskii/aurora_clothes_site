const SIGNATURES: { mime: string; bytes: number[] }[] = [
  { mime: "image/jpeg", bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] },
  // WEBP: "RIFF" at byte 0, "WEBP" at byte 8 — checked separately below
  // since it isn't one contiguous run of bytes.
];

/**
 * Detects the real image type from its actual byte content, not the
 * browser-supplied `file.type` (which is just a claim — trivially
 * spoofed by renaming a file). Returns null if the content doesn't match
 * any known image signature, regardless of what it claims to be.
 */
export function detectImageType(buffer: Buffer): string | null {
  for (const sig of SIGNATURES) {
    if (sig.bytes.every((byte, i) => buffer[i] === byte)) return sig.mime;
  }
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "image/webp";
  }
  return null;
}

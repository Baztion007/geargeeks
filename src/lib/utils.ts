import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Prefix a local asset path with the configured base path.
 * Use this for any image/asset URL that starts with "/".
 * In dev: returns the path as-is.
 * With NEXT_PUBLIC_BASE_PATH set: prepends the base path.
 *
 * @example assetUrl('/images/photo.jpg') → '/geargeekz/images/photo.jpg' (if base path is /geargeekz)
 */
export function assetUrl(path: string): string {
  if (!path.startsWith('/')) return path; // already relative or external
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return `${base}${path}`;
}

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getImagePath(imagePath?: string | null): string {
  if (!imagePath) return '/products/placeholder.png'
  if (imagePath.startsWith('/')) return imagePath
  return `/products/${imagePath}`
}

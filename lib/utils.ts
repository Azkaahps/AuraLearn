/**
 * lib/utils.ts
 * Utility functions untuk styling — dibutuhkan oleh semua Shadcn UI components.
 * Auto-generated saat shadcn init, direkonstruksi manual karena file hilang.
 */
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

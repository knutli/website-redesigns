import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNOK(amountMinor: number): string {
  return new Intl.NumberFormat("nb-NO", {
    style: "currency",
    currency: "NOK",
    maximumFractionDigits: 0,
  }).format(amountMinor / 100);
}

export function bidIncrement(currentPriceMinor: number): number {
  const kr = currentPriceMinor / 100;
  if (kr < 500) return 25_00;
  if (kr < 2000) return 50_00;
  return 100_00;
}

export function minNextBid(currentPriceMinor: number): number {
  return currentPriceMinor + bidIncrement(currentPriceMinor);
}

export const PLATFORM_FEE_BPS = 800; // 8%

export function platformFee(grossMinor: number): number {
  return Math.round((grossMinor * PLATFORM_FEE_BPS) / 10_000);
}

export function sellerNet(grossMinor: number): number {
  return grossMinor - platformFee(grossMinor);
}

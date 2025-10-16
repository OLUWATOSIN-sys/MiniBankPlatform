import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined, currency: string): string {
  const symbol = currency === 'USD' ? '$' : '€';
  const numAmount = typeof amount === 'number' ? amount : parseFloat(String(amount || 0));
  return `${symbol}${numAmount.toFixed(2)}`;
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getTransactionSign(isDebit: boolean): string {
  return isDebit ? '-' : '+';
}

export function getTransactionColor(isDebit: boolean): string {
  return isDebit ? 'text-red-600' : 'text-green-600';
}

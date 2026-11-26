import { CurrencyCode } from './motorcycles';

export interface ShowroomSettings {
  whatsappNumber: string;
  showroomAddress: string;
  defaultCurrency: CurrencyCode;
  exchangeRateNGN: number;
  financingInterestRate: number;
  defaultDownPaymentPercent: number;
  adminPin: string;
}

export const DEFAULT_SHOWROOM_SETTINGS: ShowroomSettings = {
  whatsappNumber: '2348000000000',
  showroomAddress: 'Benin City Flagship, Edo State · Lagos & Abuja',
  defaultCurrency: 'NGN',
  exchangeRateNGN: 1520,
  financingInterestRate: 6.5,
  defaultDownPaymentPercent: 30,
  adminPin: '1234',
};

export type AdminOrderStatus =
  | 'Pending'
  | 'Confirmed'
  | 'Ready for Pickup'
  | 'Dispatched'
  | 'Delivered';

export type AdminTestRideStatus = 'Scheduled' | 'Completed' | 'Cancelled';

export type AdminLeadStatus = 'New Lead' | 'Contacted' | 'Inspected' | 'Closed';

export function sanitizeWhatsappNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (!digits) return '2348000000000';
  if (digits.startsWith('0') && digits.length === 11) {
    return `234${digits.slice(1)}`;
  }
  return digits;
}

export function formatWhatsappHref(phone: string, message: string): string {
  const cleanPhone = sanitizeWhatsappNumber(phone);
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

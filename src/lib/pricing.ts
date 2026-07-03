export const SERVICE_FEE_RATE = 0.08;
export const TAX_RATE = 0.1;

export function nightsBetween(checkIn: string, checkOut: string): number {
  if (!checkIn || !checkOut) return 0;
  const start = new Date(checkIn + "T00:00:00");
  const end = new Date(checkOut + "T00:00:00");
  const ms = end.getTime() - start.getTime();
  const nights = Math.round(ms / (1000 * 60 * 60 * 24));
  return nights > 0 ? nights : 0;
}

export interface PriceBreakdown {
  nights: number;
  roomTotal: number;
  serviceFee: number;
  taxes: number;
  total: number;
}

export function priceBreakdown(
  pricePerNight: number,
  nights: number
): PriceBreakdown {
  const roomTotal = pricePerNight * nights;
  const serviceFee = Math.round(roomTotal * SERVICE_FEE_RATE);
  const taxes = Math.round(roomTotal * TAX_RATE);
  const total = roomTotal + serviceFee + taxes;
  return { nights, roomTotal, serviceFee, taxes, total };
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Today's date as YYYY-MM-DD, for date input min values. */
export function todayISO(): string {
  return new Date().toISOString().split("T")[0];
}

/** Add n days to an ISO date string (YYYY-MM-DD). */
export function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0];
}

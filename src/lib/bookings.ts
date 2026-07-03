/**
 * In-memory bookings store.
 *
 * In a real application this would be backed by a database.
 * For the demo / prototype, bookings are kept in a module-level array
 * that lives as long as the Next.js server process is running.
 */

export interface Booking {
  id: string;
  bookingRef: string;
  hotelId: string;
  hotelName: string;
  roomId: string;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  guests: number;
  guest: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  pricing: {
    pricePerNight: number;
    roomTotal: number;
    serviceFee: number;
    taxes: number;
    total: number;
    currency: string;
  };
  status: "confirmed" | "cancelled";
  createdAt: string;
}

const bookings: Booking[] = [];

export function addBooking(booking: Booking): void {
  bookings.push(booking);
}

export function getBookings(): readonly Booking[] {
  return bookings;
}

export function getBookingByRef(ref: string): Booking | undefined {
  return bookings.find((b) => b.bookingRef === ref);
}

export function getBookingById(id: string): Booking | undefined {
  return bookings.find((b) => b.id === id);
}

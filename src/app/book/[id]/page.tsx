import { notFound } from "next/navigation";
import { getHotel } from "@/lib/hotels";
import { BookingFlow } from "@/components/BookingFlow";

export async function generateMetadata(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const hotel = await getHotel(params.id);
  return {
    title: hotel ? `Book ${hotel.name} — Lumi Stays` : "Book — Lumi Stays",
  };
}

export default async function BookPage(
  props: {
    params: Promise<{ id: string }>;
    searchParams: Promise<{
      room?: string;
      checkIn?: string;
      checkOut?: string;
      guests?: string;
    }>;
  }
) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const hotel = await getHotel(params.id);
  if (!hotel) notFound();

  const guestsNum = searchParams.guests
    ? Number(searchParams.guests)
    : undefined;

  return (
    <BookingFlow
      hotel={hotel}
      initialRoomId={searchParams.room}
      initialCheckIn={searchParams.checkIn}
      initialCheckOut={searchParams.checkOut}
      initialGuests={
        guestsNum && !Number.isNaN(guestsNum) ? guestsNum : undefined
      }
    />
  );
}

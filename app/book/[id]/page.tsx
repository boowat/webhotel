import { notFound } from "next/navigation";
import { getHotel } from "@/lib/hotels";
import { BookingFlow } from "@/components/BookingFlow";

export function generateMetadata({ params }: { params: { id: string } }) {
  const hotel = getHotel(params.id);
  return {
    title: hotel ? `Book ${hotel.name} — Lumi Stays` : "Book — Lumi Stays",
  };
}

export default function BookPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: {
    room?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  };
}) {
  const hotel = getHotel(params.id);
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

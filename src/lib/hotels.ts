import { Hotel } from "./types";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const hotels: Hotel[] = [
  {
    id: "des-indes",
    name: "Des Indes",
    tagline: "Heritage hospitality in the heart of Jakarta",
    city: "Jakarta",
    country: "Indonesia",
    address: "Jl. Kebon Sirih No. 17, Jakarta Pusat 10340",
    rating: 4.8,
    reviewCount: 428,
    pricePerNight: 1250000,
    currency: "IDR",
    heroImage: img("photo-1564501049412-61c2a3083791"),
    heroSeed: "des-indes-hero",
    gallery: [
      { src: img("photo-1566073771259-6a8506099945"), seed: "des-indes-lobby" },
      { src: img("photo-1542314831-068cd1dbfeeb"), seed: "des-indes-room" },
      { src: img("photo-1551882547-ff40c63fe5fa"), seed: "des-indes-dining" },
      { src: img("photo-1520250497591-112f2f40a3f4"), seed: "des-indes-pool" },
    ],
    description:
      "Des Indes brings quiet heritage character to central Jakarta. Warm Indonesian hospitality, refined rooms, and thoughtful details make every stay feel personal.",
    highlights: [
      "Central Jakarta location",
      "Daily breakfast available",
      "All-day dining restaurant",
      "24-hour front desk",
    ],
    amenities: [
      "Free Wi-Fi",
      "Restaurant",
      "Fitness center",
      "Swimming pool",
      "Airport transfer",
      "Air conditioning",
    ],
    rooms: [
      {
        id: "deluxe",
        name: "Deluxe",
        description:
          "Comfortable king room with warm timber finishes, a work desk, and city-facing windows.",
        pricePerNight: 1250000,
        maxGuests: 2,
        beds: "1 king bed",
        size: "32 m²",
        image: img("photo-1618773928121-c32242e63f39"),
        imageSeed: "des-indes-deluxe",
      },
      {
        id: "premium",
        name: "Premium",
        description:
          "Spacious room with a lounge corner, king bed, and additional space for a small family.",
        pricePerNight: 1850000,
        maxGuests: 3,
        beds: "1 king bed + 1 sofa bed",
        size: "45 m²",
        image: img("photo-1568084680786-a84f91d1153c"),
        imageSeed: "des-indes-premium",
      },
      {
        id: "presidential",
        name: "Presidential",
        description:
          "Signature suite with separate living and dining areas, ideal for an extended family stay.",
        pricePerNight: 3500000,
        maxGuests: 4,
        beds: "1 king bed + 2 twin beds",
        size: "92 m²",
        image: img("photo-1578683010236-d716f9a3f461"),
        imageSeed: "des-indes-presidential",
      },
    ],
    reviews: [
      {
        author: "Nadia A.",
        location: "Bandung, Indonesia",
        rating: 5,
        date: "Jul 2026",
        text: "Warm service and a very comfortable room. The central location made our Jakarta weekend easy.",
      },
      {
        author: "Daniel K.",
        location: "Singapore",
        rating: 5,
        date: "Jun 2026",
        text: "Quiet room, attentive staff, and an excellent breakfast. I would stay here again for business.",
      },
      {
        author: "Rina P.",
        location: "Surabaya, Indonesia",
        rating: 4,
        date: "May 2026",
        text: "The Premium room was spacious for our family and the team helped us check in quickly.",
      },
    ],
  },
];

export function getHotel(id: string): Hotel | undefined {
  return hotels.find((hotel) => hotel.id === id);
}

export function getRoom(hotelId: string, roomId: string) {
  const hotel = getHotel(hotelId);
  if (!hotel) return undefined;

  const room = hotel.rooms.find((candidate) => candidate.id === roomId);
  if (!room) return undefined;

  return { hotel, room };
}

export function findRoomById(roomId: string) {
  for (const hotel of hotels) {
    const room = hotel.rooms.find((candidate) => candidate.id === roomId);
    if (room) return { hotel, room };
  }

  return undefined;
}

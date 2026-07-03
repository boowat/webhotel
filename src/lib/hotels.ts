import { Hotel } from "./types";

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const hotels: Hotel[] = [
  {
    id: "aurora-bali-resort",
    name: "Aurora Bali Resort & Spa",
    tagline: "Clifftop villas over the Uluwatu coastline",
    city: "Uluwatu, Bali",
    country: "Indonesia",
    address: "Jl. Pantai Suluban No. 12, Pecatu, Bali 80361",
    rating: 4.9,
    reviewCount: 1284,
    pricePerNight: 210,
    currency: "USD",
    heroImage: img("photo-1571896349842-33c89424de2d"),
    heroSeed: "aurora-hero",
    gallery: [
      { src: img("photo-1582719478250-c89cae4dc85b"), seed: "aurora-1" },
      { src: img("photo-1566073771259-6a8506099945"), seed: "aurora-2" },
      { src: img("photo-1596394516093-501ba68a0ba6"), seed: "aurora-3" },
      { src: img("photo-1551776235-dde6d482980b"), seed: "aurora-4" },
    ],
    description:
      "Perched on the limestone cliffs of Uluwatu, Aurora Bali Resort blends open-air Balinese architecture with infinity pools that fall away into the Indian Ocean. Every villa is a private retreat with a plunge pool, outdoor shower, and a sunset-facing daybed. Mornings start with a floating breakfast; evenings end at the cliff-edge cocktail bar.",
    highlights: [
      "Private plunge pool in every villa",
      "5-minute walk to Suluban surf break",
      "Award-winning oceanfront spa",
      "Daily floating breakfast included",
    ],
    amenities: [
      "Infinity pool",
      "Free Wi-Fi",
      "Spa & wellness",
      "Airport shuttle",
      "Beach access",
      "Restaurant & bar",
      "Air conditioning",
      "Yoga pavilion",
    ],
    rooms: [
      {
        id: "ocean-villa",
        name: "Ocean Cliff Villa",
        description:
          "One-bedroom villa with a private infinity plunge pool and uninterrupted ocean views.",
        pricePerNight: 210,
        maxGuests: 2,
        beds: "1 king bed",
        size: "65 m²",
        image: img("photo-1611892440504-42a792e24d32"),
        imageSeed: "aurora-room-1",
      },
      {
        id: "garden-suite",
        name: "Tropical Garden Suite",
        description:
          "Spacious suite opening onto the tropical garden and shared lagoon pool.",
        pricePerNight: 165,
        maxGuests: 3,
        beds: "1 king + 1 sofa bed",
        size: "48 m²",
        image: img("photo-1631049307264-da0ec9d70304"),
        imageSeed: "aurora-room-2",
      },
      {
        id: "royal-pavilion",
        name: "Royal Two-Bedroom Pavilion",
        description:
          "Two-bedroom pavilion with a 12m private pool, perfect for families.",
        pricePerNight: 395,
        maxGuests: 5,
        beds: "2 king beds",
        size: "120 m²",
        image: img("photo-1618773928121-c32242e63f39"),
        imageSeed: "aurora-room-3",
      },
    ],
    reviews: [
      {
        author: "Mei L.",
        location: "Singapore",
        rating: 5,
        date: "May 2026",
        text: "The villa pool looking straight onto the ocean is unreal. Staff remembered our names from day one. Floating breakfast is worth every photo.",
      },
      {
        author: "Daniel R.",
        location: "Sydney, Australia",
        rating: 5,
        date: "Apr 2026",
        text: "Best surf trip base I have ever stayed at. Suluban is a five minute walk and the spa fixed me up after every session.",
      },
      {
        author: "Priya S.",
        location: "Mumbai, India",
        rating: 4,
        date: "Mar 2026",
        text: "Stunning property and very private. Only note is the cliff steps are a bit much with luggage, but staff helped immediately.",
      },
    ],
  },
  {
    id: "the-monarch-tokyo",
    name: "The Monarch Tokyo",
    tagline: "A skyline tower above the lights of Shinjuku",
    city: "Shinjuku, Tokyo",
    country: "Japan",
    address: "2-7-1 Nishi-Shinjuku, Shinjuku City, Tokyo 160-0023",
    rating: 4.8,
    reviewCount: 2071,
    pricePerNight: 320,
    currency: "USD",
    heroImage: img("photo-1542314831-068cd1dbfeeb"),
    heroSeed: "monarch-hero",
    gallery: [
      { src: img("photo-1590490360182-c33d57733427"), seed: "monarch-1" },
      { src: img("photo-1551882547-ff40c63fe5fa"), seed: "monarch-2" },
      { src: img("photo-1445019980597-93fa8acb246c"), seed: "monarch-3" },
      { src: img("photo-1520250497591-112f2f40a3f4"), seed: "monarch-4" },
    ],
    description:
      "On the upper floors of a Nishi-Shinjuku tower, The Monarch Tokyo pairs floor-to-ceiling skyline views with quiet, precise hospitality. The lobby lounge sits on the 45th floor; the sky bar serves Japanese whisky as the city flickers below. Steps from Shinjuku Station, it is the calm center of the busiest district in the world.",
    highlights: [
      "Floors 41-52 with skyline views",
      "3-minute walk to Shinjuku Station",
      "45th-floor sky lounge & whisky bar",
      "Michelin-starred kaiseki restaurant",
    ],
    amenities: [
      "Free Wi-Fi",
      "Sky bar",
      "Fitness center",
      "Concierge",
      "Restaurant",
      "Air conditioning",
      "Laundry service",
      "Business center",
    ],
    rooms: [
      {
        id: "skyline-king",
        name: "Skyline King",
        description:
          "King room on a high floor with panoramic city views and a deep soaking tub.",
        pricePerNight: 320,
        maxGuests: 2,
        beds: "1 king bed",
        size: "38 m²",
        image: img("photo-1568084680786-a84f91d1153c"),
        imageSeed: "monarch-room-1",
      },
      {
        id: "twin-city",
        name: "City Twin",
        description:
          "Twin room with workspace and city views, ideal for business travelers.",
        pricePerNight: 285,
        maxGuests: 2,
        beds: "2 twin beds",
        size: "34 m²",
        image: img("photo-1505693416388-ac5ce068fe85"),
        imageSeed: "monarch-room-2",
      },
      {
        id: "monarch-suite",
        name: "The Monarch Suite",
        description:
          "Corner suite with a separate living room, two-sided skyline view, and lounge access.",
        pricePerNight: 540,
        maxGuests: 3,
        beds: "1 king bed",
        size: "72 m²",
        image: img("photo-1578683010236-d716f9a3f461"),
        imageSeed: "monarch-room-3",
      },
    ],
    reviews: [
      {
        author: "Kenji T.",
        location: "Osaka, Japan",
        rating: 5,
        date: "May 2026",
        text: "The view from the 49th floor at night is the reason to book. Service is flawless and the station is genuinely three minutes away.",
      },
      {
        author: "Hannah W.",
        location: "London, UK",
        rating: 5,
        date: "Apr 2026",
        text: "Spotless, quiet, and the sky bar is special. The kaiseki dinner was a highlight of our whole trip to Japan.",
      },
      {
        author: "Marco V.",
        location: "Milan, Italy",
        rating: 4,
        date: "Feb 2026",
        text: "Excellent location and rooms. Breakfast gets busy around 8am so go early, but everything else was perfect.",
      },
    ],
  },
  {
    id: "alpine-haus-zermatt",
    name: "Alpine Haus Zermatt",
    tagline: "A timber chalet facing the Matterhorn",
    city: "Zermatt",
    country: "Switzerland",
    address: "Bahnhofstrasse 41, 3920 Zermatt, Valais",
    rating: 4.9,
    reviewCount: 864,
    pricePerNight: 410,
    currency: "USD",
    heroImage: img("photo-1506905925346-21bda4d32df4"),
    heroSeed: "alpine-hero",
    gallery: [
      { src: img("photo-1499793983690-e29da59ef1c2"), seed: "alpine-1" },
      { src: img("photo-1540541338287-41700207dee6"), seed: "alpine-2" },
      { src: img("photo-1455587734955-081b22074882"), seed: "alpine-3" },
      { src: img("photo-1564501049412-61c2a3083791"), seed: "alpine-4" },
    ],
    description:
      "Alpine Haus is a family-run chalet in the heart of car-free Zermatt, a short walk from the Gornergrat railway. Rooms are clad in warm Swiss pine with balconies framing the Matterhorn. After a day on the slopes, the wellness floor offers a sauna, steam room, and an outdoor hot tub under the peaks.",
    highlights: [
      "Direct Matterhorn views from balconies",
      "Ski-in storage & boot warmers",
      "Rooftop hot tub and sauna",
      "5-minute walk to Gornergrat railway",
    ],
    amenities: [
      "Free Wi-Fi",
      "Sauna & steam room",
      "Outdoor hot tub",
      "Ski storage",
      "Fireplace lounge",
      "Restaurant",
      "Heating",
      "Mountain shuttle",
    ],
    rooms: [
      {
        id: "matterhorn-double",
        name: "Matterhorn View Double",
        description:
          "Pine-clad double room with a private balcony framing the Matterhorn.",
        pricePerNight: 410,
        maxGuests: 2,
        beds: "1 queen bed",
        size: "30 m²",
        image: img("photo-1522708323590-d24dbb6b0267"),
        imageSeed: "alpine-room-1",
      },
      {
        id: "valley-double",
        name: "Valley Double",
        description:
          "Cozy double facing the village and valley, with a reading nook.",
        pricePerNight: 320,
        maxGuests: 2,
        beds: "1 queen bed",
        size: "26 m²",
        image: img("photo-1505691938895-1758d7feb511"),
        imageSeed: "alpine-room-2",
      },
      {
        id: "family-chalet",
        name: "Family Chalet Suite",
        description:
          "Two-room suite with a fireplace, sleeping up to four, plus a balcony.",
        pricePerNight: 680,
        maxGuests: 4,
        beds: "1 queen + 2 single beds",
        size: "55 m²",
        image: img("photo-1560185007-cde436f6a4d0"),
        imageSeed: "alpine-room-3",
      },
    ],
    reviews: [
      {
        author: "Sofia B.",
        location: "Zurich, Switzerland",
        rating: 5,
        date: "Mar 2026",
        text: "Woke up to the Matterhorn from bed every morning. The hot tub after skiing is unbeatable and the family running it could not be kinder.",
      },
      {
        author: "Tom H.",
        location: "Manchester, UK",
        rating: 5,
        date: "Feb 2026",
        text: "Perfect ski base. Boot warmers, ski storage, and a five minute walk to the lifts. Rooms are small but beautifully done.",
      },
      {
        author: "Anouk D.",
        location: "Amsterdam, Netherlands",
        rating: 4,
        date: "Jan 2026",
        text: "Charming and warm. The village is car-free which is lovely. Dinner menu is small but everything we tried was excellent.",
      },
    ],
  },
  {
    id: "casa-marea-lisbon",
    name: "Casa Marea Lisbon",
    tagline: "A tiled townhouse in the Alfama hills",
    city: "Alfama, Lisbon",
    country: "Portugal",
    address: "Rua de São Tomé 58, 1100-563 Lisboa",
    rating: 4.7,
    reviewCount: 1542,
    pricePerNight: 145,
    currency: "USD",
    heroImage: img("photo-1564501049412-61c2a3083791"),
    heroSeed: "casa-hero",
    gallery: [
      { src: img("photo-1445019980597-93fa8acb246c"), seed: "casa-1" },
      { src: img("photo-1520250497591-112f2f40a3f4"), seed: "casa-2" },
      { src: img("photo-1590490360182-c33d57733427"), seed: "casa-3" },
      { src: img("photo-1551882547-ff40c63fe5fa"), seed: "casa-4" },
    ],
    description:
      "Casa Marea is a restored 18th-century townhouse on the steep lanes of Alfama, Lisbon's oldest quarter. Hand-painted azulejo tiles, a rooftop terrace over terracotta rooftops, and the sound of fado drifting up from the street give it a real sense of place. Trams, viewpoints, and pastel de nata are all a few steps from the door.",
    highlights: [
      "Rooftop terrace over the Tagus river",
      "Steps from Tram 28 and Miradouros",
      "Restored azulejo tilework throughout",
      "Daily Portuguese breakfast",
    ],
    amenities: [
      "Free Wi-Fi",
      "Rooftop terrace",
      "Breakfast included",
      "Air conditioning",
      "Honesty bar",
      "Concierge",
      "Luggage storage",
      "Self check-in",
    ],
    rooms: [
      {
        id: "tile-double",
        name: "Azulejo Double",
        description:
          "Bright double with original tilework and a window over the lane.",
        pricePerNight: 145,
        maxGuests: 2,
        beds: "1 queen bed",
        size: "22 m²",
        image: img("photo-1505693416388-ac5ce068fe85"),
        imageSeed: "casa-room-1",
      },
      {
        id: "river-room",
        name: "River View Room",
        description:
          "Top-floor room with a small balcony looking toward the Tagus river.",
        pricePerNight: 190,
        maxGuests: 2,
        beds: "1 queen bed",
        size: "26 m²",
        image: img("photo-1568084680786-a84f91d1153c"),
        imageSeed: "casa-room-2",
      },
      {
        id: "terrace-suite",
        name: "Terrace Suite",
        description:
          "Suite with private terrace access and a seating area, sleeps three.",
        pricePerNight: 265,
        maxGuests: 3,
        beds: "1 queen + 1 sofa bed",
        size: "40 m²",
        image: img("photo-1578683010236-d716f9a3f461"),
        imageSeed: "casa-room-3",
      },
    ],
    reviews: [
      {
        author: "Beatriz C.",
        location: "Porto, Portugal",
        rating: 5,
        date: "May 2026",
        text: "The rooftop at sunset with a glass of vinho verde is magic. Authentic Alfama feel and the hosts gave us the best food tips.",
      },
      {
        author: "James P.",
        location: "Dublin, Ireland",
        rating: 4,
        date: "Apr 2026",
        text: "Beautiful tiled house full of character. Alfama is hilly so pack light shoes, but the location is unbeatable.",
      },
      {
        author: "Lena M.",
        location: "Berlin, Germany",
        rating: 5,
        date: "Mar 2026",
        text: "Felt like staying in a friend's gorgeous home. Breakfast was generous and the tram stops right around the corner.",
      },
    ],
  },
  {
    id: "saffron-marrakech",
    name: "Riad Saffron Marrakech",
    tagline: "A courtyard riad inside the medina walls",
    city: "Medina, Marrakech",
    country: "Morocco",
    address: "Derb Jdid 19, Medina, 40000 Marrakech",
    rating: 4.8,
    reviewCount: 1097,
    pricePerNight: 130,
    currency: "USD",
    heroImage: img("photo-1551882547-ff40c63fe5fa"),
    heroSeed: "saffron-hero",
    gallery: [
      { src: img("photo-1582719478250-c89cae4dc85b"), seed: "saffron-1" },
      { src: img("photo-1596394516093-501ba68a0ba6"), seed: "saffron-2" },
      { src: img("photo-1566073771259-6a8506099945"), seed: "saffron-3" },
      { src: img("photo-1571896349842-33c89424de2d"), seed: "saffron-4" },
    ],
    description:
      "Riad Saffron hides behind a quiet door in the Marrakech medina, opening onto a tiled courtyard with a plunge pool and orange trees. Rooms are layered with zellige tile, carved cedar, and lantern light. The rooftop serves mint tea and tagine as the call to prayer echoes over the old city, with the Atlas Mountains on the horizon.",
    highlights: [
      "Courtyard plunge pool and fountain",
      "Rooftop dining with Atlas views",
      "5-minute walk to Jemaa el-Fnaa",
      "Hammam and traditional spa",
    ],
    amenities: [
      "Plunge pool",
      "Rooftop restaurant",
      "Hammam & spa",
      "Free Wi-Fi",
      "Airport transfer",
      "Breakfast included",
      "Air conditioning",
      "Guided medina tours",
    ],
    rooms: [
      {
        id: "zellige-double",
        name: "Zellige Double",
        description:
          "Intimate double with handmade tilework and a courtyard-facing window.",
        pricePerNight: 130,
        maxGuests: 2,
        beds: "1 double bed",
        size: "24 m²",
        image: img("photo-1631049307264-da0ec9d70304"),
        imageSeed: "saffron-room-1",
      },
      {
        id: "garden-room",
        name: "Orange Garden Room",
        description:
          "Ground-floor room opening directly onto the courtyard and pool.",
        pricePerNight: 170,
        maxGuests: 2,
        beds: "1 king bed",
        size: "30 m²",
        image: img("photo-1611892440504-42a792e24d32"),
        imageSeed: "saffron-room-2",
      },
      {
        id: "saffron-suite",
        name: "Saffron Rooftop Suite",
        description:
          "Top-floor suite with a private terrace, soaking tub, and Atlas views.",
        pricePerNight: 290,
        maxGuests: 3,
        beds: "1 king + 1 daybed",
        size: "46 m²",
        image: img("photo-1618773928121-c32242e63f39"),
        imageSeed: "saffron-room-3",
      },
    ],
    reviews: [
      {
        author: "Yasmin A.",
        location: "Casablanca, Morocco",
        rating: 5,
        date: "Apr 2026",
        text: "A peaceful oasis steps from the chaos of the souks. The rooftop dinner under the stars was unforgettable and the hammam was heavenly.",
      },
      {
        author: "Greg F.",
        location: "Toronto, Canada",
        rating: 5,
        date: "Mar 2026",
        text: "The team arranged our airport pickup and walked us in through the maze of the medina. Cool plunge pool was perfect in the heat.",
      },
      {
        author: "Claire N.",
        location: "Lyon, France",
        rating: 4,
        date: "Feb 2026",
        text: "Gorgeous traditional riad. The medina lanes are tricky to navigate at first, but staff met us and it was completely worth it.",
      },
    ],
  },
  {
    id: "harbor-loft-nyc",
    name: "Harbor Loft New York",
    tagline: "Industrial-chic lofts in DUMBO, Brooklyn",
    city: "DUMBO, Brooklyn",
    country: "United States",
    address: "55 Water Street, Brooklyn, NY 11201",
    rating: 4.6,
    reviewCount: 1830,
    pricePerNight: 260,
    currency: "USD",
    heroImage: img("photo-1445019980597-93fa8acb246c"),
    heroSeed: "harbor-hero",
    gallery: [
      { src: img("photo-1590490360182-c33d57733427"), seed: "harbor-1" },
      { src: img("photo-1520250497591-112f2f40a3f4"), seed: "harbor-2" },
      { src: img("photo-1542314831-068cd1dbfeeb"), seed: "harbor-3" },
      { src: img("photo-1564501049412-61c2a3083791"), seed: "harbor-4" },
    ],
    description:
      "Set in a converted warehouse under the Manhattan Bridge, Harbor Loft pairs exposed brick and steel with skyline views across the East River. Floor-to-ceiling windows frame the bridges; the rooftop bar looks straight at the Manhattan skyline. Brooklyn Bridge Park, galleries, and the city's best pizza are all on the doorstep.",
    highlights: [
      "Skyline and bridge views",
      "Rooftop bar over the East River",
      "Steps from Brooklyn Bridge Park",
      "Exposed-brick loft interiors",
    ],
    amenities: [
      "Free Wi-Fi",
      "Rooftop bar",
      "Fitness center",
      "Pet friendly",
      "Coffee bar",
      "Air conditioning",
      "24-hour front desk",
      "Bike rental",
    ],
    rooms: [
      {
        id: "brick-queen",
        name: "Exposed Brick Queen",
        description:
          "Loft-style queen room with exposed brick and big warehouse windows.",
        pricePerNight: 260,
        maxGuests: 2,
        beds: "1 queen bed",
        size: "32 m²",
        image: img("photo-1505693416388-ac5ce068fe85"),
        imageSeed: "harbor-room-1",
      },
      {
        id: "skyline-loft",
        name: "Skyline Loft",
        description:
          "Corner loft with floor-to-ceiling windows facing the Manhattan skyline.",
        pricePerNight: 360,
        maxGuests: 2,
        beds: "1 king bed",
        size: "42 m²",
        image: img("photo-1568084680786-a84f91d1153c"),
        imageSeed: "harbor-room-2",
      },
      {
        id: "warehouse-suite",
        name: "Warehouse Suite",
        description:
          "Spacious suite with a living area and bridge views, sleeps four.",
        pricePerNight: 520,
        maxGuests: 4,
        beds: "1 king + 1 sofa bed",
        size: "68 m²",
        image: img("photo-1578683010236-d716f9a3f461"),
        imageSeed: "harbor-room-3",
      },
    ],
    reviews: [
      {
        author: "Olivia K.",
        location: "Chicago, USA",
        rating: 5,
        date: "May 2026",
        text: "The skyline view from the loft is the postcard shot of NYC. DUMBO is the perfect quiet base with the city a short walk over the bridge.",
      },
      {
        author: "Raj P.",
        location: "Austin, USA",
        rating: 4,
        date: "Apr 2026",
        text: "Loved the industrial design and the rooftop bar. City noise is real at night but the windows are well insulated.",
      },
      {
        author: "Emma S.",
        location: "Vancouver, Canada",
        rating: 5,
        date: "Mar 2026",
        text: "Brooklyn Bridge Park at sunrise was right there. Staff were great with our dog and the coffee bar downstairs is excellent.",
      },
    ],
  },
];

export function getHotel(id: string): Hotel | undefined {
  return hotels.find((h) => h.id === id);
}

export function getRoom(hotelId: string, roomId: string) {
  const hotel = getHotel(hotelId);
  if (!hotel) return undefined;
  const room = hotel.rooms.find((r) => r.id === roomId);
  if (!room) return undefined;
  return { hotel, room };
}

/**
 * Find a room by its ID across all hotels.
 * Since this is a single-hotel app, room IDs are unique.
 */
export function findRoomById(roomId: string) {
  for (const hotel of hotels) {
    const room = hotel.rooms.find((r) => r.id === roomId);
    if (room) return { hotel, room };
  }
  return undefined;
}

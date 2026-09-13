export type SeedGalleryImage = {
  src: string;
  seed: string;
};

export type SeedRoom = {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  beds: string;
  size: string;
  sizeArea?: string;
  image: string;
  imageSeed: string;
  gallery: SeedGalleryImage[];
  totalUnits: number;
  sortOrder: number;
};

export type SeedReview = {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  text: string;
  sortOrder: number;
};

export type SeedHotel = {
  id: string;
  name: string;
  tagline: string;
  city: string;
  country: string;
  address: string;
  rating: number;
  reviewCount: number;
  pricePerNight: number;
  currency: string;
  heroImage: string;
  heroSeed: string;
  gallery: SeedGalleryImage[];
  description: string;
  highlights: string[];
  amenities: string[];
  sortOrder: number;
  rooms: SeedRoom[];
  reviews: SeedReview[];
};

const img = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1400&q=80`;

export const seedHotel: SeedHotel = {
  id: "hotel-des-indes",
  name: "Hotel Des Indes Menteng Jakarta",
  tagline: "Exclusive and unique hotel in the city center",
  city: "Menteng, Jakarta",
  country: "Indonesia",
  address: "Jl. HOS Cokroaminoto No. 84, Menteng, Jakarta 10310",
  rating: 4.8,
  reviewCount: 328,
  pricePerNight: 750000,
  currency: "IDR",
  heroImage: "/banner.jpg",
  heroSeed: "des-indes-hero",
  gallery: [
    { src: "/banner.jpg", seed: "des-indes-gallery-1" },
    {
      src: img("photo-1566073771259-6a8506099945"),
      seed: "des-indes-gallery-2",
    },
    {
      src: img("photo-1551882547-ff40c63fe5fa"),
      seed: "des-indes-gallery-3",
    },
    {
      src: img("photo-1520250497591-112f2f40a3f4"),
      seed: "des-indes-gallery-4",
    },
  ],
  description:
    "A refined city hotel in Menteng with classic hospitality, calm interiors, and easy access to Jakarta business districts, embassies, dining, and heritage landmarks.",
  highlights: [
    "Central Menteng location",
    "Three curated room types",
    "Direct booking with live availability",
    "Restaurant, meeting space, and city access",
  ],
  amenities: [
    "Free Wi-Fi",
    "Restaurant",
    "Breakfast available",
    "Air conditioning",
    "Airport transfer",
    "Meeting room",
    "24-hour front desk",
    "Concierge",
  ],
  sortOrder: 1,
  rooms: [
    {
      id: "standard",
      name: "Standard Room",
      description:
        "Comfortable room for short city stays with a queen bed, work desk, and ensuite bathroom.",
      pricePerNight: 750000,
      maxGuests: 2,
      beds: "1 queen bed",
      size: "28 sqm",
      image: img("photo-1505693416388-ac5ce068fe85"),
      imageSeed: "standard-room",
      gallery: [
        {
          src: img("photo-1611892440504-42a792e24d32"),
          seed: "standard-room-bed",
        },
        {
          src: img("photo-1584132967334-10e028bd69f7"),
          seed: "standard-room-bath",
        },
        {
          src: img("photo-1595576508898-0ad5c879a061"),
          seed: "standard-room-desk",
        },
        {
          src: img("photo-1560448204-e02f11c3d0e2"),
          seed: "standard-room-view",
        },
      ],

      totalUnits: 10,
      sortOrder: 1,
    },
    {
      id: "gold",
      name: "Gold Room",
      description:
        "Larger room with upgraded furnishings, city views, a king bed, and a lounge corner.",
      pricePerNight: 1250000,
      maxGuests: 2,
      beds: "1 king bed",
      size: "36 sqm",
      image: img("photo-1568084680786-a84f91d1153c"),
      imageSeed: "gold-room",
      gallery: [
        {
          src: img("photo-1590490360182-c33d57733427"),
          seed: "gold-room-bed",
        },
        {
          src: img("photo-1631049307264-da0ec9d70304"),
          seed: "gold-room-lounge",
        },
        {
          src: img("photo-1587985064135-0366536eab42"),
          seed: "gold-room-bath",
        },
        {
          src: img("photo-1522708323590-d24dbb6b0267"),
          seed: "gold-room-view",
        },
      ],

      totalUnits: 10,
      sortOrder: 2,
    },
    {
      id: "presidential",
      name: "Presidential Suite",
      description:
        "Signature suite with separate living area, premium bathroom, dining space, and executive service.",
      pricePerNight: 3500000,
      maxGuests: 4,
      beds: "1 king bed + 1 sofa bed",
      size: "72 sqm",
      image: img("photo-1578683010236-d716f9a3f461"),
      imageSeed: "presidential-suite",
      gallery: [
        {
          src: img("photo-1616486338812-3dadae4b4ace"),
          seed: "presidential-suite-living",
        },
        {
          src: img("photo-1582719478250-c89cae4dc85b"),
          seed: "presidential-suite-bed",
        },
        {
          src: img("photo-1571003123894-1f0594d2b5d9"),
          seed: "presidential-suite-bath",
        },
        {
          src: img("photo-1551882547-ff40c63fe5fa"),
          seed: "presidential-suite-dining",
        },
      ],

      totalUnits: 10,
      sortOrder: 3,
    },
  ],
  reviews: [
    {
      id: "des-indes-review-1",
      author: "Andini P.",
      location: "Bandung, Indonesia",
      rating: 5,
      date: "Jun 2026",
      text: "Location is excellent for meetings around Menteng, and the room felt quiet after a busy day.",
      sortOrder: 1,
    },
    {
      id: "des-indes-review-2",
      author: "Raka S.",
      location: "Surabaya, Indonesia",
      rating: 5,
      date: "May 2026",
      text: "Smooth check-in, helpful staff, and breakfast was a good start before heading across Jakarta.",
      sortOrder: 2,
    },
  ],
};

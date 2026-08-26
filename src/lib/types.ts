export interface RoomType {
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
  gallery?: { src: string; seed: string }[];
  totalUnits?: number;
}

export interface VenueType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  minGuests?: number;
  suitableFor: string[];      // e.g. ["wedding", "graduation", "birthday"]
  pricingModel: "hourly" | "perPax";
  rate: number;
  image: string;
  imageSeed: string;
}


export interface Hotel {
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
  gallery: { src: string; seed: string }[];
  description: string;
  highlights: string[];
  amenities: string[];
  rooms: RoomType[];
  reviews: Review[];
}

export interface Venues {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  capacity: number;
  sizeArea: string;
  image: string;
  imageSeed: string;
}


export interface Review {
  author: string;
  location: string;
  rating: number;
  date: string;
  text: string;
}

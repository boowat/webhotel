export interface RoomType {
  id: string;
  name: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  beds: string;
  size: string;
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

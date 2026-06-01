export type DishCategory =
  | "Starters"
  | "Soups"
  | "Vegetarian Dishes"
  | "Paneer Specials"
  | "South Indian"
  | "Chinese"
  | "Main Course"
  | "Breads"
  | "Rice"
  | "Desserts"
  | "Beverages";

export interface Dish {
  id: string;
  name: string;
  description: string;
  category: DishCategory;
  price: number;
  image: string;
  available: boolean;
}

export type BookingStatus = "Pending" | "Approved" | "Rejected";

export interface Booking {
  id: string;
  name: string;
  mobile: string;
  date: string;
  time: string;
  persons: number;
  specialRequest?: string;
  status: BookingStatus;
  createdAt: string;
}

export interface GalleryItem {
  id: string;
  url: string;
  title: string;
  category: "Garden Seating" | "Family Area" | "Outdoor Dining" | "Evening Lighting" | "Relaxation Zone";
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date: string;
}

export interface WebsiteContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutStory: string;
  contactPhone: string;
  contactAddress: string;
  openingHours: string;
}

export interface ChefInfo {
  id: string;
  name: string;
  role: string;
  experience: string;
  image: string;
  description: string;
}

export interface AnalyticsStats {
  totalBookings: number;
  todayBookings: number;
  weeklyBookings: number;
  monthlyBookings: number;
  popularDishesCount: number;
  visitorCountEstimate: number;
}

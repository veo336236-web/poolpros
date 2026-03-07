// ── Database Schema Types ──────────────────────────────────────────

export interface Provider {
  id: string;
  name: string;
  category: "pool" | "fountain" | "fish";
  description: string;
  descriptionAr: string;
  rating: number;
  reviewCount: number;
  location: string;
  locationAr: string;
  governorate: string;
  basePrice: number;
  isVerified: boolean;
  whatsappNumber: string;
  image: string;
  yearsInBusiness: number;
  completedJobs: number;
}

export interface Service {
  id: string;
  providerId: string;
  name: string;
  nameAr: string;
  price: number | null;
  priceDisplay: string;
  priceDisplayAr: string;
  description: string;
  descriptionAr: string;
  serviceCategory: ServiceType;
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  date: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  totalAmount: number;
  /** Calculated as 10% of totalAmount */
  commissionFee: number;
}

// ── Filter Types ───────────────────────────────────────────────────

export type ServiceType =
  | "construction"
  | "maintenance"
  | "equipment"
  | "supplies"
  | "repairs"
  | "add-ons";

export interface FilterState {
  category: "pool" | "fountain" | "fish" | "all";
  serviceTypes: ServiceType[];
  maxPrice: number;
  governorate: string;
}

export const GOVERNORATES = [
  "All Areas",
  "Hawalli",
  "Capital",
  "Farwaniya",
  "Ahmadi",
  "Jahra",
  "Mubarak Al-Kabeer",
];

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
  id: number;
  customerId: number;
  customerName: string;
  customerPhone: string;
  providerId: string;
  providerName: string;
  serviceId: string;
  serviceName: string;
  preferredDate: string;
  notes: string;
  status: "pending" | "confirmed" | "rejected" | "completed" | "cancelled";
  rejectionReason: string;
  createdAt: string;
  updatedAt: string;
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

export interface PriceHistory {
  id: string;
  price: number;
  effectiveDate: string; // ISO Date
}

export interface Apartment {
  id: string
  name: string // e.g., "Apt 4B"
  priceHistory: PriceHistory[];
}

export interface Lease {
  id: string
  apartmentId: string
  startDate: string // ISO Date
  endDate: string // ISO Date
  tenantName?: string // Optional
}

export interface Payment {
  id: string
  leaseId: string // Links payment to a specific lease
  amount: number
  date: string // ISO Date
  isFullPayment: boolean // User can manually flag this payment as settling the debt
}

export type ApartmentStatus = "vacant" | "paid" | "deficit"

export interface ApartmentStatusInfo {
  apartment: Apartment
  status: ApartmentStatus
  lease?: Lease
  payments: Payment[]
  totalPaid: number
  deficit: number
  rentForMonth: number;
}

export type Currency = 'MGA' | 'Fmg';

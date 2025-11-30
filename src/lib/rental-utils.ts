import type { Apartment, Lease, Payment, ApartmentStatusInfo, ApartmentStatus, Currency } from "@/types"

// Check if a lease is active during a specific month
export function isLeaseActiveInMonth(lease: Lease, year: number, month: number): boolean {
  const monthStart = new Date(year, month, 1)
  const monthEnd = new Date(year, month + 1, 0) // Last day of the month

  // Use UTC to avoid timezone issues during parsing
  const leaseStart = new Date(lease.startDate + 'T00:00:00Z');
  const leaseEnd = new Date(lease.endDate + 'T00:00:00Z');


  // Lease overlaps with month if it starts before month ends AND ends after month starts
  return leaseStart <= monthEnd && leaseEnd >= monthStart
}

// Get payments for a specific month
export function getPaymentsInMonth(payments: Payment[], year: number, month: number): Payment[] {
  return payments.filter((payment) => {
    // Use UTC to avoid timezone issues during parsing
    const paymentDate = new Date(payment.date + 'T00:00:00Z');
    return paymentDate.getUTCFullYear() === year && paymentDate.getUTCMonth() === month
  })
}

// Calculate apartment status for a month
export function calculateApartmentStatus(
  apartment: Apartment,
  leases: Lease[],
  payments: Payment[],
  year: number,
  month: number,
): ApartmentStatusInfo {
  // Find active lease for this apartment in this month
  const activeLease = leases.find(
    (lease) => lease.apartmentId === apartment.id && isLeaseActiveInMonth(lease, year, month),
  )

  if (!activeLease) {
    return {
      apartment,
      status: "vacant",
      payments: [],
      totalPaid: 0,
      deficit: 0,
    }
  }

  // Get payments for this lease in this month
  const leasePayments = getPaymentsInMonth(payments, year, month).filter(
    (payment) => payment.leaseId === activeLease.id,
  )

  const totalPaid = leasePayments.reduce((sum, p) => sum + p.amount, 0)
  const hasFullPayment = leasePayments.some((p) => p.isFullPayment)
  const isPaid = hasFullPayment || totalPaid >= apartment.price

  const status: ApartmentStatus = isPaid ? "paid" : "deficit"

  return {
    apartment,
    status,
    lease: activeLease,
    payments: leasePayments,
    totalPaid,
    deficit: Math.max(0, apartment.price - totalPaid),
  }
}

// Calculate dashboard summary
export function calculateDashboardSummary(
  apartments: Apartment[],
  leases: Lease[],
  payments: Payment[],
  year: number,
  month: number,
) {
  const statuses = apartments.map((apt) => calculateApartmentStatus(apt, leases, payments, year, month))

  const expectedIncome = statuses.filter((s) => s.status !== "vacant").reduce((sum, s) => sum + s.apartment.price, 0)

  const collected = statuses.reduce((sum, s) => sum + s.totalPaid, 0)

  const missing = expectedIncome - collected

  return {
    statuses,
    expectedIncome,
    collected,
    missing: Math.max(0, missing),
    occupiedCount: statuses.filter((s) => s.status !== "vacant").length,
    vacantCount: statuses.filter((s) => s.status === "vacant").length,
    paidCount: statuses.filter((s) => s.status === "paid").length,
    deficitCount: statuses.filter((s) => s.status === "deficit").length,
  }
}

// Format currency
export function formatCurrency(amount: number, currency: Currency = 'MGA'): string {
  const displayAmount = currency === 'Fmg' ? amount * 5 : amount;
  
  if (currency === 'MGA') {
    // Consistent formatting for MGA (Ariary)
    return `Ar ${displayAmount.toLocaleString('fr-MG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  } 
  
  // Consistent formatting for Fmg
  return `Fmg ${displayAmount.toLocaleString('fr-MG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}


// Format date
export function formatDate(dateString: string): string {
  // Add a time to the date string to avoid timezone issues where it might be interpreted as the previous day
  const date = new Date(dateString + 'T00:00:00Z');
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Get month name
export function getMonthName(month: number): string {
  return new Date(Date.UTC(2025, month, 1)).toLocaleString("en-US", { month: "long", timeZone: "UTC" })
}

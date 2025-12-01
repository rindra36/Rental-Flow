import type { Apartment, Lease, Payment, ApartmentStatusInfo, ApartmentStatus, Currency, PriceHistory } from "@/types"

// Check if a lease is active during a specific month
export function isLeaseActiveInMonth(lease: Lease, year: number, month: number): boolean {
  const monthStart = new Date(Date.UTC(year, month, 1))
  const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)) // Last moment of the month

  // Use UTC to avoid timezone issues during parsing
  const leaseStart = new Date(lease.startDate + 'T00:00:00Z');
  const leaseEnd = new Date(lease.endDate + 'T00:00:00Z');
  leaseEnd.setUTCHours(23, 59, 59, 999);


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

// Get the effective price for an apartment for a given month
export function getPriceForMonth(priceHistory: PriceHistory[], year: number, month: number): number {
    const monthStart = new Date(Date.UTC(year, month, 1));
    const sortedHistory = [...priceHistory].sort((a, b) => new Date(b.effectiveDate).getTime() - new Date(a.effectiveDate).getTime());
    
    const effectivePrice = sortedHistory.find(p => new Date(p.effectiveDate + 'T00:00:00Z') <= monthStart);

    return effectivePrice ? effectivePrice.price : (sortedHistory.length > 0 ? sortedHistory[sortedHistory.length - 1].price : 0);
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
  
  const rentForMonth = getPriceForMonth(apartment.priceHistory, year, month);

  if (!activeLease) {
    return {
      apartment,
      status: "vacant",
      payments: [],
      totalPaid: 0,
      deficit: 0,
      rentForMonth,
    }
  }

  // Get payments for this lease in this month
  const leasePayments = getPaymentsInMonth(payments, year, month).filter(
    (payment) => payment.leaseId === activeLease.id,
  )

  const totalPaid = leasePayments.reduce((sum, p) => sum + p.amount, 0)
  const hasFullPayment = leasePayments.some((p) => p.isFullPayment)
  const isPaid = hasFullPayment || totalPaid >= rentForMonth;

  const status: ApartmentStatus = isPaid ? "paid" : "deficit"

  return {
    apartment,
    status,
    lease: activeLease,
    payments: leasePayments,
    totalPaid,
    deficit: Math.max(0, rentForMonth - totalPaid),
    rentForMonth,
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

  const expectedIncome = statuses.filter((s) => s.status !== "vacant").reduce((sum, s) => sum + s.rentForMonth, 0)

  const collected = statuses.reduce((sum, s) => sum + s.totalPaid, 0)

  const missing = statuses.filter(s => s.status === 'deficit').reduce((sum, s) => sum + s.deficit, 0);

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
  const locale = 'fr-MG'; // Malagasy locale for formatting
  
  if (currency === 'MGA') {
    return displayAmount.toLocaleString(locale, { style: 'currency', currency: 'MGA', minimumFractionDigits: 0, maximumFractionDigits: 0 });
  } 
  
  // Custom formatting for Fmg
  return `${displayAmount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} Fmg`;
}


// Format date
export function formatDate(dateString: string, locale: string = "en-US"): string {
  if (dateString === "9999-12-31") {
    return locale === 'fr' ? 'Présent' : "Present";
  }
  // Add a time to the date string to avoid timezone issues where it might be interpreted as the previous day
  const date = new Date(dateString + 'T00:00:00Z');
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

// Get month name
export function getMonthName(month: number, locale: string = "en-US"): string {
  return new Date(Date.UTC(2025, month, 1)).toLocaleString(locale, { month: "long", timeZone: "UTC" })
}

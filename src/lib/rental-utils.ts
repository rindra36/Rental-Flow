import type { Apartment, Lease, Payment, ApartmentStatusInfo, ApartmentStatus, Currency, PriceHistory } from "@/types"

// Check if a lease is active during a specific month
export function isLeaseActiveInMonth(
    lease: Lease,
    year: number,
    month: number
): boolean {
    const monthStart = new Date(Date.UTC(year, month, 1));
    const monthEnd = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999)); // Last moment of the month

    // Use UTC to avoid timezone issues during parsing
    const leaseStart = new Date(
        lease.startDate.toString().split("T")[0] + "T00:00:00Z"
    );
    const leaseEnd = new Date(
        lease.endDate.toString().split("T")[0] + "T00:00:00Z"
    );
    leaseEnd.setUTCHours(23, 59, 59, 999);

    // Lease overlaps with month if it starts before month ends AND ends after month starts
    return leaseStart <= monthEnd && leaseEnd >= monthStart;
}

// Get payments for a specific month
export function getPaymentsInMonth(
    payments: Payment[],
    year: number,
    month: number
): Payment[] {
    return payments.filter((payment) => {
        // If targetMonth/Year are defined, use them (legacy support: fall back to date if undefined)
        if (
            payment.targetMonth !== undefined &&
            payment.targetYear !== undefined
        ) {
            return payment.targetMonth === month && payment.targetYear === year;
        }

        // Use UTC to avoid timezone issues during parsing
        const paymentDate = new Date(
            payment.date.toString().split("T")[0] + "T00:00:00Z"
        );
        return (
            paymentDate.getUTCFullYear() === year &&
            paymentDate.getUTCMonth() === month
        );
    });
}

// Get the effective price for an apartment for a given month
export function getPriceForMonth(
    priceHistory: PriceHistory[],
    year: number,
    month: number
): number {
    const monthStart = new Date(Date.UTC(year, month, 1));
    const sortedHistory = [...priceHistory].sort(
        (a, b) =>
            new Date(b.effectiveDate).getTime() -
            new Date(a.effectiveDate).getTime()
    );

    const effectivePrice = sortedHistory.find(
        (p) =>
            new Date(p.effectiveDate.toString().split("T")[0] + "T00:00:00Z") <=
            monthStart
    );

    return effectivePrice
        ? effectivePrice.price
        : sortedHistory.length > 0
        ? sortedHistory[sortedHistory.length - 1].price
        : 0;
}

// Calculate apartment status for a month
export function calculateApartmentStatus(
    apartment: Apartment,
    leases: Lease[],
    payments: Payment[],
    year: number,
    month: number
): ApartmentStatusInfo {
    // Find active lease for this apartment in this month
    const activeLease = leases.find(
        (lease) =>
            lease.apartmentId === apartment.id &&
            isLeaseActiveInMonth(lease, year, month)
    );

    const rentForMonth = getPriceForMonth(apartment.priceHistory, year, month);

    if (!activeLease) {
        return {
            apartment,
            status: "vacant",
            payments: [],
            totalPaid: 0,
            deficit: 0,
            rentForMonth,
        };
    }

    // Get payments for this lease in this month
    const leasePayments = getPaymentsInMonth(payments, year, month).filter(
        (payment) => payment.leaseId === activeLease.id
    );

    const totalPaid = leasePayments.reduce((sum, p) => sum + p.amount, 0);
    const hasFullPayment = leasePayments.some((p) => p.isFullPayment);
    const isPaid = hasFullPayment || totalPaid >= rentForMonth;

    const status: ApartmentStatus = isPaid ? "paid" : "deficit";

    return {
        apartment,
        status,
        lease: activeLease,
        payments: leasePayments,
        totalPaid,
        deficit: Math.max(0, rentForMonth - totalPaid),
        rentForMonth,
    };
}

// Calculate dashboard summary
export function calculateDashboardSummary(
    apartments: Apartment[],
    leases: Lease[],
    payments: Payment[],
    year: number,
    month: number
) {
    const statuses = apartments.map((apt) =>
        calculateApartmentStatus(apt, leases, payments, year, month)
    );

    const expectedIncome = statuses
        .filter((s) => s.status !== "vacant")
        .reduce((sum, s) => sum + s.rentForMonth, 0);

    const collected = statuses.reduce((sum, s) => sum + s.totalPaid, 0);

    const missing = statuses
        .filter((s) => s.status === "deficit")
        .reduce((sum, s) => sum + s.deficit, 0);

    return {
        statuses,
        expectedIncome,
        collected,
        missing: Math.max(0, missing),
        occupiedCount: statuses.filter((s) => s.status !== "vacant").length,
        vacantCount: statuses.filter((s) => s.status === "vacant").length,
        paidCount: statuses.filter((s) => s.status === "paid").length,
        deficitCount: statuses.filter((s) => s.status === "deficit").length,
    };
}

// Calculate dashboard summary for a range
export function calculateRangeSummary(
    apartments: Apartment[],
    leases: Lease[],
    payments: Payment[],
    startYear: number,
    startMonth: number,
    endYear: number,
    endMonth: number
) {
    let currentYear = startYear;
    let currentMonth = startMonth;
    const endDate = new Date(endYear, endMonth);

    // Initialize aggregates
    let totalExpectedIncome = 0;
    let totalCollected = 0;
    let totalMissing = 0;
    
    // We'll track unique statuses across the range for counts? 
    // Or maybe average? For simplicity, let's just aggregate financials
    // and for counts, maybe we just show the status of the *current* (latest) month in the range?
    // Or we can say "Occupied" if occupied at any point?
    // Let's aggregate financials and for the list, we might need a different approach.
    // The requirement says "get the Overview of these months".
    // Usually this means financial totals. The "Status List" might be confusing for a range.
    // Let's assume the Status List should show the aggregate status for each apartment over the range.

    const apartmentAggregates = new Map<string, {
        apartment: Apartment;
        rentForPeriod: number;
        totalPaid: number;
        deficit: number;
        status: ApartmentStatus; // Overall status for the period
        lease?: Lease;
        payments: Payment[];
    }>();

    // Initialize map
    apartments.forEach(apt => {
        apartmentAggregates.set(apt.id, {
            apartment: apt,
            rentForPeriod: 0,
            totalPaid: 0,
            deficit: 0,
            status: 'vacant',
            payments: []
        });
    });

    while (new Date(currentYear, currentMonth) <= endDate) {
        const monthStatuses = apartments.map(apt => calculateApartmentStatus(apt, leases, payments, currentYear, currentMonth));

        monthStatuses.forEach(status => {
            const agg = apartmentAggregates.get(status.apartment.id)!;
            
            // Accumulate financials
            if (status.status !== 'vacant') {
                agg.rentForPeriod += status.rentForMonth;
                agg.totalPaid += status.totalPaid;
                agg.deficit += status.deficit;
                
                // If it was vacant, now it's occupied (at least partially)
                if (agg.status === 'vacant') {
                    agg.status = status.status;
                    agg.lease = status.lease; // Keep the first lease found? or last?
                } else if (status.status === 'deficit') {
                     // If any month has a deficit, the overall status is deficit (unless fully paid later? No, let's keep it simple)
                     // Actually, we should re-calculate status based on total rent vs total paid at the end.
                }
            }
            
            agg.payments.push(...status.payments);
        });

        // Increment month
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
    }

    // Finalize statuses
    const finalStatuses: ApartmentStatusInfo[] = Array.from(apartmentAggregates.values()).map(agg => {
        // Recalculate status based on totals
        let status: ApartmentStatus = 'vacant';
        if (agg.rentForPeriod > 0) {
            if (agg.totalPaid >= agg.rentForPeriod) {
                status = 'paid';
            } else {
                status = 'deficit';
            }
        } else {
             // If rent was 0, it might be vacant the whole time
             status = 'vacant';
        }

        return {
            apartment: agg.apartment,
            status: status,
            lease: agg.lease,
            payments: agg.payments, // This will contain duplicates if we just push. getPaymentsInMonth returns new array but objects are same ref.
            // Actually calculateApartmentStatus returns filtered list.
            // Let's deduplicate payments just in case, though logic above pushes unique month payments.
            totalPaid: agg.totalPaid,
            deficit: Math.max(0, agg.rentForPeriod - agg.totalPaid),
            rentForMonth: agg.rentForPeriod // This is now "Rent for Period"
        };
    });

    totalExpectedIncome = finalStatuses.filter(s => s.status !== 'vacant').reduce((sum, s) => sum + s.rentForMonth, 0);
    totalCollected = finalStatuses.reduce((sum, s) => sum + s.totalPaid, 0);
    totalMissing = finalStatuses.filter(s => s.status === 'deficit').reduce((sum, s) => sum + s.deficit, 0);

    return {
        statuses: finalStatuses,
        expectedIncome: totalExpectedIncome,
        collected: totalCollected,
        missing: totalMissing,
        occupiedCount: finalStatuses.filter((s) => s.status !== "vacant").length,
        vacantCount: finalStatuses.filter((s) => s.status === "vacant").length,
        paidCount: finalStatuses.filter((s) => s.status === "paid").length,
        deficitCount: finalStatuses.filter((s) => s.status === "deficit").length,
    };
}

// Format currency
export function formatCurrency(
    amount: number,
    currency: Currency = "MGA"
): string {
    const displayAmount = currency === "Fmg" ? amount * 5 : amount;
    const locale = "fr-MG"; // Malagasy locale for formatting

    if (currency === "MGA") {
        return displayAmount.toLocaleString(locale, {
            style: "currency",
            currency: "MGA",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    // Custom formatting for Fmg
    return `${displayAmount.toLocaleString(locale, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    })} Fmg`;
}

// Format date
export function formatDate(
    dateString: string,
    locale: string = "en-US"
): string {
    if (dateString === "9999-12-31") {
        return locale === "fr" ? "Présent" : "Present";
    }
    // Add a time to the date string to avoid timezone issues where it might be interpreted as the previous day
    const date = new Date(dateString.toString().split("T")[0] + "T00:00:00Z");
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

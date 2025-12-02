"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { calculateDashboardSummary, calculateRangeSummary } from "@/lib/rental-utils"
import { MonthPicker } from "./month-picker"
import { SummaryCards } from "./summary-cards"
import { StatusList } from "./status-list"
import { PaymentFormModal } from "./payment-form-modal"
import { LeaseFormModal } from "./lease-form-modal"
import * as actions from "@/app/actions"
import type { Apartment, Lease, Payment, Currency } from "@/types"
import { useLanguage } from "@/context/language-context"

interface DashboardViewProps {
  apartments: Apartment[]
  leases: Lease[]
  payments: Payment[]
  initialYear: number;
  initialMonth: number;
  currency: Currency;
}

export function DashboardView({ apartments, leases, payments, initialYear, initialMonth, currency }: DashboardViewProps) {
  const router = useRouter()
  const { t } = useLanguage();
  const [isPending, startTransition] = useTransition()
  
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)
  const [isRangeMode, setIsRangeMode] = useState(false)
  const [endYear, setEndYear] = useState(initialYear)
  const [endMonth, setEndMonth] = useState(initialMonth)

  const [paymentModal, setPaymentModal] = useState<{ open: boolean; leaseId: string; apartmentName: string; rentAmount?: number; alreadyPaid?: number }>({ open: false, leaseId: "", apartmentName: "" })
  const [leaseModal, setLeaseModal] = useState<{ open: boolean; apartmentId: string; apartmentName: string }>({ open: false, apartmentId: "", apartmentName: "" })

  const summary = useMemo(
    () => {
        if (isRangeMode) {
            // Ensure start is before end
            const start = new Date(year, month);
            const end = new Date(endYear, endMonth);
            if (start > end) {
                return calculateDashboardSummary(apartments, leases, payments, year, month); // Fallback or handle error?
                // For now, let's just swap them or assume user knows. 
                // Better: calculateRangeSummary handles it or we swap here.
                // Let's just pass as is, but logic in utils assumes start <= end loop.
                // Let's swap if needed for the calculation.
                 if (start > end) {
                     return calculateRangeSummary(apartments, leases, payments, endYear, endMonth, year, month);
                 }
                 return calculateRangeSummary(apartments, leases, payments, year, month, endYear, endMonth);
            }
            return calculateRangeSummary(apartments, leases, payments, year, month, endYear, endMonth);
        }
        return calculateDashboardSummary(apartments, leases, payments, year, month)
    },
    [apartments, leases, payments, year, month, isRangeMode, endYear, endMonth],
  )

  const handleAction = (action: () => Promise<any>) => {
    startTransition(async () => {
      await action()
      router.refresh()
    })
  }

  const handleMonthChange = (newYear: number, newMonth: number) => {
    setYear(newYear)
    setMonth(newMonth)
  }

  const handleEndMonthChange = (newYear: number, newMonth: number) => {
    setEndYear(newYear)
    setEndMonth(newMonth)
  }

  const handleAddPaymentClick = (leaseId: string, apartmentName: string, rentAmount: number, totalPaid: number) => {
    setPaymentModal({ open: true, leaseId, apartmentName, rentAmount, alreadyPaid: totalPaid })
  }

  const handleAddLeaseClick = (apartmentId: string, apartmentName: string) => {
    setLeaseModal({ open: true, apartmentId, apartmentName })
  }

  const handleSavePayment = async (data: Omit<Payment, "id">) => {
    handleAction(() => actions.createPayment(data));
    setPaymentModal({open: false, leaseId: "", apartmentName: ""})
  };

  const handleSaveLease = async (data: Omit<Lease, "id">) => {
    handleAction(() => actions.createLease(data));
    setLeaseModal({open: false, apartmentId: "", apartmentName: ""});
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-bold font-headline">{t('financial_overview')}</h2>
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center bg-muted p-1 rounded-lg border">
                <button
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${!isRangeMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
                    onClick={() => setIsRangeMode(false)}
                >
                    {t('single_month')}
                </button>
                <button
                    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${isRangeMode ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:bg-background/50'}`}
                    onClick={() => setIsRangeMode(true)}
                >
                    {t('range')}
                </button>
            </div>
            <div className="flex items-center gap-2">
                <MonthPicker year={year} month={month} onChange={handleMonthChange} />
                {isRangeMode && (
                    <>
                        <span className="text-muted-foreground">-</span>
                        <MonthPicker year={endYear} month={endMonth} onChange={handleEndMonthChange} />
                    </>
                )}
            </div>
        </div>
      </div>

      <SummaryCards
        expectedIncome={summary.expectedIncome}
        collected={summary.collected}
        missing={summary.missing}
        occupiedCount={summary.occupiedCount}
        vacantCount={summary.vacantCount}
        currency={currency}
      />

      <StatusList statuses={summary.statuses} onAddPayment={handleAddPaymentClick} onAddLease={handleAddLeaseClick} currency={currency} />

      <PaymentFormModal
        open={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, leaseId: "", apartmentName: "" })}
        onSave={handleSavePayment}
        leaseId={paymentModal.leaseId}
        apartmentName={paymentModal.apartmentName}
        rentAmount={paymentModal.rentAmount}
        alreadyPaid={paymentModal.alreadyPaid}
        targetMonth={month}
        targetYear={year}
        currency={currency}
      />

      <LeaseFormModal
        open={leaseModal.open}
        onClose={() => setLeaseModal({ open: false, apartmentId: "", apartmentName: "" })}
        onSave={handleSaveLease}
        apartmentId={leaseModal.apartmentId}
        apartmentName={leaseModal.apartmentName}
      />
    </div>
  )
}

"use client"

import { useState, useMemo, useTransition } from "react"
import { useRouter } from "next/navigation"
import { calculateDashboardSummary } from "@/lib/rental-utils"
import { MonthPicker } from "./month-picker"
import { SummaryCards } from "./summary-cards"
import { StatusList } from "./status-list"
import { PaymentFormModal } from "./payment-form-modal"
import { LeaseFormModal } from "./lease-form-modal"
import * as actions from "@/app/actions"
import type { Apartment, Lease, Payment } from "@/types"

interface DashboardViewProps {
  apartments: Apartment[]
  leases: Lease[]
  payments: Payment[]
  initialYear: number;
  initialMonth: number;
}

export function DashboardView({ apartments, leases, payments, initialYear, initialMonth }: DashboardViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [year, setYear] = useState(initialYear)
  const [month, setMonth] = useState(initialMonth)

  const [paymentModal, setPaymentModal] = useState<{ open: boolean; leaseId: string; apartmentName: string }>({ open: false, leaseId: "", apartmentName: "" })
  const [leaseModal, setLeaseModal] = useState<{ open: boolean; apartmentId: string; apartmentName: string }>({ open: false, apartmentId: "", apartmentName: "" })

  const summary = useMemo(
    () => calculateDashboardSummary(apartments, leases, payments, year, month),
    [apartments, leases, payments, year, month],
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

  const handleAddPaymentClick = (leaseId: string, apartmentName: string) => {
    setPaymentModal({ open: true, leaseId, apartmentName })
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
        <h2 className="text-2xl font-bold font-headline">Financial Overview</h2>
        <MonthPicker year={year} month={month} onChange={handleMonthChange} />
      </div>

      <SummaryCards
        expectedIncome={summary.expectedIncome}
        collected={summary.collected}
        missing={summary.missing}
        occupiedCount={summary.occupiedCount}
        vacantCount={summary.vacantCount}
      />

      <StatusList statuses={summary.statuses} onAddPayment={handleAddPaymentClick} onAddLease={handleAddLeaseClick} />

      <PaymentFormModal
        open={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, leaseId: "", apartmentName: "" })}
        onSave={handleSavePayment}
        leaseId={paymentModal.leaseId}
        apartmentName={paymentModal.apartmentName}
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

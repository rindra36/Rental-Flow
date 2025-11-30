"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ApartmentCard } from "./apartment-card"
import { ApartmentFormModal } from "./apartment-form-modal"
import { LeaseFormModal } from "./lease-form-modal"
import { LeaseManagementModal } from "./lease-management-modal"
import { PaymentFormModal } from "./payment-form-modal"
import { DeleteConfirmModal } from "./delete-confirm-modal"
import * as actions from "@/app/actions"
import type { Apartment, Lease, Payment, Currency } from "@/types"

interface ApartmentsViewProps {
  apartments: Apartment[]
  leases: Lease[]
  payments: Payment[]
  currency: Currency
}

export function ApartmentsView({ apartments, leases, payments, currency }: ApartmentsViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [apartmentModal, setApartmentModal] = useState<{ open: boolean; apartment: Apartment | null }>({ open: false, apartment: null })
  const [leaseManagementModal, setLeaseManagementModal] = useState<{ open: boolean; apartment: Apartment | null }>({ open: false, apartment: null })
  const [leaseModal, setLeaseModal] = useState<{ open: boolean; apartmentId: string; apartmentName: string; lease: Lease | null }>({ open: false, apartmentId: "", apartmentName: "", lease: null })
  const [paymentModal, setPaymentModal] = useState<{ open: boolean; leaseId: string; apartmentName: string }>({ open: false, leaseId: "", apartmentName: "" })
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; type: "apartment" | "lease" | "payment"; id: string; name: string }>({ open: false, type: "apartment", id: "", name: "" })

  const handleAction = (action: () => Promise<any>) => {
    startTransition(async () => {
      await action()
      router.refresh()
    })
  }

  const handleSaveApartment = async (data: { name: string; price: number }) => {
    handleAction(() => apartmentModal.apartment
      ? actions.updateApartment(apartmentModal.apartment.id, data)
      : actions.createApartment(data)
    )
  }

  const handleSaveLease = async (data: Omit<Lease, "id">) => {
    handleAction(() => leaseModal.lease
      ? actions.updateLease(leaseModal.lease.id, data)
      : actions.createLease(data)
    )
  }
  
  const handleSavePayment = async (data: Omit<Payment, "id">) => {
    handleAction(() => actions.createPayment(data));
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.type === "apartment") {
      handleAction(() => actions.deleteApartment(deleteModal.id))
    } else if (deleteModal.type === 'lease') {
      handleAction(() => actions.deleteLease(deleteModal.id))
    } else {
      handleAction(() => actions.deletePayment(deleteModal.id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold font-headline">Apartments</h2>
        <Button onClick={() => setApartmentModal({ open: true, apartment: null })}>
          <Plus className="h-4 w-4 mr-2" />
          Add Apartment
        </Button>
      </div>

      {apartments.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No apartments yet. Let's add one!</p>
          <Button onClick={() => setApartmentModal({ open: true, apartment: null })}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Apartment
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {apartments.map((apartment) => (
            <ApartmentCard
              key={apartment.id}
              apartment={apartment}
              leases={leases}
              onEdit={() => setApartmentModal({ open: true, apartment })}
              onDelete={() => setDeleteModal({ open: true, type: "apartment", id: apartment.id, name: apartment.name })}
              onManageLeases={() => setLeaseManagementModal({ open: true, apartment })}
              currency={currency}
            />
          ))}
        </div>
      )}

      <ApartmentFormModal
        open={apartmentModal.open}
        onClose={() => setApartmentModal({ open: false, apartment: null })}
        onSave={handleSaveApartment}
        apartment={apartmentModal.apartment}
      />

      {leaseManagementModal.apartment && (
        <LeaseManagementModal
          open={leaseManagementModal.open}
          onClose={() => setLeaseManagementModal({ open: false, apartment: null })}
          apartment={leaseManagementModal.apartment}
          leases={leases.filter(l => l.apartmentId === leaseManagementModal.apartment?.id)}
          payments={payments}
          onAddLease={() => {
            if (leaseManagementModal.apartment) {
              setLeaseModal({ open: true, apartmentId: leaseManagementModal.apartment.id, apartmentName: leaseManagementModal.apartment.name, lease: null })
            }
          }}
          onEditLease={(lease) => {
            if (leaseManagementModal.apartment) {
              setLeaseModal({ open: true, apartmentId: leaseManagementModal.apartment.id, apartmentName: leaseManagementModal.apartment.name, lease })
            }
          }}
          onDeleteLease={(lease) => setDeleteModal({ open: true, type: "lease", id: lease.id, name: lease.tenantName || "this lease" })}
          onAddPayment={(leaseId) => {
            if (leaseManagementModal.apartment) {
              setPaymentModal({ open: true, leaseId, apartmentName: leaseManagementModal.apartment.name })
            }
          }}
          onDeletePayment={(payment) => setDeleteModal({ open: true, type: "payment", id: payment.id, name: "this payment" })}
          currency={currency}
        />
      )}

      <LeaseFormModal
        open={leaseModal.open}
        onClose={() => setLeaseModal({ open: false, apartmentId: "", apartmentName: "", lease: null })}
        onSave={handleSaveLease}
        apartmentId={leaseModal.apartmentId}
        apartmentName={leaseModal.apartmentName}
        lease={leaseModal.lease}
      />

      <PaymentFormModal
        open={paymentModal.open}
        onClose={() => setPaymentModal({ open: false, leaseId: "", apartmentName: "" })}
        onSave={handleSavePayment}
        leaseId={paymentModal.leaseId}
        apartmentName={paymentModal.apartmentName}
      />

      <DeleteConfirmModal
        open={deleteModal.open}
        onClose={() => setDeleteModal({ open: false, type: "apartment", id: "", name: "" })}
        onConfirm={handleConfirmDelete}
        title={`Delete ${deleteModal.type === "apartment" ? "Apartment" : deleteModal.type === 'lease' ? "Lease" : "Payment"}?`}
        description={
          deleteModal.type === "apartment"
            ? `This will permanently delete "${deleteModal.name}" and all associated leases and payments.`
            : `This will permanently delete ${deleteModal.name} and all associated payments.`
        }
      />
    </div>
  )
}

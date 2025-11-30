"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDate, formatCurrency } from "@/lib/rental-utils"
import type { Apartment, Lease, Payment, Currency } from "@/types"
import { Separator } from "@/components/ui/separator"

interface LeaseManagementModalProps {
  open: boolean
  onClose: () => void
  apartment: Apartment | null
  leases: Lease[]
  payments: Payment[]
  onAddLease: () => void
  onEditLease: (lease: Lease) => void
  onDeleteLease: (lease: Lease) => void
  onAddPayment: (leaseId: string) => void
  onDeletePayment: (payment: Payment) => void
  currency: Currency
}

export function LeaseManagementModal({
  open,
  onClose,
  apartment,
  leases,
  payments,
  onAddLease,
  onEditLease,
  onDeleteLease,
  onAddPayment,
  onDeletePayment,
  currency,
}: LeaseManagementModalProps) {
  const [expandedLease, setExpandedLease] = useState<string | null>(null)

  if (!apartment) return null

  const sortedLeases = [...leases].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())

  const isLeaseActive = (lease: Lease) => {
    const now = new Date()
    const startDate = new Date(lease.startDate)
    const endDate = new Date(lease.endDate)
    // To include the end date, we can set the time to the end of the day
    endDate.setHours(23, 59, 59, 999);
    return startDate <= now && endDate >= now
  }

  const getLeasePayments = (leaseId: string) => {
    return payments.filter((p) => p.leaseId === leaseId).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Leases for {apartment.name}</DialogTitle>
          <DialogDescription>Base rent: {formatCurrency(apartment.price, currency)}/month</DialogDescription>
        </DialogHeader>

        <div className="flex justify-end items-center -mt-4">
          <Button onClick={onAddLease} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add New Lease
          </Button>
        </div>

        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-4">
            {sortedLeases.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No leases found for this apartment.</p>
            ) : (
              sortedLeases.map((lease) => {
                const leasePayments = getLeasePayments(lease.id)
                const isExpanded = expandedLease === lease.id
                const active = isLeaseActive(lease)

                return (
                  <div key={lease.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{lease.tenantName || "No tenant name"}</h4>
                          <Badge variant={active ? "default" : "secondary"}>{active ? "Active" : "Inactive"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => onAddPayment(lease.id)} aria-label="Add Payment">
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => onEditLease(lease)} aria-label="Edit Lease">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteLease(lease)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          aria-label="Delete Lease"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {leasePayments.length > 0 && <Separator />}

                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 h-auto text-sm"
                      onClick={() => setExpandedLease(isExpanded ? null : lease.id)}
                    >
                      {isExpanded ? "Hide" : "Show"} payments ({leasePayments.length})
                    </Button>

                    {isExpanded && (
                      <div className="mt-3 space-y-2">
                        {leasePayments.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No payments recorded for this lease.</p>
                        ) : (
                          leasePayments.map((payment) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm"
                            >
                              <div>
                                <span className="font-medium">{formatCurrency(payment.amount, currency)}</span>
                                <span className="text-muted-foreground ml-2">{formatDate(payment.date)}</span>
                                {payment.isFullPayment && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Full Payment
                                  </Badge>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                                onClick={() => onDeletePayment(payment)}
                                aria-label="Delete Payment"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}

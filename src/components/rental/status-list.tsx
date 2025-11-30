"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, User, Calendar } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/rental-utils"
import type { ApartmentStatusInfo, Currency } from "@/types"

interface StatusListProps {
  statuses: ApartmentStatusInfo[]
  onAddPayment: (leaseId: string, apartmentName: string) => void
  onAddLease: (apartmentId: string, apartmentName: string) => void
  currency: Currency
}

export function StatusList({ statuses, onAddPayment, onAddLease, currency }: StatusListProps) {
  const getStatusBadge = (status: ApartmentStatusInfo["status"]) => {
    switch (status) {
      case "vacant":
        return <Badge variant="secondary">Vacant</Badge>
      case "paid":
        return <Badge className="bg-emerald-600 hover:bg-emerald-700 text-emerald-50">Paid</Badge>
      case "deficit":
        return <Badge variant="destructive">Deficit</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Apartment Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {statuses.map((info) => (
            <div
              key={info.apartment.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg gap-4"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{info.apartment.name}</h3>
                  {getStatusBadge(info.status)}
                </div>
                <p className="text-sm text-muted-foreground">Base rent: {formatCurrency(info.apartment.price, currency)}</p>
                {info.lease && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-2">
                    {info.lease.tenantName && (
                      <span className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {info.lease.tenantName}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {formatDate(info.lease.startDate)} - {formatDate(info.lease.endDate)}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                {info.status !== "vacant" ? (
                  <>
                    <div className="text-left sm:text-right">
                      <p className="text-sm">
                        Collected:{" "}
                        <span className="font-semibold text-emerald-600">{formatCurrency(info.totalPaid, currency)}</span>
                      </p>
                      {info.deficit > 0 && !info.payments.some(p => p.isFullPayment) && (
                        <p className="text-sm">
                          Missing: <span className="font-semibold text-destructive">{formatCurrency(info.deficit, currency)}</span>
                        </p>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAddPayment(info.lease!.id, info.apartment.name)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Payment
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onAddLease(info.apartment.id, info.apartment.name)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Lease
                  </Button>
                )}
              </div>
            </div>
          ))}

          {statuses.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No apartments found. Add some apartments to get started.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

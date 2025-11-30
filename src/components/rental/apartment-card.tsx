"use client"

import { Pencil, Trash2, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate } from "@/lib/rental-utils"
import type { Apartment, Lease } from "@/types"

interface ApartmentCardProps {
  apartment: Apartment
  leases: Lease[]
  onEdit: () => void
  onDelete: () => void
  onManageLeases: () => void
}

export function ApartmentCard({ apartment, leases, onEdit, onDelete, onManageLeases }: ApartmentCardProps) {
  const apartmentLeases = leases.filter((l) => l.apartmentId === apartment.id)
  const activeLeases = apartmentLeases.filter((l) => new Date(l.endDate) >= new Date())

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-headline">{apartment.name}</CardTitle>
            <p className="text-2xl font-bold mt-1">{formatCurrency(apartment.price)}/mo</p>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={onEdit}>
              <Pencil className="h-4 w-4" />
              <span className="sr-only">Edit Apartment</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-destructive hover:text-destructive hover:bg-destructive/10">
              <Trash2 className="h-4 w-4" />
               <span className="sr-only">Delete Apartment</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Leases</span>
            <Badge variant={activeLeases.length > 0 ? "default" : "secondary"}>{activeLeases.length} active</Badge>
          </div>

          {activeLeases.length > 0 && (
            <div className="space-y-2">
              {activeLeases.slice(0, 2).map((lease) => (
                <div key={lease.id} className="text-sm p-2 bg-muted rounded">
                  <p className="font-medium">{lease.tenantName || "No tenant name"}</p>
                  <p className="text-muted-foreground text-xs">
                    {formatDate(lease.startDate)} - {formatDate(lease.endDate)}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={onManageLeases}>
            <FileText className="h-4 w-4 mr-2" />
            Manage Leases ({apartmentLeases.length})
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

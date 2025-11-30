"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Lease } from "@/types"
import { Loader2 } from "lucide-react"

interface LeaseFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Lease, "id">) => Promise<void>
  apartmentId: string
  apartmentName: string
  lease?: Lease | null
}

export function LeaseFormModal({ open, onClose, onSave, apartmentId, apartmentName, lease }: LeaseFormModalProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (open) {
      if (lease) {
        setStartDate(lease.startDate.split('T')[0])
        setEndDate(lease.endDate.split('T')[0])
        setTenantName(lease.tenantName || "")
      } else {
        const today = new Date()
        const start = new Date(today.getFullYear(), today.getMonth(), 1)
        const end = new Date(start.getFullYear() + 1, start.getMonth(), 0)
        setStartDate(start.toISOString().split("T")[0])
        setEndDate(end.toISOString().split("T")[0])
        setTenantName("")
      }
    }
  }, [lease, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !endDate) return

    startTransition(async () => {
        await onSave({
          apartmentId,
          startDate,
          endDate,
          tenantName: tenantName.trim() || undefined,
        })
        onClose()
    });
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{lease ? "Edit Lease" : "Add New Lease"}</DialogTitle>
          <DialogDescription>For apartment: {apartmentName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantName">Tenant Name (Optional)</Label>
            <Input
              id="tenantName"
              placeholder="e.g., John Smith"
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required disabled={isPending} />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Saving...' : (lease ? "Update Lease" : "Add Lease")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

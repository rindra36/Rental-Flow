"use client"

import type React from "react"

import { useState, useEffect, useTransition } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Lease } from "@/types"
import { Loader2 } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { useLanguage } from "@/context/language-context"

interface LeaseFormModalProps {
  open: boolean
  onClose: () => void
  onSave: (data: Omit<Lease, "id">) => Promise<void>
  apartmentId: string
  apartmentName: string
  lease?: Lease | null
}

export function LeaseFormModal({ open, onClose, onSave, apartmentId, apartmentName, lease }: LeaseFormModalProps) {
  const { t } = useLanguage();
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [tenantName, setTenantName] = useState("")
  const [isStillRenting, setIsStillRenting] = useState(false)
  const [isPending, startTransition] = useTransition();

  const farFutureDate = "9999-12-31";

  useEffect(() => {
    if (open) {
      if (lease) {
        setStartDate(lease.startDate.split('T')[0])
        const isOngoing = lease.endDate === farFutureDate;
        setIsStillRenting(isOngoing);
        setEndDate(isOngoing ? farFutureDate : lease.endDate.split('T')[0]);
        setTenantName(lease.tenantName || "")
      } else {
        const today = new Date()
        const start = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1))
        const end = new Date(Date.UTC(start.getFullYear() + 1, start.getMonth(), 0))
        setStartDate(start.toISOString().split("T")[0])
        setEndDate(end.toISOString().split("T")[0])
        setTenantName("")
        setIsStillRenting(false)
      }
    }
  }, [lease, open])

  useEffect(() => {
    if (isStillRenting) {
      setEndDate(farFutureDate)
    } else {
      // If user unchecks, and it was a far future date, revert to something reasonable.
      if (endDate === farFutureDate) {
          const start = new Date(startDate);
          const end = new Date(Date.UTC(start.getUTCFullYear() + 1, start.getUTCMonth(), start.getUTCDate()-1));
          setEndDate(end.toISOString().split("T")[0]);
      }
    }
  }, [isStillRenting, startDate]);

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
          <DialogTitle>{lease ? t('edit_lease') : t('add_new_lease')}</DialogTitle>
          <DialogDescription>{t('for_apartment')}: {apartmentName}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tenantName">{t('tenant_name_optional')}</Label>
            <Input
              id="tenantName"
              placeholder={t('tenant_name_placeholder')}
              value={tenantName}
              onChange={(e) => setTenantName(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">{t('start_date')}</Label>
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
              <Label htmlFor="endDate">{t('end_date')}</Label>
              <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required disabled={isPending || isStillRenting} />
            </div>
          </div>
           <div className="items-top flex space-x-2">
            <Checkbox
              id="isStillRenting"
              checked={isStillRenting}
              onCheckedChange={(checked) => setIsStillRenting(checked === true)}
              disabled={isPending}
            />
            <div className="grid gap-1.5 leading-none">
                <Label htmlFor="isStillRenting" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {t('tenant_is_renting')}
                </Label>
                <p className="text-sm text-muted-foreground">
                    {t('tenant_is_renting_description')}
                </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? t('saving') : (lease ? t('update_lease') : t('add_lease'))}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
